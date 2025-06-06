const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Plan = sequelize.define('Plan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  billingCycle: {
    type: DataTypes.ENUM('monthly', 'yearly'),
    defaultValue: 'monthly'
  },
  features: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  maxDocuments: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  maxStorageGB: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  maxQueriesPerDay: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  maxTokensPerQuery: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

module.exports = Plan;
