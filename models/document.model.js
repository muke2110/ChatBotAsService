const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
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
  widgetId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'chatbot_widgets',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('processing', 'completed', 'failed'),
    defaultValue: 'processing'
  },
  s3Key: {
    type: DataTypes.STRING,
    allowNull: true
  },
  chunkCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  chunkPaths: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  tableName: 'documents',
  timestamps: true
});

module.exports = Document; 