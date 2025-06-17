const { UserPlan } = require('../models');
const { ApiError } = require('../utils/apiError');
const { getModelConfig } = require('../utils/planUtils');
const logger = require('../utils/logger');

exports.verifyActivePlan = async (req, res, next) => {
  try {
    const userPlan = await UserPlan.findOne({
      where: {
        userId: req.user.id,
        status: 'active'
      },
      include: ['Plan']
    });

    if (!userPlan) {
      logger.warn('No active plan found for user', { userId: req.user.id });
      throw new ApiError(403, 'No active subscription found. Please subscribe to a plan.');
    }

    // Check if plan has expired
    const now = new Date();
    if (userPlan.endDate && new Date(userPlan.endDate) < now) {
      await userPlan.update({ status: 'expired' });
      logger.warn('Plan expired for user', { userId: req.user.id, planId: userPlan.planId });
      throw new ApiError(403, 'Your subscription has expired. Please renew your plan.');
    }

    // Add plan details to request object for use in other middleware/controllers
    req.userPlan = userPlan;
    
    // Also add model configuration for easy access
    try {
      const modelConfig = await getModelConfig(req.user.id);
      req.modelConfig = modelConfig;
    } catch (error) {
      logger.warn('Failed to get model config for user', { userId: req.user.id, error: error.message });
      // Don't fail the request, just log the warning
    }
    
    next();
  } catch (error) {
    next(error);
  }
}; 