'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('documents', 'widgetId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'chatbot_widgets',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add index for better performance
    await queryInterface.addIndex('documents', ['widgetId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('documents', ['widgetId']);
    await queryInterface.removeColumn('documents', 'widgetId');
  }
}; 