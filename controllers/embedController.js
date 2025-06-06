const fileService = require('../services/fileService');
const chunkService = require('../services/chunkService');
const embedService = require('../services/embedService');
const s3Service = require('../services/s3Service');
const ragService = require('../services/ragService');
const faissService = require('../services/faissService');
const { ApiError } = require('../utils/apiError');
const logger = require('../utils/logger');

exports.uploadAndEmbedFiles = async (req, res, next) => {
  try {
    const files = req.files;
    const modelPath = req.s3ModelPath;

    if (!files || files.length === 0) {
      throw new ApiError(400, 'No files uploaded');
    }

    if (!modelPath) {
      throw new ApiError(400, 'Model path is required');
    }

    logger.info(`Processing ${files.length} files for embedding`, {
      modelPath,
      fileCount: files.length
    });

    let allChunks = [];

    for (const file of files) {
      const text = await fileService.extractText(file);
      const chunks = chunkService.chunkText(text);
      allChunks = allChunks.concat(chunks);

      logger.info(`Processed file ${file.originalname}`, {
        modelPath,
        chunkCount: chunks.length
      });
    }

    const embeddings = await embedService.generateEmbeddings(allChunks);
    console.log("Embeddings:: ", embeddings.length);
    // Validate embeddings
    if (!embeddings || embeddings.length === 0) {
      throw new ApiError(500, 'Failed to generate embeddings');
    }

    // Validate embedding dimensions
    const embeddingDimension = embeddings[0]?.length;
    const inconsistentEmbedding = embeddings.find(e => e.length !== embeddingDimension);
    if (inconsistentEmbedding) {
      logger.error('Inconsistent embedding dimensions detected', {
        modelPath,
        expected: embeddingDimension,
        found: inconsistentEmbedding.length
      });
      throw new ApiError(500, 'Invalid embedding dimensions');
    }
    console.log("Before uploading to S3 and FAISS:: ");

    // Upload to S3 and add to FAISS index
    await Promise.all([
      s3Service.uploadEmbeddings(allChunks, embeddings, modelPath),
      faissService.addToIndex(allChunks, embeddings, modelPath)
    ]);
    console.log("After uploading to S3 and FAISS:: ");

    logger.info('Files processed and embeddings stored successfully', {
      modelPath,
      totalChunks: allChunks.length
    });

    res.status(200).json({
      success: true,
      message: 'Files processed and embeddings stored successfully',
      stats: {
        filesProcessed: files.length,
        chunksGenerated: allChunks.length,
        embeddingsStored: embeddings.length
      }
    });
  } catch (error) {
    logger.error('Error in uploadAndEmbedFiles', {
      error,
      modelPath: req.s3ModelPath
    });
    next(error);
  }
};

exports.queryEmbeddings = async (req, res, next) => {
  try {
    const { query, limit = 5 } = req.body;
    const modelPath = req.s3ModelPath;

    if (!query) {
      throw new ApiError(400, 'Query is required');
    }

    if (!modelPath) {
      throw new ApiError(400, 'Model path is required');
    }

    logger.info('Processing query request', {
      modelPath,
      queryLength: query.length
    });

    const queryEmbedding = await embedService.generateEmbeddings([query]);
    // logger.info('Query embeddings generated', { queryEmbedding });
    if (!queryEmbedding || queryEmbedding.length === 0) {
      throw new Error('Failed to generate query embedding');
    }

    const results = await faissService.search(queryEmbedding[0], limit, modelPath);
    if (!results || results.length === 0) {
      return res.json({
        answer: "I don't have any documents to search through yet. Please upload some documents first.",
        matches: [],
        status: "NO_DOCUMENTS"
      });
    }
    logger.info('Query processed successfully', {
      modelPath,
      resultCount: results.length
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

    // Generate response using RAG
    const finalResult = await ragService.generateResponse(query, context[0]);
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
      modelPath: req.s3ModelPath
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
      s3Service.deleteEmbeddings(`${modelPath}/${fileId}`),
      faissService.removeFromIndex(`${modelPath}/${fileId}`)
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