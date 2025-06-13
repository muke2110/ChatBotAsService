// Import models
const User = require('./user.model');
const Plan = require('./plan.model');
const UserPlan = require('./userPlan.model');
const Payment = require('./payment.model');
const Client = require('./client.model');
const Query = require('./query.model');
const Document = require('./document.model');

// Define associations
const initializeAssociations = () => {
    // User associations
    User.hasOne(Client, {
        foreignKey: 'userId',
        as: 'client'
    });
    User.hasMany(UserPlan, { foreignKey: 'userId' });
    User.hasMany(Payment, { foreignKey: 'userId' });

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
    initializeAssociations
}; 