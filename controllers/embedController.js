const fileService = require('../services/fileService');
const chunkService = require('../services/chunkService');
const embedService = require('../services/embedService');
const s3Service = require('../services/s3Service');
const ragService = require('../services/ragService');
const faissService = require('../services/faissService');
const { ApiError } = require('../utils/apiError');
const logger = require('../utils/logger');
const { Client, Document } = require('../models');
const { getModelConfig } = require('../utils/planUtils');

exports.uploadAndEmbedFiles = async (req, res, next) => {
  try {
    const files = req.files;
    const modelPath = req.s3ModelPath;
    const userId = req.user.id; // Get user ID for plan-specific models
    
    const client = await Client.findOne({
      where: { s3ModelPath: modelPath }
    });

    if (!client) {
      throw new ApiError(404, 'Client not found');
    }

    if (!files || files.length === 0) {
      throw new ApiError(400, 'No files uploaded');
    }

    if (!modelPath) {
      throw new ApiError(400, 'Model path is required');
    }

    logger.info(`Processing ${files.length} files for embedding`, {
      modelPath,
      fileCount: files.length,
      userId
    });

    const processedDocuments = [];
    console.log("client.s3ModelPath:: ", client.s3ModelPath);

    for (const file of files) {
      // Create document record
      const document = await Document.create({
        clientId: client.id,
        name: file.originalname,
        size: file.size,
        status: 'processing',
        s3Key: `${client.s3ModelPath}`,
        chunkCount: 0,
        chunkPaths: []
      });
      console.log("document s3key:: ", document.s3Key);


      try {
        // Extract text and create chunks using plan-specific configuration
        const text = await fileService.extractText(file);
        const chunks = await chunkService.chunkText(text, userId);
        
        // Generate embeddings for chunks using plan-specific model
        const embeddings = await embedService.generateEmbeddings(chunks, userId);
        
        if (!embeddings || embeddings.length === 0) {
          throw new ApiError(500, 'Failed to generate embeddings');
        }

        // Upload chunks and embeddings to S3
        const s3Paths = await s3Service.uploadEmbeddings(chunks, embeddings, modelPath);
        
        // Add to FAISS index
        await faissService.addToIndex(chunks, embeddings, modelPath);

        // Update document with chunk information
        document.chunkCount = chunks.length;
        document.chunkPaths = s3Paths;
        document.status = 'completed';
        await document.save();

        processedDocuments.push(document);

        logger.info(`Processed file ${file.originalname}`, {
          modelPath,
          chunkCount: chunks.length,
          documentId: document.id,
          userId
        });
      } catch (error) {
        // Update document status to failed
        document.status = 'failed';
        await document.save();
        throw error;
      }
    }

    logger.info('Files processed and embeddings stored successfully', {
      modelPath,
      documentsProcessed: processedDocuments.length,
      userId
    });

    res.status(200).json({
      success: true,
      message: 'Files processed and embeddings stored successfully',
      documents: processedDocuments.map(doc => ({
        id: doc.id,
        name: doc.name,
        size: doc.size,
        status: doc.status,
        chunkCount: doc.chunkCount,
        createdAt: doc.createdAt
      }))
    });
  } catch (error) {
    logger.error('Error in uploadAndEmbedFiles', {
      error,
      modelPath: req.s3ModelPath,
      userId: req.user.id
    });
    next(error);
  }
};

exports.queryEmbeddings = async (req, res, next) => {
  try {
    const { query, limit = 5 } = req.body;
    const modelPath = req.s3ModelPath;
    const userId = req.user.id; // Get user ID for plan-specific models

    if (!query) {
      throw new ApiError(400, 'Query is required');
    }

    if (!modelPath) {
      throw new ApiError(400, 'Model path is required');
    }

    logger.info('Processing query request', {
      modelPath,
      queryLength: query.length,
      userId
    });

    // Get user's plan configuration for search results
    const modelConfig = await getModelConfig(userId);
    const searchResults = modelConfig.searchResults || limit; // Use plan-specific or provided limit

    // Generate query embedding using plan-specific model
    const queryEmbedding = await embedService.generateEmbeddings([query], userId);
    // logger.info('Query embeddings generated', { queryEmbedding });
    if (!queryEmbedding || queryEmbedding.length === 0) {
      throw new Error('Failed to generate query embedding');
    }

    const results = await faissService.search(queryEmbedding[0], searchResults, modelPath);
    if (!results || results.length === 0) {
      return res.json({
        answer: "I don't have any documents to search through yet. Please upload some documents first.",
        matches: [],
        status: "NO_DOCUMENTS"
      });
    }
    logger.info('Query processed successfully', {
      modelPath,
      resultCount: results.length,
      userId
    });

    // res.json({
    //   success: true,
    //   results: results.map(result => ({
    //     text: result.text,
    //     score: result.score
    //   })),
    //   status: results.length > 0 ? "SUCCESS" : "NO_DOCUMENTS",
    //   message: results.length > 0 ? 
    //     "Query processed successfully" : 
    //     "No documents found. Please upload some documents first."
    // });

    // Get the most relevant text
    const context = results.map(result => result.text);
    // console.log("context:: ", context[0]);

    // Generate response using plan-specific RAG model
    const finalResult = await ragService.generateResponse(query, context[0], userId);
    logger.info('Final result generated', { finalResult });
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
    logger.error('Error in queryEmbeddings', {
      error,
      modelPath: req.s3ModelPath,
      userId: req.user.id
    });
    next(error);
  }
};

exports.getEmbeddingStatus = async (req, res, next) => {
  try {
    const modelPath = req.s3ModelPath;

    if (!modelPath) {
      throw new ApiError(400, 'Model path is required');
    }

    const status = await s3Service.getEmbeddingStatus(modelPath);

    res.json({
      success: true,
      status: {
        totalFiles: status.fileCount,
        totalSize: status.totalSize,
        lastUpdated: status.lastUpdated
      }
    });
  } catch (error) {
    logger.error('Error in getEmbeddingStatus', {
      error,
      modelPath: req.s3ModelPath
    });
    next(error);
  }
};

exports.deleteEmbeddedFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const modelPath = req.s3ModelPath;

    if (!modelPath) {
      throw new ApiError(400, 'Model path is required');
    }

    await Promise.all([
      s3Service.deleteEmbeddings(`${modelPath}`),
      // faissService.removeFromIndex(`${modelPath}`)
    ]);

    logger.info('Embeddings deleted successfully', {
      modelPath,
      fileId
    });

    res.json({
      success: true,
      message: 'Embeddings deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteEmbeddedFile', {
      error,
      modelPath: req.s3ModelPath,
      fileId: req.params.fileId
    });
    next(error);
  }
};