'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add lastPasswordReset column to Users table
    await queryInterface.addColumn('Users', 'lastPasswordReset', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Create Tokens table
    await queryInterface.createTable('Tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('email_verification', 'password_reset'),
        allowNull: false
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      used: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes
    await queryInterface.addIndex('Tokens', ['token']);
    await queryInterface.addIndex('Tokens', ['userId', 'type']);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove Tokens table
    await queryInterface.dropTable('Tokens');

    // Remove lastPasswordReset column from Users table
    await queryInterface.removeColumn('Users', 'lastPasswordReset');
  }
}; 