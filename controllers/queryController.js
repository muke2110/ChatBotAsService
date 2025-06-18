const faissService = require('../services/faissService');
const embedService = require('../services/embedService');
const ragService = require('../services/ragService');
const { getModelConfig } = require('../utils/planUtils');
const logger = require('../utils/logger');
const { Client, ChatbotWidget, QueryAnalytics } = require('../models');

exports.handleQuery = async (req, res) => {
  const startTime = Date.now();
  let analyticsData = null;

  try {
    // Get the model path and widget info from the middleware
    const s3Prefix = req.s3Prefix;
    const widget = req.widget;
    const query = req.body.query;
    const userId = req.user.id; // Get user ID for plan-specific models
    
    if (!query) {
      throw new Error('Query is required');
    }

    if (!s3Prefix) {
      throw new Error('S3 prefix is required');
    }

    logger.info('Processing query request', {
      query: query.slice(0, 100), // Log first 100 chars of query
      s3Prefix,
      userId,
      widgetId: widget?.widgetId
    });

    // Get user's plan configuration for search results
    const modelConfig = await getModelConfig(userId);
    const searchResults = modelConfig.searchResults || 5; // Default to 5 if not specified

    // Generate query embedding using plan-specific model
    const queryEmbeddings = await embedService.generateEmbeddings([query], userId);
    logger.info('Query embeddings generated', { queryEmbeddings });
    if (!queryEmbeddings || queryEmbeddings.length === 0) {
      throw new Error('Failed to generate query embedding');
    }

    // Search for similar texts using the s3Prefix with plan-specific result count
    const results = await faissService.search(queryEmbeddings[0], searchResults, s3Prefix);
    
    let response = '';
    let status = 'success';

    if (!results || results.length === 0) {
      response = "I don't have any documents to search through yet. Please upload some documents first.";
      status = 'no_documents';
    } else {
      // Get the most relevant text
      const context = results.map(result => result.text).join('\n\n');

      // Generate response using plan-specific RAG model
      response = await ragService.generateResponse(query, context, userId);
    }

    const responseTime = Date.now() - startTime;

    // Track analytics if widget exists
    if (widget) {
      try {
        analyticsData = await QueryAnalytics.create({
          widgetId: widget.id,
          query: query,
          response: response,
          responseTime: responseTime,
          status: status,
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip || req.connection.remoteAddress,
          timestamp: new Date()
        });
      } catch (analyticsError) {
        logger.error('Failed to save analytics', { error: analyticsError.message });
        // Don't fail the request if analytics fails
      }
    }

    res.json({
      answer: response,
      matches: results ? results.map(result => ({
        text: result.text,
        score: result.score,
        distance: result.distance
      })) : [],
      status: status === 'success' ? "SUCCESS" : status.toUpperCase(),
      responseTime: responseTime
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    // Track error analytics if widget exists
    if (req.widget) {
      try {
        await QueryAnalytics.create({
          widgetId: req.widget.id,
          query: req.body.query || '',
          response: null,
          responseTime: responseTime,
          status: 'error',
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip || req.connection.remoteAddress,
          timestamp: new Date()
        });
      } catch (analyticsError) {
        logger.error('Failed to save error analytics', { error: analyticsError.message });
      }
    }

    logger.error('Error in handleQuery', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
};

// Test endpoint to verify plan-specific model configuration
exports.getModelConfiguration = async (req, res) => {
  try {
    const userId = req.user.id;
    const modelConfig = await getModelConfig(userId);
    
    res.json({
      success: true,
      modelConfiguration: modelConfig,
      message: 'Plan-specific model configuration retrieved successfully'
    });
  } catch (error) {
    logger.error('Error getting model configuration', {
      error: error.message,
      userId: req.user.id
    });
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
};