const rateLimit = require('express-rate-limit');
const { ApiError } = require('../utils/apiError');
const logger = require('../utils/logger');
const UserPlan = require('../models/userPlan.model');

// Create a store to track API usage per client
const apiUsageStore = new Map();

// Clean up usage data every day
setInterval(() => {
  apiUsageStore.clear();
}, 24 * 60 * 60 * 1000);

// Base rate limiter for unauthenticated routes
const baseRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for authentication routes
const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
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
    console.log(req.user.id);
    
    // Get client's active subscription
    const userPlan = await UserPlan.findOne({
      where: {
        userId: req.user.id,
        status: 'active'
      },
      include: ['Plan']
    });

    if (!userPlan) {
      throw new ApiError(403, 'No active subscription found');
    }

    const maxQueriesPerDay = userPlan.Plan.maxQueriesPerDay;
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
    res.setHeader('X-RateLimit-Limit', maxQueriesPerDay);
    res.setHeader('X-RateLimit-Remaining', maxQueriesPerDay - (usage + 1));
    res.setHeader('X-RateLimit-Reset', new Date(new Date().setHours(24, 0, 0, 0)).getTime());

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check storage limits
const storageLimitChecker = async (req, res, next) => {
  try {
    const userPlan = await UserPlan.findOne({
      where: {
        userId: req.user.id,
        status: 'active'
      },
      include: ['Plan']
    });

    if (!userPlan) {
      throw new ApiError(403, 'No active subscription found');
    }

    const maxStorageGB = userPlan.Plan.maxStorageGB;
    const currentStorageGB = userPlan.currentStorageUsageGB;

    logger.info(`Current storage usage: ${currentStorageGB} GB, Max storage: ${maxStorageGB} GB`);

    if (currentStorageGB >= maxStorageGB) {
      throw new ApiError(429, 'Storage limit exceeded. Please upgrade your plan for more storage.');
    }

    // Add file size check if request contains file
    if (req.file) {
      const fileSizeGB = req.file.size / (1024 * 1024 * 1024);
      if (currentStorageGB + fileSizeGB > maxStorageGB) {
        throw new ApiError(429, 'This file would exceed your storage limit. Please free up space or upgrade your plan.');
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