const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  fullName: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: DataTypes.STRING,
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  // keys: {
  //   type: DataTypes.ARRAY(DataTypes.STRING),
  //   defaultValue: []
  // }
  clientId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    defaultValue: () => `client_${uuidv4()}`
  },
}, {
  timestamps: true
});

module.exports = User;
