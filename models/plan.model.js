const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

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
    type: DataTypes.INTEGER,  // Price in INR
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
  maxDocumentTokens: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  maxQueriesPerMonth: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  maxStorageMB: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  maxChatbotWidgets: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  supportedFileTypes: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  supportLevel: {
    type: DataTypes.STRING,
    allowNull: false
  },
  analyticsLevel: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isCustomBranding: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isTeamFeatures: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  // ✅ Newly added fields to fix the warning
  embeddingModel: {
    type: DataTypes.STRING,
    allowNull: true
  },
  responseModel: {
    type: DataTypes.STRING,
    allowNull: true
  },
  searchResults: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  maxVectorChunks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 500
  }

}, {
  timestamps: true
});

module.exports = Plan;
