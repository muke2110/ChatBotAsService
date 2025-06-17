const faissService = require('../services/faissService');
const embedService = require('../services/embedService');
const ragService = require('../services/ragService');
const { getModelConfig } = require('../utils/planUtils');
const logger = require('../utils/logger');

exports.handleQuery = async (req, res) => {
  try {
    // Get the model path from the client middleware
    const modelPath = req.s3ModelPath;
    const query = req.body.query;
    const userId = req.user.id; // Get user ID for plan-specific models
    
    if (!query) {
      throw new Error('Query is required');
    }

    if (!modelPath) {
      throw new Error('Model path is required');
    }

    logger.info('Processing query request', {
      query: query.slice(0, 100), // Log first 100 chars of query
      modelPath,
      userId
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

    // Search for similar texts using the model path with plan-specific result count
    const results = await faissService.search(queryEmbeddings[0], searchResults, modelPath);
    if (!results || results.length === 0) {
      return res.json({
        answer: "I don't have any documents to search through yet. Please upload some documents first.",
        matches: [],
        status: "NO_DOCUMENTS"
      });
    }

    // Get the most relevant text
    const context = results.map(result => result.text).join('\n\n');

    // Generate response using plan-specific RAG model
    const finalResult = await ragService.generateResponse(query, context, userId);

    res.json({
      answer: finalResult,
      matches: results.map(result => ({
        text: result.text,
        score: result.score,
        distance: result.distance
      })),
      status: "SUCCESS"
    });
  } catch (error) {
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