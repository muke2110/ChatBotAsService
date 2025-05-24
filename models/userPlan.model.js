const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const User = require('./user.model');
const Plan = require('./plan.model');

const UserPlan = sequelize.define('UserPlan', {
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  planId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
}, {
  timestamps: true
});

User.hasMany(UserPlan, { foreignKey: 'userId' });
Plan.hasMany(UserPlan, { foreignKey: 'planId' });

UserPlan.belongsTo(User, { foreignKey: 'userId' });
UserPlan.belongsTo(Plan, { foreignKey: 'planId' });

module.exports = UserPlan;
