const { Client, ChatbotWidget, UserPlan, Plan } = require('../models');
const logger = require('../utils/logger');

// Get all widgets for a user
exports.getUserWidgets = async (req, res) => {
  try {
    const client = await Client.findOne({
      where: { userId: req.user.id }
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const widgets = await ChatbotWidget.findAll({
      where: { 
        userId: req.user.id,
        isActive: true 
      },
      order: [['widgetOrder', 'ASC']]
    });

    res.json({ widgets });
  } catch (error) {
    logger.error('Error getting user widgets:', error);
    res.status(500).json({ message: 'Failed to get widgets' });
  }
};

// Create a new widget
exports.createWidget = async (req, res) => {
  try {
    const { name, description } = req.body;

    const client = await Client.findOne({
      where: { userId: req.user.id }
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check user's plan to see how many widgets they can have
    const userPlan = await UserPlan.findOne({
      where: { userId: req.user.id },
      include: [{ model: Plan }],
      order: [['createdAt', 'DESC']]
    });

    if (!userPlan) {
      return res.status(403).json({ message: 'No active plan found' });
    }

    // Count existing widgets
    const existingWidgets = await ChatbotWidget.count({
      where: { 
        userId: req.user.id,
        isActive: true 
      }
    });

    if (existingWidgets >= userPlan.Plan.maxChatbotWidgets) {
      return res.status(403).json({ 
        message: `You can only have ${userPlan.Plan.maxChatbotWidgets} widgets with your current plan` 
      });
    }

    // Get the next widget order
    const nextOrder = existingWidgets + 1;

    const widget = await ChatbotWidget.create({
      userId: req.user.id,
      clientId: client.id,
      name: name || `Widget ${nextOrder}`,
      description,
      widgetOrder: nextOrder
    });

    res.status(201).json({ 
      message: 'Widget created successfully',
      widget 
    });
  } catch (error) {
    logger.error('Error creating widget:', error);
    res.status(500).json({ message: 'Failed to create widget' });
  }
};

// Update a widget
exports.updateWidget = async (req, res) => {
  try {
    const { widgetId } = req.params;
    const { name, description, settings, isActive } = req.body;

    const widget = await ChatbotWidget.findOne({
      where: { 
        widgetId,
        userId: req.user.id 
      }
    });

    if (!widget) {
      return res.status(404).json({ message: 'Widget not found' });
    }

    // Update only provided fields
    if (name !== undefined) widget.name = name;
    if (description !== undefined) widget.description = description;
    if (settings !== undefined) widget.settings = settings;
    if (isActive !== undefined) widget.isActive = isActive;

    await widget.save();

    res.json({ 
      message: 'Widget updated successfully',
      widget 
    });
  } catch (error) {
    logger.error('Error updating widget:', error);
    res.status(500).json({ message: 'Failed to update widget' });
  }
};

// Delete a widget
exports.deleteWidget = async (req, res) => {
  try {
    const { widgetId } = req.params;

    const widget = await ChatbotWidget.findOne({
      where: { 
        widgetId,
        userId: req.user.id 
      }
    });

    if (!widget) {
      return res.status(404).json({ message: 'Widget not found' });
    }

    // Soft delete by setting isActive to false
    widget.isActive = false;
    await widget.save();

    // Reorder remaining widgets
    const remainingWidgets = await ChatbotWidget.findAll({
      where: { 
        userId: req.user.id,
        isActive: true 
      },
      order: [['widgetOrder', 'ASC']]
    });

    // Update widget order for remaining widgets
    for (let i = 0; i < remainingWidgets.length; i++) {
      remainingWidgets[i].widgetOrder = i + 1;
      await remainingWidgets[i].save();
    }

    res.json({ message: 'Widget deleted successfully' });
  } catch (error) {
    logger.error('Error deleting widget:', error);
    res.status(500).json({ message: 'Failed to delete widget' });
  }
};

// Get widget by ID
exports.getWidget = async (req, res) => {
  try {
    const { widgetId } = req.params;

    const widget = await ChatbotWidget.findOne({
      where: { 
        widgetId,
        userId: req.user.id,
        isActive: true 
      }
    });

    if (!widget) {
      return res.status(404).json({ message: 'Widget not found' });
    }

    res.json({ widget });
  } catch (error) {
    logger.error('Error getting widget:', error);
    res.status(500).json({ message: 'Failed to get widget' });
  }
};

// Reorder widgets
exports.reorderWidgets = async (req, res) => {
  try {
    const { widgetOrders } = req.body; // Array of { widgetId, order }

    if (!Array.isArray(widgetOrders)) {
      return res.status(400).json({ message: 'Invalid widget orders format' });
    }

    // Update each widget's order
    for (const { widgetId, order } of widgetOrders) {
      const widget = await ChatbotWidget.findOne({
        where: { 
          widgetId,
          userId: req.user.id 
        }
      });

      if (widget) {
        widget.widgetOrder = order;
        await widget.save();
      }
    }

    res.json({ message: 'Widgets reordered successfully' });
  } catch (error) {
    logger.error('Error reordering widgets:', error);
    res.status(500).json({ message: 'Failed to reorder widgets' });
  }
};

// Update widget settings
exports.updateWidgetSettings = async (req, res) => {
  try {
    const { widgetId } = req.params;
    const { settings } = req.body;

    const widget = await ChatbotWidget.findOne({
      where: { 
        widgetId,
        userId: req.user.id,
        isActive: true 
      }
    });

    if (!widget) {
      return res.status(404).json({ message: 'Widget not found' });
    }

    // Update widget settings
    widget.settings = {
      ...widget.settings,
      ...settings
    };
    await widget.save();

    logger.info('Widget settings updated', {
      widgetId,
      userId: req.user.id,
      settings: widget.settings
    });

    res.json({
      message: 'Widget settings updated successfully',
      widget: {
        id: widget.id,
        widgetId: widget.widgetId,
        name: widget.name,
        settings: widget.settings
      }
    });
  } catch (error) {
    logger.error('Error updating widget settings:', error);
    res.status(500).json({ message: 'Failed to update widget settings' });
  }
}; 