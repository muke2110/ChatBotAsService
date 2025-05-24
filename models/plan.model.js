const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const Plan = sequelize.define('Plan', {
  name: DataTypes.STRING,
  price: DataTypes.INTEGER, // in paisa
  features: DataTypes.JSONB
}, {
  timestamps: true
});

module.exports = Plan;
