const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QueryAnalytics = sequelize.define('QueryAnalytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  widgetId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'chatbot_widgets',
      key: 'id'
    }
  },
  query: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  responseTime: {
    type: DataTypes.INTEGER, // in milliseconds
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('success', 'error', 'no_documents'),
    allowNull: false
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'query_analytics',
  timestamps: true,
  indexes: [
    {
      fields: ['widgetId']
    },
    {
      fields: ['timestamp']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = QueryAnalytics; 