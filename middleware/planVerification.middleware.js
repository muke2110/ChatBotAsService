const { UserPlan } = require('../models');
const { ApiError } = require('../utils/apiError');
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
    next();
  } catch (error) {
    next(error);
  }
}; 