const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const ChatbotWidget = sequelize.define('ChatbotWidget', {
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
  widgetId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    defaultValue: () => `widget_${uuidv4()}`
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Chatbot Widget'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  s3Prefix: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: () => `widget_${uuidv4()}`
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  },
  widgetOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  timestamps: true,
  tableName: 'chatbot_widgets'
});

module.exports = ChatbotWidget; 