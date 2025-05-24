const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');
const User = require('./user.model');

const Payment = sequelize.define('Payment', {
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  orderId: DataTypes.STRING,
  paymentId: DataTypes.STRING,
  status: {
    type: DataTypes.ENUM('created', 'paid', 'failed'),
    defaultValue: 'created'
  },
  amount: DataTypes.INTEGER
}, {
  timestamps: true
});

User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });

module.exports = Payment;
