const express = require('express');
const router = express.Router();
const { UserPlan, Plan } = require('../models');
const { Op } = require('sequelize');
const { authMiddleware } = require('../middleware/auth.middleware');

// Get current user's subscription status
router.get('/status', authMiddleware, async (req, res) => {
    try {
        const userPlan = await UserPlan.findOne({
            where: {
                userId: req.user.id,
                status: 'active',
                endDate: {
                    [Op.gt]: new Date()
                }
            },
            include: [{
                model: Plan,
                attributes: ['name', 'features', 'maxDocuments', 'maxStorageGB', 'maxQueriesPerDay', 'maxTokensPerQuery']
            }]
        });

        if (!userPlan) {
            return res.status(404).json({ error: 'No active subscription found' });
        }

        res.json({
            subscription: userPlan,
            usage: {
                storageUsed: userPlan.currentStorageUsageGB,
                documentsUsed: userPlan.currentDocumentCount,
                queriesUsedToday: userPlan.queriesUsedToday
            }
        });
    } catch (error) {
        console.error('Error fetching subscription status:', error);
        res.status(500).json({ error: 'Failed to fetch subscription status' });
    }
});

// Get subscription history
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const subscriptions = await UserPlan.findAll({
            where: {
                userId: req.user.id
            },
            include: [{
                model: Plan,
                attributes: ['name', 'price', 'billingCycle']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json(subscriptions);
    } catch (error) {
        console.error('Error fetching subscription history:', error);
        res.status(500).json({ error: 'Failed to fetch subscription history' });
    }
});

module.exports = router; 