const { bedrockClient } = require('../config/aws');
const { InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
require('dotenv').config();

exports.generateEmbeddings = async (texts) => {
  /**
 * Adds two numbers together.
 * @param {texts} a Total Text.
 * @returns {embeddings} Embedding of the given text
 * @throws {TypeError} If Text is not formated in correct way.
 */
  const embeddings = [];

  for (const text of texts) {
    const embedding = await exports.generateEmbedding(text);
    if (!embedding || embedding.length !== 1024) { // Titan model outputs 1024-dimensional vectors
      throw new Error(`Invalid embedding length for input: "${text.slice(0, 30)}..."`);
    }
    embeddings.push(embedding);
  }

  return embeddings;
};

exports.generateEmbedding = async (text) => {
  if (!bedrockClient) {
    throw new Error('AWS Bedrock client is not initialized');
  }

  // Prepare text input - clean and truncate if necessary
  const cleanedText = text.trim().replace(/\s+/g, ' ');
  const truncatedText = cleanedText.slice(0, 8000); // Titan model has an 8k token limit

  const command = new InvokeModelCommand({
    modelId: process.env.BEDROCK_MODEL_ID || 'amazon.titan-embed-text-v2:0',
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      inputText: truncatedText
    })
  });

  try {
    const response = await bedrockClient.send(command);
    if (!response || !response.body) {
      throw new Error('Invalid response from Bedrock');
    }
    
    const responseBody = JSON.parse(Buffer.from(response.body).toString());
    if (!responseBody.embedding) {
      throw new Error('No embedding in response');
    }
    
    return responseBody.embedding;
  } catch (error) {
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
};
