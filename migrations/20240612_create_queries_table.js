const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Queries', {
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
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
        type: DataTypes.INTEGER,
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
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // Add indexes
    await queryInterface.addIndex('Queries', ['clientId']);
    await queryInterface.addIndex('Queries', ['createdAt']);
    await queryInterface.addIndex('Queries', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Queries');
  }
}; 