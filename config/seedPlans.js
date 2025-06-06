const { Plan } = require('../models');

const plans = [
    {
        name: 'Basic',
        description: 'Perfect for small businesses and startups',
        price: 999, // ₹999
        billingCycle: 'monthly',
        features: {
            support: 'Email',
            customization: false,
            analytics: false
        },
        maxDocuments: 50,
        maxStorageGB: 1,
        maxQueriesPerDay: 100,
        maxTokensPerQuery: 1000
    },
    {
        name: 'Professional',
        description: 'Ideal for growing businesses',
        price: 2999, // ₹2,999
        billingCycle: 'monthly',
        features: {
            support: '24/7 Email & Chat',
            customization: true,
            analytics: true
        },
        maxDocuments: 200,
        maxStorageGB: 5,
        maxQueriesPerDay: 500,
        maxTokensPerQuery: 2000
    },
    {
        name: 'Enterprise',
        description: 'For large organizations with custom needs',
        price: 9999, // ₹9,999
        billingCycle: 'monthly',
        features: {
            support: 'Priority 24/7',
            customization: true,
            analytics: true,
            dedicated: true
        },
        maxDocuments: 1000,
        maxStorageGB: 20,
        maxQueriesPerDay: 2000,
        maxTokensPerQuery: 4000
    }
];

async function seedPlans() {
    try {
        // Create plans if they don't exist
        for (const plan of plans) {
            await Plan.findOrCreate({
                where: { name: plan.name },
                defaults: plan
            });
        }
        console.log('Plans seeded successfully');
    } catch (error) {
        console.error('Error seeding plans:', error);
    }
}

module.exports = seedPlans; 