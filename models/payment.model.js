const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user.model');
const Plan = require('./plan.model');

const Payment = sequelize.define('Payment', {
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
  orderId: {
    type: DataTypes.STRING,
    unique: true
  },
  paymentId: {
    type: DataTypes.STRING,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('created', 'processing', 'paid', 'failed', 'refunded'),
    defaultValue: 'created'
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'INR'
  },
  paymentMethod: {
    type: DataTypes.STRING
  },
  billingCycle: {
    type: DataTypes.ENUM('monthly', 'yearly'),
    allowNull: false
  },
  subscriptionStartDate: {
    type: DataTypes.DATE
  },
  subscriptionEndDate: {
    type: DataTypes.DATE
  },
  failureReason: {
    type: DataTypes.STRING
  },
  refundReason: {
    type: DataTypes.STRING
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  invoiceUrl: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['orderId']
    },
    {
      fields: ['paymentId']
    },
    {
      fields: ['status']
    }
  ]
});

User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });
Plan.hasMany(Payment, { foreignKey: 'planId' });
Payment.belongsTo(Plan, { foreignKey: 'planId' });

module.exports = Payment;
