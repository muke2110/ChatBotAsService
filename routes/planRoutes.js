const express = require('express');
const router = express.Router();
const { Plan, UserPlan } = require('../models');
const { authenticate } = require('../middleware/auth');

// Get all active plans
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.findAll({
      where: { isActive: true },
      attributes: [
        'id',
        'name',
        'description',
        'price',
        'billingCycle',
        'features',
        'maxDocumentTokens',
        'maxQueriesPerMonth',
        'maxStorageMB',
        'maxChatbotWidgets',
        'supportedFileTypes',
        'supportLevel',
        'analyticsLevel',
        'isCustomBranding',
        'isTeamFeatures',
        'isActive'
      ]
    });
    res.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Get current user's plan
router.get('/current', authenticate, async (req, res) => {
  try {
    const userPlan = await UserPlan.findOne({
      where: { 
        userId: req.user.id,
        status: 'active'
      },
      include: [{
        model: Plan,
        attributes: [
          'id',
          'name',
          'description',
          'price',
          'billingCycle',
          'features',
          'maxDocumentTokens',
          'maxQueriesPerMonth',
          'maxStorageMB',
          'maxChatbotWidgets',
          'supportedFileTypes',
          'supportLevel',
          'analyticsLevel',
          'isCustomBranding',
          'isTeamFeatures'
        ]
      }]
    });

    if (!userPlan) {
      return res.json(null);
    }

    // Combine plan data with subscription dates
    const response = {
      ...userPlan.Plan.toJSON(),
      startDate: userPlan.startDate,
      endDate: userPlan.endDate,
      status: userPlan.status
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching current plan:', error);
    res.status(500).json({ error: 'Failed to fetch current plan' });
  }
});

// Subscribe to a plan
router.post('/subscribe', authenticate, async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = await Plan.findByPk(planId);
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Create or update user's plan
    const [userPlan, created] = await UserPlan.findOrCreate({
      where: { userId: req.user.id },
      defaults: {
        userId: req.user.id,
        planId: plan.id,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        autoRenew: true
      }
    });

    if (!created) {
      await userPlan.update({
        planId: plan.id,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: true
      });
    }

    res.json({ success: true, plan });
  } catch (error) {
    console.error('Error subscribing to plan:', error);
    res.status(500).json({ error: 'Failed to subscribe to plan' });
  }
});

module.exports = router; 