const { S3Client, ListBucketsCommand, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { SESClient, GetSendQuotaCommand, SendEmailCommand } = require('@aws-sdk/client-ses');
const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const logger = require('../utils/logger');

// AWS Configuration
const awsConfig = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
};

// Initialize S3 client
const s3Client = new S3Client({
  ...awsConfig,
  // Enable acceleration if configured
  useAccelerateEndpoint: process.env.S3_USE_ACCELERATE === 'true',
  // Custom endpoint for testing or using alternatives like MinIO
  endpoint: process.env.S3_ENDPOINT,
  // Force path style for compatibility with some S3 alternatives
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true'
});

// Initialize SES client
const sesClient = new SESClient(awsConfig);

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  ...awsConfig,
  region: process.env.BEDROCK_REGION || process.env.AWS_REGION // Use specific region for Bedrock if provided
});

// Test S3 connection
async function testS3Connection() {
  try {
    await s3Client.send(new ListBucketsCommand({}));
    logger.info('S3 connection successful');
    return true;
  } catch (error) {
    logger.error('S3 connection failed:', error);
    return false;
  }
}

// Test SES connection
async function testSESConnection() {
  try {
    await sesClient.send(new GetSendQuotaCommand({}));
    logger.info('SES connection successful');
    return true;
  } catch (error) {
    logger.error('SES connection failed:', error);
    return false;
  }
}

// Test Bedrock connection
async function testBedrockConnection() {
  try {
    // We'll test the connection by checking if the client is properly initialized
    if (!bedrockClient) {
      throw new Error('Bedrock client not initialized');
    }
    logger.info('Bedrock connection initialized');
    return true;
  } catch (error) {
    logger.error('Bedrock connection failed:', error);
    return false;
  }
}

// Verify required environment variables
function verifyAWSConfig() {
  const requiredVars = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    const error = `Missing required AWS environment variables: ${missingVars.join(', ')}`;
    logger.error(error);
    throw new Error(error);
  }
}

// Helper function to generate presigned URLs
async function generatePresignedUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key
  });
  return getSignedUrl(s3Client, command, { expiresIn });
}

// Initialize AWS services
async function initializeAWS() {
  try {
    verifyAWSConfig();

    const [s3Connected, sesConnected, bedrockConnected] = await Promise.all([
      testS3Connection(),
      testSESConnection(),
      testBedrockConnection()
    ]);

    if (!s3Connected || !sesConnected || !bedrockConnected) {
      throw new Error('Failed to connect to AWS services');
    }

    logger.info('AWS services initialized successfully');
  } catch (error) {
    logger.error('AWS initialization failed:', error);
    throw error;
  }
}

// S3 operations
const s3Operations = {
  async upload(key, body, options = {}) {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: body,
      ...options
    });
    return s3Client.send(command);
  },

  async download(key) {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    });
    return s3Client.send(command);
  },

  async delete(key) {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    });
    return s3Client.send(command);
  },

  generatePresignedUrl
};

// SES operations
const sesOperations = {
  async sendEmail(params) {
    const command = new SendEmailCommand(params);
    return sesClient.send(command);
  }
};

module.exports = {
  s3Client,
  sesClient,
  bedrockClient,
  s3Operations,
  sesOperations,
  initializeAWS,
  generatePresignedUrl
};
