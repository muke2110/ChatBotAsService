const { ChatbotWidget, UserPlan, Plan } = require('../models');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Create widgets for a user based on their plan
exports.createWidgetsForUser = async (userId, clientId) => {
  try {
    // Get user's current plan
    const userPlan = await UserPlan.findOne({
      where: { userId, isActive: true },
      include: [{ model: Plan, as: 'plan' }],
      order: [['createdAt', 'DESC']]
    });

    if (!userPlan) {
      logger.info('No active plan found for user, skipping widget creation', { userId });
      return [];
    }

    // Check existing widgets
    const existingWidgets = await ChatbotWidget.count({
      where: { userId, isActive: true }
    });

    const widgetsNeeded = userPlan.plan.maxChatbotWidgets - existingWidgets;

    if (widgetsNeeded <= 0) {
      logger.info('User already has required number of widgets', { 
        userId, 
        existingWidgets, 
        maxWidgets: userPlan.plan.maxChatbotWidgets 
      });
      return [];
    }

    const widgetsToCreate = [];

    // Create missing widgets
    for (let i = 1; i <= widgetsNeeded; i++) {
      const widget = await ChatbotWidget.create({
        userId,
        clientId,
        widgetId: `widget_${uuidv4()}`,
        name: `${userPlan.plan.name} Widget ${existingWidgets + i}`,
        description: `Default widget for ${userPlan.plan.name} plan`,
        s3Prefix: `widget_${uuidv4()}`,
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
        widgetOrder: existingWidgets + i
      });

      widgetsToCreate.push(widget);
    }

    logger.info(`Created ${widgetsToCreate.length} widgets for user`, { 
      userId, 
      planName: userPlan.plan.name,
      widgetsCreated: widgetsToCreate.length 
    });

    return widgetsToCreate;
  } catch (error) {
    logger.error('Error creating widgets for user', { error, userId });
    throw error;
  }
};

// Get user's widgets
exports.getUserWidgets = async (userId) => {
  try {
    const widgets = await ChatbotWidget.findAll({
      where: { userId, isActive: true },
      order: [['widgetOrder', 'ASC']]
    });

    return widgets;
  } catch (error) {
    logger.error('Error getting user widgets', { error, userId });
    throw error;
  }
};

// Update widget settings
exports.updateWidgetSettings = async (widgetId, userId, settings) => {
  try {
    const widget = await ChatbotWidget.findOne({
      where: { widgetId, userId, isActive: true }
    });

    if (!widget) {
      throw new Error('Widget not found');
    }

    await widget.update({ settings });
    return widget;
  } catch (error) {
    logger.error('Error updating widget settings', { error, widgetId, userId });
    throw error;
  }
};

// Delete widget (soft delete)
exports.deleteWidget = async (widgetId, userId) => {
  try {
    const widget = await ChatbotWidget.findOne({
      where: { widgetId, userId, isActive: true }
    });

    if (!widget) {
      throw new Error('Widget not found');
    }

    // Soft delete
    await widget.update({ isActive: false });

    // Reorder remaining widgets
    const remainingWidgets = await ChatbotWidget.findAll({
      where: { userId, isActive: true },
      order: [['widgetOrder', 'ASC']]
    });

    for (let i = 0; i < remainingWidgets.length; i++) {
      await remainingWidgets[i].update({ widgetOrder: i + 1 });
    }

    return true;
  } catch (error) {
    logger.error('Error deleting widget', { error, widgetId, userId });
    throw error;
  }
}; 