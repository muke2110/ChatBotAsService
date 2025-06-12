const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Payments', 'amount', {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Payments', 'amount', {
      type: DataTypes.INTEGER,
      allowNull: false
    });
  }
}; 