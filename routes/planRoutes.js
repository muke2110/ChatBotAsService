const express = require('express');
const router = express.Router();
const { Plan } = require('../models');
const { authMiddleware } = require('../middleware/auth.middleware');

// Get all available plans
router.get('/', async (req, res) => {
    try {
        const plans = await Plan.findAll({
            where: { isActive: true },
            attributes: ['id', 'name', 'description', 'price', 'billingCycle', 'features', 
                       'maxDocuments', 'maxStorageGB', 'maxQueriesPerDay', 'maxTokensPerQuery']
        });
        res.json(plans);
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
});

// Get plan by ID
router.get('/:id', async (req, res) => {
    try {
        const plan = await Plan.findOne({
            where: { 
                id: req.params.id,
                isActive: true
            }
        });
        
        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }
        
        res.json(plan);
    } catch (error) {
        console.error('Error fetching plan:', error);
        res.status(500).json({ error: 'Failed to fetch plan details' });
    }
});

module.exports = router; 