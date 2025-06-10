const Plan  = require('../models/plan.model');
const { v4: uuidv4 } = require('uuid');

const plans = [
    {
        id: uuidv4(),
        name: 'Starter',
        description: 'For small websites & startups',
        price: 799,
        billingCycle: 'monthly',
        features: {
            chatbotWidgets: 1,
            documentTokens: 5000,
            queriesPerMonth: 500,
            vectorStorage: '50MB',
            analytics: 'Basic analytics (daily active users, queries used)',
            support: 'Email support',
            idealFor: 'Startups, blogs, early-stage SaaS tools with limited documentation'
        },
        maxDocumentTokens: 5000,
        maxQueriesPerMonth: 500,
        maxStorageMB: 50,
        maxChatbotWidgets: 1,
        supportedFileTypes: ['PDF', 'TXT', 'Markdown'],
        supportLevel: 'email',
        analyticsLevel: 'basic',
        isCustomBranding: false,
        isTeamFeatures: false,
        isActive: true
    },
    {
        id: uuidv4(),
        name: 'Pro',
        description: 'For growing businesses',
        price: 1999,
        billingCycle: 'monthly',
        features: {
            chatbotWidgets: 2,
            documentTokens: 30000,
            queriesPerMonth: 5000,
            vectorStorage: '250MB',
            analytics: 'Advanced analytics (top queries, usage heatmap)',
            support: 'Priority Email & Slack support',
            customBranding: true,
            queryForwarding: true,
            idealFor: 'Growing companies, SaaS products, EdTech, Agencies'
        },
        maxDocumentTokens: 30000,
        maxQueriesPerMonth: 5000,
        maxStorageMB: 250,
        maxChatbotWidgets: 2,
        supportedFileTypes: ['PDF', 'DOCX', 'TXT', 'Markdown'],
        supportLevel: 'priority',
        analyticsLevel: 'advanced',
        isCustomBranding: true,
        isTeamFeatures: false,
        isActive: true
    },
    {
        id: uuidv4(),
        name: 'Enterprise',
        description: 'For scale-ups & teams',
        price: 4999,
        billingCycle: 'monthly',
        features: {
            chatbotWidgets: 3, // Unlimited
            documentTokens: 100000,
            queriesPerMonth: 20000,
            vectorStorage: '1GB',
            analytics: 'Advanced dashboard & custom reporting',
            support: 'SLA-backed support',
            customBranding: true,
            llmTuning: true,
            ssoLogin: true,
            integrations: true,
            dedicatedManager: true,
            idealFor: 'Midsize to large orgs, SaaS scale-ups, universities, help desks'
        },
        maxDocumentTokens: 100000,
        maxQueriesPerMonth: 20000,
        maxStorageMB: 1024, // 1GB
        maxChatbotWidgets: 3, // Unlimited
        supportedFileTypes: ['PDF', 'DOCX', 'TXT', 'Markdown', 'CSV', 'JSON'],
        supportLevel: 'dedicated',
        analyticsLevel: 'custom',
        isCustomBranding: true,
        isTeamFeatures: true,
        isActive: true
    }
];

const seedPlans = async () => {
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
};

module.exports = seedPlans; 