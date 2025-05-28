const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  }
}, {
  timestamps: true
});

module.exports = Client;
