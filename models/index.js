// Import models
const User = require('./user.model');
const Plan = require('./plan.model');
const UserPlan = require('./userPlan.model');
const Payment = require('./payment.model');
const Client = require('./client.model');

// Define associations
const initializeAssociations = () => {
    // User associations
    User.hasOne(Client, {
        foreignKey: 'userId',
        as: 'Client'
    });
    User.hasMany(UserPlan, { foreignKey: 'userId' });
    User.hasMany(Payment, { foreignKey: 'userId' });

    // Client associations
    Client.belongsTo(User, {
        foreignKey: 'userId',
        as: 'User'
    });

    // Plan associations
    Plan.hasMany(UserPlan, { foreignKey: 'planId' });
    Plan.hasMany(Payment, { foreignKey: 'planId' });

    // UserPlan associations
    UserPlan.belongsTo(User, { foreignKey: 'userId' });
    UserPlan.belongsTo(Plan, { foreignKey: 'planId' });

    // Payment associations
    Payment.belongsTo(User, { foreignKey: 'userId' });
    Payment.belongsTo(Plan, { foreignKey: 'planId' });
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
    initializeAssociations
}; 