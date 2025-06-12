const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Query = sequelize.define('Query', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Clients',
      key: 'id'
    }
  },
  query: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  responseTime: {
    type: DataTypes.INTEGER, // in milliseconds
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  status: {
    type: DataTypes.ENUM('success', 'error'),
    allowNull: false,
    defaultValue: 'success'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tokensUsed: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['clientId']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Query; 