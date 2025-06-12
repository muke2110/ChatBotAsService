const Client = require('../models/client.model');
const UserPlan = require('../models/userPlan.model');
const Plan = require('../models/plan.model');
const Query = require('../models/query.model');
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
        include: [{
          model: Plan
        }]
      }]
    });
    

    if (!client) {
      return res.status(404).json({
        status: 'error',
        message: 'Client not found'
      });
    }

    // Get current date for time-based queries
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

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
      documentCount: userPlan ? userPlan.currentDocumentCount : 0,
      storageUsed: userPlan ? userPlan.currentStorageUsageGB : 0,
      queries: {
        today: todayQueries,
        thisWeek: weekQueries,
        thisMonth: monthQueries
      },
      performance: {
        averageResponseTime: Math.round(avgResponseTime), // in milliseconds
        totalQueries: queryStats.count
      },
      plan: {
        name: userPlan?.Plan?.name || 'No Plan',
        status: userPlan?.status || 'inactive',
        expiresAt: userPlan?.endDate
      }
    };

    res.json(analytics);
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching analytics'
    });
  }
}; 