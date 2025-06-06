const { s3Client } = require('../config/aws');
const { 
  PutObjectCommand, 
  ListObjectsV2Command, 
  DeleteObjectCommand,
  HeadObjectCommand 
} = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

exports.uploadEmbeddings = async (chunks, embeddings, modelPath) => {
  try {
    logger.info("Starting embeddings upload to S3", { modelPath });
    
    const uploadPromises = chunks.map((chunk, i) => {
      const key = `${modelPath}/embeddings/${uuidv4()}.json`;
      const body = JSON.stringify({ 
        text: chunk, 
        embedding: embeddings[i],
        timestamp: new Date().toISOString()
      });

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: body,
        ContentType: 'application/json'
      });

      return s3Client.send(command);
    });
    
    await Promise.all(uploadPromises);
    logger.info(`Successfully uploaded ${chunks.length} embeddings to S3`, { modelPath });
  } catch (error) {
    logger.error('Error uploading embeddings to S3:', { error, modelPath });
    throw new Error('Failed to upload embeddings to S3');
  }
};

exports.getEmbeddingStatus = async (modelPath) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: `${modelPath}/embeddings/`
    });

    const response = await s3Client.send(command);
    
    if (!response.Contents) {
      return {
        fileCount: 0,
        totalSize: 0,
        lastUpdated: null
      };
    }

    const fileCount = response.Contents.length;
    const totalSize = response.Contents.reduce((acc, obj) => acc + obj.Size, 0);
    const lastUpdated = response.Contents.length > 0 
      ? response.Contents.sort((a, b) => b.LastModified - a.LastModified)[0].LastModified
      : null;

    return {
      fileCount,
      totalSize: Math.round(totalSize / 1024 / 1024 * 100) / 100, // Convert to MB with 2 decimal places
      lastUpdated
    };
  } catch (error) {
    logger.error('Error getting embedding status from S3:', { error, modelPath });
    throw new Error('Failed to get embedding status from S3');
  }
};

exports.deleteEmbeddings = async (modelPath) => {
  try {
    // First, list all objects with the prefix
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET,
      Prefix: `${modelPath}/embeddings/`
    });

    const response = await s3Client.send(listCommand);
    
    if (!response.Contents) {
      return;
    }

    // Delete all objects
    const deletePromises = response.Contents.map(obj => {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: obj.Key
      });
      return s3Client.send(deleteCommand);
    });

    await Promise.all(deletePromises);
    logger.info(`Successfully deleted ${response.Contents.length} embeddings from S3`, { modelPath });
  } catch (error) {
    logger.error('Error deleting embeddings from S3:', { error, modelPath });
    throw new Error('Failed to delete embeddings from S3');
  }
};
