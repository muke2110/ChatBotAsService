const { Client, UserPlan, Query, Plan, Document, QueryAnalytics, ChatbotWidget } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get client info with user plan
    const client = await Client.findOne({
      where: { userId },
      include: [{
        model: UserPlan,
        as: 'userPlan',
        include: [Plan]
      }]
    });
    

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Get current date for time-based queries
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    // Get document count
    const documentCount = await Document.count({
      where: { clientId: client.id }
    });

    // Get query statistics
    const queryStats = await Query.findAndCountAll({
      where: {
        clientId: client.id,
        createdAt: {
          [Op.gte]: startOfMonth
        }
      },
      attributes: [
        'id',
        'responseTime',
        'createdAt'
      ]
    });

    // Calculate average response time
    const totalResponseTime = queryStats.rows.reduce((acc, query) => acc + query.responseTime, 0);
    const avgResponseTime = queryStats.rows.length > 0 ? totalResponseTime / queryStats.rows.length : 0;

    // Get queries by time period
    const todayQueries = queryStats.rows.filter(q => q.createdAt >= startOfToday).length;
    const weekQueries = queryStats.rows.filter(q => q.createdAt >= startOfWeek).length;
    const monthQueries = queryStats.rows.length;

    // Get user plan info
    const userPlan = client.userPlan;

    // Prepare response
    const analytics = {
      documentsUploaded: documentCount,
      totalChats: monthQueries,
      averageResponseTime: avgResponseTime < 1000 ? '< 1s' : `${Math.round(avgResponseTime / 1000)}s`,
      totalQueries: queryStats.count,
      plan: {
        name: userPlan?.plan?.name || 'No Plan',
        status: userPlan?.status || 'inactive',
        startDate: userPlan?.startDate || null,
        endDate: userPlan?.endDate || null
      }
    };

    res.json(analytics);
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

// Get widget-specific analytics
exports.getWidgetAnalytics = async (req, res) => {
  try {
    const { widgetId } = req.params;
    const { period = '7d' } = req.query; // 7d, 30d, 90d, 1y

    // Validate widget ownership
    const widget = await ChatbotWidget.findOne({
      where: { 
        widgetId,
        userId: req.user.id,
        isActive: true 
      }
    });

    if (!widget) {
      return res.status(404).json({ message: 'Widget not found' });
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get analytics data
    const analytics = await QueryAnalytics.findAll({
      where: {
        widgetId: widget.id,
        timestamp: {
          [Op.gte]: startDate
        }
      },
      order: [['timestamp', 'DESC']]
    });

    // Calculate metrics
    const totalQueries = analytics.length;
    const successfulQueries = analytics.filter(a => a.status === 'success').length;
    const errorQueries = analytics.filter(a => a.status === 'error').length;
    const noDocumentsQueries = analytics.filter(a => a.status === 'no_documents').length;
    
    const avgResponseTime = totalQueries > 0 
      ? analytics.reduce((sum, a) => sum + a.responseTime, 0) / totalQueries 
      : 0;

    const successRate = totalQueries > 0 ? (successfulQueries / totalQueries) * 100 : 0;

    // Daily breakdown for charts
    const dailyStats = {};
    analytics.forEach(analytics => {
      const date = analytics.timestamp.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          total: 0,
          success: 0,
          error: 0,
          noDocuments: 0,
          avgResponseTime: 0,
          responseTimes: []
        };
      }
      dailyStats[date].total++;
      dailyStats[date].responseTimes.push(analytics.responseTime);
      
      switch (analytics.status) {
        case 'success':
          dailyStats[date].success++;
          break;
        case 'error':
          dailyStats[date].error++;
          break;
        case 'no_documents':
          dailyStats[date].noDocuments++;
          break;
      }
    });

    // Calculate daily averages
    Object.keys(dailyStats).forEach(date => {
      const stats = dailyStats[date];
      stats.avgResponseTime = stats.responseTimes.length > 0 
        ? stats.responseTimes.reduce((sum, time) => sum + time, 0) / stats.responseTimes.length 
        : 0;
      delete stats.responseTimes;
    });

    // Recent queries (last 10)
    const recentQueries = analytics.slice(0, 10).map(a => ({
      id: a.id,
      query: a.query.substring(0, 100) + (a.query.length > 100 ? '...' : ''),
      response: a.response ? a.response.substring(0, 100) + (a.response.length > 100 ? '...' : '') : null,
      status: a.status,
      responseTime: a.responseTime,
      timestamp: a.timestamp
    }));

    res.json({
      widget: {
        id: widget.id,
        widgetId: widget.widgetId,
        name: widget.name
      },
      period,
      summary: {
        totalQueries,
        successfulQueries,
        errorQueries,
        noDocumentsQueries,
        successRate: Math.round(successRate * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime)
      },
      dailyStats,
      recentQueries
    });
  } catch (error) {
    logger.error('Error getting widget analytics:', error);
    res.status(500).json({ message: 'Failed to get analytics' });
  }
};

// Get all widgets analytics summary
exports.getAllWidgetsAnalytics = async (req, res) => {
  try {
    const { period = '7d' } = req.query;

    // Get user's widgets
    const widgets = await ChatbotWidget.findAll({
      where: { 
        userId: req.user.id,
        isActive: true 
      }
    });

    if (widgets.length === 0) {
      return res.json({
        widgets: [],
        totalQueries: 0,
        totalSuccessRate: 0,
        avgResponseTime: 0
      });
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const widgetIds = widgets.map(w => w.id);

    // Get analytics for all widgets
    const analytics = await QueryAnalytics.findAll({
      where: {
        widgetId: {
          [Op.in]: widgetIds
        },
        timestamp: {
          [Op.gte]: startDate
        }
      }
    });

    // Calculate per-widget metrics
    const widgetAnalytics = widgets.map(widget => {
      const widgetData = analytics.filter(a => a.widgetId === widget.id);
      const totalQueries = widgetData.length;
      const successfulQueries = widgetData.filter(a => a.status === 'success').length;
      const avgResponseTime = totalQueries > 0 
        ? widgetData.reduce((sum, a) => sum + a.responseTime, 0) / totalQueries 
        : 0;
      const successRate = totalQueries > 0 ? (successfulQueries / totalQueries) * 100 : 0;

      return {
        id: widget.id,
        widgetId: widget.widgetId,
        name: widget.name,
        totalQueries,
        successfulQueries,
        successRate: Math.round(successRate * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime)
      };
    });

    // Calculate overall metrics
    const totalQueries = analytics.length;
    const totalSuccessfulQueries = analytics.filter(a => a.status === 'success').length;
    const totalSuccessRate = totalQueries > 0 ? (totalSuccessfulQueries / totalQueries) * 100 : 0;
    const totalAvgResponseTime = totalQueries > 0 
      ? analytics.reduce((sum, a) => sum + a.responseTime, 0) / totalQueries 
      : 0;

    res.json({
      widgets: widgetAnalytics,
      summary: {
        totalQueries,
        totalSuccessRate: Math.round(totalSuccessRate * 100) / 100,
        avgResponseTime: Math.round(totalAvgResponseTime)
      }
    });
  } catch (error) {
    logger.error('Error getting all widgets analytics:', error);
    res.status(500).json({ message: 'Failed to get analytics' });
  }
}; 