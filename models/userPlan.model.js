const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Plan = require('./plan.model');

const UserPlan = sequelize.define('UserPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  planId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'cancelled', 'expired', 'suspended'),
    defaultValue: 'active'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  currentStorageUsageGB: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  currentDocumentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  queriesUsedToday: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastQueryReset: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  autoRenew: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  cancelledAt: {
    type: DataTypes.DATE
  },
  customSettings: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (userPlan) => {
      if (!userPlan.endDate) {
        const plan = await Plan.findByPk(userPlan.planId);
        const months = plan.billingCycle === 'yearly' ? 12 : 1;
        userPlan.endDate = new Date(userPlan.startDate);
        userPlan.endDate.setMonth(userPlan.endDate.getMonth() + months);
      }
    }
  }
});

module.exports = UserPlan;
