const os = require('os');
const faiss = require('faiss-node');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const { s3Client } = require('../config/aws');
const { 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  ListObjectsCommand 
} = require('@aws-sdk/client-s3');
const { pipeline } = require('stream');
const util = require('util');
const logger = require('../utils/logger');
const NodeCache = require('node-cache');
const { ApiError } = require('../utils/apiError');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const pipelineAsync = util.promisify(pipeline);

// Cache configuration
const indexCache = new NodeCache({
  stdTTL: 3600, // Cache for 1 hour
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false, // Store references to save memory
  maxKeys: 100 // Maximum number of indices to cache
});

class FaissService {
  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp');
    // Ensure temp directory exists
    fs.mkdirSync(this.tempDir, { recursive: true });
    logger.info('FAISS service initialized', { tempDir: this.tempDir });
  }

  async createIndex(vectors, dimension) {
    try {
      logger.info('Creating new FAISS index', { dimension });
      const index = new faiss.IndexFlatL2(dimension);
      await index.add(vectors);
      return index;
    } catch (error) {
      logger.error('Failed to create FAISS index', { error, dimension });
      throw new ApiError(500, 'Failed to create vector index');
    }
  }

  async saveIndex(index, modelPath) {
    try {
      console.log("Starting index save...");
      const indexPath = path.join(this.tempDir, `${modelPath.replace(/\//g, '_')}_latest.index`);
      console.log("Writing index to temp file:", indexPath);
      
      try {
        await index.write(indexPath); // Use instance write() method
        console.log("Index written to temp file");
      } catch (error) {
        console.error("Error writing index to temp file:", error);
        throw error;
      }

      const s3Key = `${modelPath}/index/latest.index`;
      console.log("Preparing S3 upload with bucket:", process.env.AWS_S3_BUCKET, "key:", s3Key);

      try {
        const fileStream = fs.createReadStream(indexPath);
        const command = new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: s3Key,
          Body: fileStream,
          ContentType: 'application/octet-stream'
        });

        console.log("Sending S3 upload command...");
        await s3Client.send(command);
        console.log("Index uploaded to S3 successfully");
      } catch (error) {
        console.error("Error uploading to S3:", error);
        throw error;
      }

      try {
        // Cleanup temp file
        fs.unlinkSync(indexPath);
        console.log("Temp file cleaned up");
      } catch (error) {
        console.error("Error cleaning up temp file:", error);
        // Don't throw here, as the upload was successful
      }

      logger.info(`Index saved for location ${modelPath}`);
    } catch (error) {
      console.error("Error in saveIndex:", error);
      logger.error('Failed to save index', { 
        error: error.message, 
        stack: error.stack,
        location: modelPath,
        bucket: process.env.AWS_S3_BUCKET
      });
      throw new ApiError(500, `Failed to save vector index: ${error.message}`);
    }
  }

  async loadIndex(modelPath, version = 'latest') {
    try {
      const cacheKey = `${modelPath}_${version}`;
      
      // Check cache first
      const cachedIndex = indexCache.get(cacheKey);
      if (cachedIndex) {
        logger.info('Index loaded from cache', { modelPath, version });
        return {
          index: cachedIndex.index,
          texts: cachedIndex.texts
        };
      }

      logger.info('Loading index from S3', { modelPath, version });
      const s3Key = `${modelPath}/index/${version}.index`;
      const tempPath = path.join(this.tempDir, `${cacheKey}.index`);

      try {
        // Download index from S3
        const command = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: s3Key
        });

        logger.info('Downloading index file', { bucket: process.env.AWS_S3_BUCKET, key: s3Key });
        const response = await s3Client.send(command);
        
        // Ensure temp directory exists
        await fsPromises.mkdir(path.dirname(tempPath), { recursive: true });
        
        logger.info('Writing index to temp file', { tempPath });
        await pipelineAsync(
          response.Body,
          fs.createWriteStream(tempPath)
        );

        // Load index
        logger.info('Reading index from temp file');
        const index = await faiss.IndexFlatL2.read(tempPath); // Use static read() method
        logger.info('Index loaded successfully', { dimension: 1024 });

        // Load texts
        logger.info('Loading associated texts');
        const texts = await this.loadTexts(modelPath, version);
        logger.info('Texts loaded successfully');

        // Cache the index and texts
        indexCache.set(cacheKey, { index, texts });
        logger.info('Index and texts cached');

        // Cleanup temp file
        try {
          await fsPromises.unlink(tempPath);
          logger.info('Temp file cleaned up');
        } catch (cleanupError) {
          logger.warn('Failed to cleanup temp file', { error: cleanupError, tempPath });
        }

        logger.info('Index loaded from S3', { modelPath, version });
        return { index, texts };
      } catch (error) {
        // Clean up temp file if it exists
        try {
          if (fs.existsSync(tempPath)) {
            await fsPromises.unlink(tempPath);
          }
        } catch (cleanupError) {
          logger.warn('Failed to cleanup temp file after error', { error: cleanupError, tempPath });
        }

        // Rethrow the original error
        throw error;
      }
    } catch (error) {
      logger.error('Failed to load index', { 
        error: {
          message: error.message,
          code: error.Code,
          name: error.name,
          stack: error.stack
        }, 
        modelPath, 
        version 
      });
      throw error;
    }
  }

  async loadTexts(modelPath, version = 'latest') {
    try {
      logger.info('Loading texts from S3', { modelPath, version });
      const s3Key = `${modelPath}/texts/${version}.json`;
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key
      });

      logger.info('Downloading texts file', { bucket: process.env.AWS_S3_BUCKET, key: s3Key });
      const response = await s3Client.send(command);
      const textsBuffer = await response.Body.transformToString();
      const texts = JSON.parse(textsBuffer);
      logger.info('Texts loaded successfully', { textCount: texts.length });
      return texts;
    } catch (error) {
      logger.error('Failed to load texts', { 
        error: {
          message: error.message,
          code: error.Code,
          name: error.name,
          stack: error.stack
        }, 
        modelPath, 
        version 
      });
      throw error;
    }
  }

  async search(queryVector, k = 5, modelPath) {
    try {
      logger.info('Starting vector search', { modelPath, k });

      // Validate input
      if (!queryVector || !Array.isArray(queryVector)) {
        throw new Error('Query vector must be an array');
      }

      if (queryVector.length !== 1024) {
        throw new Error(`Query vector must have 1024 dimensions, got ${queryVector.length}`);
      }

      // Try to load index and texts
      try {
        const { index, texts } = await this.loadIndex(modelPath);
        logger.info('Index and texts loaded successfully');

        // Perform search
        logger.info('Performing vector search');
        const { distances, labels } = await index.search(queryVector, k);
        logger.info('Search completed');

        // Map results to include texts
        const results = [];
        for (let i = 0; i < labels.length; i++) {
          if (labels[i] >= 0) { // Skip invalid indices
            results.push({
              text: texts[labels[i]],
              score: 1 / (1 + distances[i]), // Convert distance to similarity score
              index: labels[i],
              distance: distances[i]
            });
          }
        }

        logger.info('Search results processed', { numResults: results.length });
        return results;
      } catch (error) {
        // If the error is NoSuchKey, it means no index exists yet
        if (error.Code === 'NoSuchKey') {
          logger.info('No index exists yet for this model path', { modelPath });
          return [];
        }
        throw error;
      }
    } catch (error) {
      logger.error('Failed to perform vector search', { 
        error: {
          message: error.message,
          code: error.Code,
          name: error.name,
          stack: error.stack
        }, 
        modelPath 
      });
      throw new ApiError(500, `Failed to perform vector search: ${error.message}`);
    }
  }

  async addToIndex(texts, embeddings, modelPath) {
    try {
      console.log("Adding to index:: ");
      
      if (!embeddings || !Array.isArray(embeddings) || embeddings.length === 0) {
        throw new Error("Embeddings must be a non-empty array.");
      }
      if (!texts || !Array.isArray(texts) || texts.length !== embeddings.length) {
        throw new Error(`Texts array must match embeddings length: got ${texts?.length}, expected ${embeddings.length}`);
      }

      const dimension = embeddings[0].length;
      const expectedDimension = 1024; // Match AWS Bedrock Titan model's dimension
      if (!dimension || dimension === 0 || dimension !== expectedDimension) {
        throw new Error(`Expected embedding dimension ${expectedDimension}, got ${dimension}`);
      }

      console.log("Validating embeddings:: ");
      
      // Validate embeddings
      const isValid = embeddings.every(e =>
        Array.isArray(e) &&
        e.length === dimension &&
        e.every(val => typeof val === 'number' && !isNaN(val) && isFinite(val))
      );
      if (!isValid) {
        throw new Error("Invalid embeddings: Must be a 2D array of valid numbers.");
      }
      console.log("Validating embeddings:: ", isValid);
      
      // Create new index
      console.log("Creating FAISS index with dimension:", dimension);
      const index = new faiss.IndexFlatL2(dimension);
      console.log("FAISS index created successfully");

      // Add embeddings
      console.log("Adding embeddings to index...");
      for (let i = 0; i < embeddings.length; i++) {
        try {
          await index.add(embeddings[i]);
          console.log(`Added embedding ${i + 1}/${embeddings.length}`);
        } catch (error) {
          console.error(`Failed to add embedding ${i + 1}:`, error);
          throw error;
        }
      }
      console.log("All embeddings added to index");

      // Save index and texts
      console.log("Saving index to S3...");
      await this.saveIndex(index, modelPath);
      console.log("Index saved to S3");

      console.log("Saving texts to S3...");
      await this.saveTexts(texts, modelPath);
      console.log("Texts saved to S3");

      // Update cache
      console.log("Updating cache...");
      indexCache.set(modelPath, { index, texts });
      console.log("Cache updated");

      logger.info(`Successfully added ${embeddings.length} vectors to index`, {
        dimension,
        location: modelPath
      });
    } catch (error) {
      console.error("Error in addToIndex:", error);
      logger.error('Failed to add to index', { error, location: modelPath });
      throw new ApiError(500, 'Failed to add vectors to index');
    }
  }

  async saveTexts(texts, modelPath) {
    try {
      console.log("Starting texts save...");
      const s3Key = `${modelPath}/texts/latest.json`;
      console.log("Preparing S3 upload for texts with bucket:", process.env.AWS_S3_BUCKET, "key:", s3Key);

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key,
        Body: JSON.stringify(texts),
        ContentType: 'application/json'
      });

      console.log("Sending S3 upload command for texts...");
      await s3Client.send(command);
      console.log("Texts uploaded to S3 successfully");

      logger.info('Texts saved to S3', { location: modelPath });
    } catch (error) {
      console.error("Error in saveTexts:", error);
      logger.error('Failed to save texts', { 
        error: error.message, 
        stack: error.stack,
        location: modelPath,
        bucket: process.env.AWS_S3_BUCKET
      });
      throw new ApiError(500, `Failed to save texts: ${error.message}`);
    }
  }

  clearCache() {
    indexCache.flushAll();
    logger.info('Index cache cleared');
  }
}

// Export a singleton instance
const faissService = new FaissService();
module.exports = faissService;