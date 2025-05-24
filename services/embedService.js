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
    const embedding = await this.generateEmbedding(text); // from AWS Bedrock
    if (!embedding || embedding.length !== 1024) {
      throw new Error(`Invalid embedding length for input: "${text.slice(0, 30)}..."`);
    }
    embeddings.push(embedding);
  }

  return embeddings;
};


exports.generateEmbedding = async (text) => {
  console.log("Getting here:: ", process.env.BEDROCK_MODEL_ID);
  
  const command = new InvokeModelCommand({
    modelId: process.env.BEDROCK_MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({ inputText: text })
  });

  const response = await bedrockClient.send(command);
  const responseBody = JSON.parse(Buffer.from(response.body).toString());
  // console.log("Response Body:::: ",responseBody);
  return responseBody.embedding;
};
