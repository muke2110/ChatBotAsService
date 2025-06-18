// Import models
const User = require('./user.model');
const Plan = require('./plan.model');
const UserPlan = require('./userPlan.model');
const Payment = require('./payment.model');
const Client = require('./client.model');
const Query = require('./query.model');
const Document = require('./document.model');
const ChatbotWidget = require('./chatbotWidget.model');
const QueryAnalytics = require('./queryAnalytics.model');

// Define associations
const initializeAssociations = () => {
    // User associations
    User.hasOne(Client, {
        foreignKey: 'userId',
        as: 'client'
    });
    User.hasMany(UserPlan, { foreignKey: 'userId' });
    User.hasMany(Payment, { foreignKey: 'userId' });
    User.hasMany(ChatbotWidget, { foreignKey: 'userId' });

    // Client associations
    Client.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });
    Client.hasOne(UserPlan, {
        foreignKey: 'userId',
        sourceKey: 'userId',
        as: 'userPlan'
    });
    Client.hasMany(Query, {
        foreignKey: 'clientId',
        as: 'queries'
    });
    Client.hasMany(Document, {
        foreignKey: 'clientId',
        as: 'documents'
    });
    Client.hasMany(ChatbotWidget, {
        foreignKey: 'clientId',
        as: 'chatbotWidgets'
    });

    // Plan associations
    Plan.hasMany(UserPlan, { foreignKey: 'planId' });
    Plan.hasMany(Payment, { foreignKey: 'planId' });

    // UserPlan associations
    UserPlan.belongsTo(User, { foreignKey: 'userId' });
    UserPlan.belongsTo(Plan, { foreignKey: 'planId' });
    UserPlan.belongsTo(Client, {
        foreignKey: 'userId',
        targetKey: 'userId',
        as: 'client'
    });

    // Payment associations
    Payment.belongsTo(User, { foreignKey: 'userId' });
    Payment.belongsTo(Plan, { foreignKey: 'planId' });

    // Query associations
    Query.belongsTo(Client, {
        foreignKey: 'clientId',
        as: 'client'
    });

    // Document associations
    Document.belongsTo(Client, {
        foreignKey: 'clientId',
        as: 'client'
    });
    Document.belongsTo(ChatbotWidget, {
        foreignKey: 'widgetId',
        as: 'widget'
    });

    // ChatbotWidget associations
    ChatbotWidget.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });
    ChatbotWidget.belongsTo(Client, {
        foreignKey: 'clientId',
        as: 'client'
    });
    ChatbotWidget.hasMany(Document, {
        foreignKey: 'widgetId',
        as: 'documents'
    });
    ChatbotWidget.hasMany(QueryAnalytics, {
        foreignKey: 'widgetId',
        as: 'analytics'
    });

    // QueryAnalytics associations
    QueryAnalytics.belongsTo(ChatbotWidget, {
        foreignKey: 'widgetId',
        as: 'widget'
    });
};

// Initialize associations
initializeAssociations();

// Export models
module.exports = {
    User,
    Plan,
    UserPlan,
    Payment,
    Client,
    Query,
    Document,
    ChatbotWidget,
    QueryAnalytics,
    initializeAssociations
}; 