const { Client, UserPlan, Query, Plan, Document } = require('../models');
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