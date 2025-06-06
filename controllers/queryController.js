const faissService = require('../services/faissService');
const embedService = require('../services/embedService');
const ragService = require('../services/ragService');
const logger = require('../utils/logger');

exports.handleQuery = async (req, res) => {
  try {
    // Get the model path from the client middleware
    const modelPath = req.s3ModelPath;
    const query = req.body.query;
    
    if (!query) {
      throw new Error('Query is required');
    }

    if (!modelPath) {
      throw new Error('Model path is required');
    }

    logger.info('Processing query request', {
      query: query.slice(0, 100), // Log first 100 chars of query
      modelPath
    });

    // Generate query embedding
    const queryEmbeddings = await embedService.generateEmbeddings([query]);
    logger.info('Query embeddings generated', { queryEmbeddings });
    if (!queryEmbeddings || queryEmbeddings.length === 0) {
      throw new Error('Failed to generate query embedding');
    }

    // Search for similar texts using the model path
    const results = await faissService.search(queryEmbeddings[0], 5, modelPath);
    if (!results || results.length === 0) {
      return res.json({
        answer: "I don't have any documents to search through yet. Please upload some documents first.",
        matches: [],
        status: "NO_DOCUMENTS"
      });
    }

    // Get the most relevant text
    const context = results.map(result => result.text).join('\n\n');

    // Generate response using RAG
    const finalResult = await ragService.generateResponse(query, context);

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