const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  clientId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  name: DataTypes.STRING,
  s3ModelPath: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    defaultValue: () => `bkt_${uuidv4()}`
  },
  settings: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      theme: {
        primaryColor: '#0ea5e9',
        textColor: '#ffffff',
        backgroundColor: '#1f2937'
      },
      position: 'bottom-right',
      welcomeMessage: 'Hello! How can I help you today?',
      botName: 'AI Assistant'
    }
  }
}, {
  timestamps: true
});

module.exports = Client;
