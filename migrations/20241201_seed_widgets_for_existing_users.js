'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get all users with active plans
    const usersWithPlans = await queryInterface.sequelize.query(`
      SELECT 
        u.id as userId,
        c.id as clientId,
        p.maxChatbotWidgets,
        p.name as planName
      FROM users u
      JOIN clients c ON u.id = c.userId
      JOIN user_plans up ON u.id = up.userId
      JOIN plans p ON up.planId = p.id
      WHERE up.isActive = true
      ORDER BY up.createdAt DESC
    `, { type: Sequelize.QueryTypes.SELECT });

    const widgetsToCreate = [];

    for (const user of usersWithPlans) {
      // Check if user already has widgets
      const existingWidgets = await queryInterface.sequelize.query(`
        SELECT COUNT(*) as count FROM chatbot_widgets 
        WHERE userId = :userId AND isActive = true
      `, {
        replacements: { userId: user.userId },
        type: Sequelize.QueryTypes.SELECT
      });

      const currentWidgetCount = existingWidgets[0].count;
      const widgetsNeeded = user.maxChatbotWidgets - currentWidgetCount;

      if (widgetsNeeded > 0) {
        // Create missing widgets
        for (let i = 1; i <= widgetsNeeded; i++) {
          const widgetId = `widget_${uuidv4()}`;
          const s3Prefix = `widget_${uuidv4()}`;
          
          widgetsToCreate.push({
            id: uuidv4(),
            userId: user.userId,
            clientId: user.clientId,
            widgetId: widgetId,
            name: `${user.planName} Widget ${currentWidgetCount + i}`,
            description: `Default widget for ${user.planName} plan`,
            s3Prefix: s3Prefix,
            isActive: true,
            settings: {
              theme: {
                primaryColor: '#0ea5e9',
                textColor: '#ffffff',
                backgroundColor: '#1f2937'
              },
              position: 'bottom-right',
              welcomeMessage: 'Hello! How can I help you today?',
              botName: 'AI Assistant'
            },
            widgetOrder: currentWidgetCount + i,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    }

    if (widgetsToCreate.length > 0) {
      await queryInterface.bulkInsert('chatbot_widgets', widgetsToCreate);
      console.log(`Created ${widgetsToCreate.length} widgets for existing users`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all widgets created by this migration
    await queryInterface.sequelize.query(`
      DELETE FROM chatbot_widgets 
      WHERE name LIKE '%Widget%' AND description LIKE '%Default widget for%'
    `);
  }
}; 