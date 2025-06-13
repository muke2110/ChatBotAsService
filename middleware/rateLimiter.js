const rateLimit = require('express-rate-limit');
const { ApiError } = require('../utils/apiError');
const logger = require('../utils/logger');
const UserPlan = require('../models/userPlan.model');
const Plan = require('../models/plan.model');

// Create a store to track API usage per client
const apiUsageStore = new Map();

// Clean up usage data every day
setInterval(() => {
  apiUsageStore.clear();
}, 24 * 60 * 60 * 1000);

// Base rate limiter for unauthenticated routes
const baseRateLimiter = rateLimit({
  windowMs:  60 * 1000, // 5 minutes
  max: 200, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for authentication routes
const authRateLimiter = rateLimit({
  windowMs: 60 * 100, // 10 minutes
  max: 5, // Limit each IP to 5 login attempts per hour
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Dynamic rate limiter based on subscription plan
const planBasedRateLimiter = async (req, res, next) => {
  try {
    const clientId = req.clientId;
    if (!clientId) {
      throw new ApiError(401, 'Client ID not found');
    }
    const userId = req.user.id;
    
    // Get userPlan with associated Plan details
    const userPlan = await UserPlan.findOne({ 
      where: { userId: userId },
      include: [{
        model: Plan,
        attributes: ['maxQueriesPerMonth', 'maxStorageMB']
      }]
    });

    if (!userPlan || !userPlan.Plan) {
      throw new ApiError(403, 'No active plan found');
    }

    const maxQueriesPerDay = userPlan.Plan.maxQueriesPerMonth / 30; // Convert monthly to daily
    const currentDate = new Date().toDateString();
    const usageKey = `${clientId}_${currentDate}`;

    // Get current usage
    let usage = apiUsageStore.get(usageKey) || 0;

    // Check if limit exceeded
    if (usage >= maxQueriesPerDay) {
      logger.warn(`Rate limit exceeded for client ${clientId}`, {
        usage,
        limit: maxQueriesPerDay,
        userId: req.user.id
      });

      throw new ApiError(429, 'Daily query limit exceeded. Please upgrade your plan for more queries.');
    }

    // Increment usage
    apiUsageStore.set(usageKey, usage + 1);

    // Update queries used in UserPlan
    await userPlan.update({
      queriesUsedToday: usage + 1,
      lastQueryReset: new Date()
    });

    // Add rate limit info to response headers
    res.setHeader('X-RateLimit-Limit', Math.floor(maxQueriesPerDay));
    res.setHeader('X-RateLimit-Remaining', Math.floor(maxQueriesPerDay - (usage + 1)));
    res.setHeader('X-RateLimit-Reset', new Date(new Date().setHours(24, 0, 0, 0)).getTime());

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check storage limits
const storageLimitChecker = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get userPlan with associated Plan details
    const userPlan = await UserPlan.findOne({ 
      where: { userId: userId },
      include: [{
        model: Plan,
        attributes: ['maxQueriesPerMonth', 'maxStorageMB']
      }]
    });

    if (!userPlan || !userPlan.Plan) {
      throw new ApiError(403, 'No active plan found');
    }

    const maxStorageMB = userPlan.Plan.maxStorageMB;
    const currentStorageMB = userPlan.currentStorageUsageGB * 1024; // Convert GB to MB

    logger.info(`Current storage usage: ${currentStorageMB} MB, Max storage: ${maxStorageMB} MB`);

    if (currentStorageMB >= maxStorageMB) {
      throw new ApiError(429, 'Storage limit exceeded. Please upgrade your plan for more storage.');
    }

    // Add file size check if request contains files
    if (req.files && req.files.length > 0) {
      const totalFileSizeMB = req.files.reduce((acc, file) => acc + (file.size / (1024 * 1024)), 0);
      if (currentStorageMB + totalFileSizeMB > maxStorageMB) {
        throw new ApiError(429, 'These files would exceed your storage limit. Please free up space or upgrade your plan.');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  baseRateLimiter,
  authRateLimiter,
  planBasedRateLimiter,
  storageLimitChecker
}; 