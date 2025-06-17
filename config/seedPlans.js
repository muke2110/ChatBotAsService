const Plan = require('../models/plan.model');
const { v4: uuidv4 } = require('uuid');

const plans = [
    {
        id: uuidv4(),
        name: 'Basic',
        description: 'For individuals and small projects needing basic PDF search and chatbot functionality',
        price: 799,
        billingCycle: 'monthly',
        features: {
            chatbotWidgets: 1,
            embeddingModel: 'Titan Text Embeddings V2',
            responseModel: 'Titan Text G1 - Express',
            pdfUploadLimit: '3 files/month (max 5MB)',
            vectorChunks: 500,
            searchResults: 1,
            documentTokens: 5000,
            queriesPerMonth: 500,
            vectorStorage: '50MB',
            analytics: 'None',
            support: 'Community support',
            idealFor: 'Startups, blogs, basic bots with minimal documents'
        },
        maxDocumentTokens: 5000,
        maxQueriesPerMonth: 500,
        maxStorageMB: 50,
        maxChatbotWidgets: 1,
        supportedFileTypes: ['PDF', 'TXT', 'Markdown'],
        embeddingModel: 'Titan Text Embeddings V2',
        responseModel: 'Titan Text G1 - Express',
        searchResults: 1,
        maxVectorChunks: 500,
        supportLevel: 'community',
        analyticsLevel: 'none',
        isCustomBranding: false,
        isTeamFeatures: false,
        isActive: true
    },
    {
        id: uuidv4(),
        name: 'Pro',
        description: 'For small teams or businesses needing multilingual and better-quality embeddings',
        price: 1999,
        billingCycle: 'monthly',
        features: {
            chatbotWidgets: 2,
            embeddingModel: 'Titan Multimodal Embeddings G1',
            responseModel: 'Llama 3 70B',
            pdfUploadLimit: '50 files/month (max 20MB)',
            vectorChunks: 2000,
            searchResults: 3,
            documentTokens: 30000,
            queriesPerMonth: 5000,
            vectorStorage: '250MB',
            analytics: 'Basic analytics (query volume, usage)',
            support: 'Priority Email support',
            customBranding: true,
            idealFor: 'SaaS tools, EdTech, multilingual Q&A bots'
        },
        maxDocumentTokens: 30000,
        maxQueriesPerMonth: 5000,
        maxStorageMB: 250,
        maxChatbotWidgets: 2,
        supportedFileTypes: ['PDF', 'DOCX', 'TXT', 'Markdown'],
        embeddingModel: 'Titan Multimodal Embeddings G1',
        responseModel: 'Llama 3 70B',
        searchResults: 3,
        maxVectorChunks: 2000,
        supportLevel: 'priority',
        analyticsLevel: 'basic',
        isCustomBranding: true,
        isTeamFeatures: false,
        isActive: true
    },
    {
        id: uuidv4(),
        name: 'Enterprise',
        description: 'For large organizations with heavy file loads, advanced RAG, and internal knowledge bots',
        price: 4999,
        billingCycle: 'monthly',
        features: {
            chatbotWidgets: 3,
            embeddingModel: 'Titan Multimodal Embeddings G1',
            responseModel: 'Llama 3 70B',
            pdfUploadLimit: 'Unlimited (max 100MB)',
            vectorChunks: 10000,
            searchResults: 5,
            documentTokens: 100000,
            queriesPerMonth: 20000,
            vectorStorage: '1GB',
            analytics: 'Advanced analytics & insights dashboard',
            support: 'SLA-backed support with onboarding',
            customBranding: true,
            ssoLogin: true,
            integrations: true,
            dedicatedManager: true,
            idealFor: 'Enterprises, large SaaS orgs, universities, knowledge bases'
        },
        maxDocumentTokens: 100000,
        maxQueriesPerMonth: 20000,
        maxStorageMB: 1024,
        maxChatbotWidgets: 3,
        supportedFileTypes: ['PDF', 'DOCX', 'TXT', 'Markdown', 'CSV', 'JSON'],
        embeddingModel: 'Titan Multimodal Embeddings G1',
        responseModel: 'Llama 3 70B',
        searchResults: 5,
        maxVectorChunks: 10000,
        supportLevel: 'dedicated',
        analyticsLevel: 'advanced',
        isCustomBranding: true,
        isTeamFeatures: true,
        isActive: true
    }
];

const seedPlans = async () => {
    try {
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
