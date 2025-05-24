const faiss = require('faiss-node');
const fs = require('fs');
const path = require('path');
const { s3Client } = require('../config/aws');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { pipeline } = require('stream');
const util = require('util');
require('dotenv').config();

const pipelineAsync = util.promisify(pipeline);
const localPath = path.join(__dirname, '..', process.env.FAISS_INDEX_FILE);
const textsPath = path.join(__dirname, '..', 'texts.json'); // Path for storing texts
let index = null;
let storedTexts = []; // In-memory storage for texts

exports.addToIndex = async (texts, embeddings) => {
  if (!embeddings || !Array.isArray(embeddings) || embeddings.length === 0) {
    throw new Error("Embeddings must be a non-empty array.");
  }
  if (!texts || !Array.isArray(texts) || texts.length !== embeddings.length) {
    throw new Error(`Texts array must match embeddings length: got ${texts?.length}, expected ${embeddings.length}`);
  }

  const dimension = embeddings[0].length;
  const expectedDimension = 1024; // Match amazon.titan-embed-text-v2:0
  if (!dimension || dimension === 0 || dimension !== expectedDimension) {
    throw new Error(`Expected embedding dimension ${expectedDimension}, got ${dimension}`);
  }

  // Validate embeddings
  const isValid = embeddings.every(e => 
    Array.isArray(e) && 
    e.length === dimension && 
    e.every(val => typeof val === 'number' && !isNaN(val) && isFinite(val))
  );
  if (!isValid) {
    throw new Error("Invalid embeddings: Must be a 2D array of valid numbers.");
  }

  // Initialize index if not already or if dimension mismatch
  if (!index || index.dimension !== dimension) {
    index = new faiss.IndexFlatL2(dimension);
    storedTexts = []; // Reset texts when initializing new index
  }

  // Store texts and add embeddings
  console.log("Adding to index: num vectors =", embeddings.length, "dimension =", dimension);
  console.log("Sample embedding[0]:", embeddings[0].slice(0, 10));
  for (let i = 0; i < embeddings.length; i++) {
    console.log(`Adding vector ${i + 1}/${embeddings.length}`);
    index.add(embeddings[i]); // Add single 1D array
    storedTexts.push(texts[i]); // Store corresponding text
  }

  await this.saveIndexToFile();
  await this.saveTextsToFile();
  await this.uploadIndexToS3();
  await this.uploadTextsToS3();
};

exports.saveIndexToFile = async () => {
  if (!index) throw new Error("FAISS index not initialized");
  console.log("Saving index to:", localPath);
  index.write(localPath);
  console.log("Index saved successfully");
};

exports.saveTextsToFile = async () => {
  console.log("Saving texts to:", textsPath);
  fs.writeFileSync(textsPath, JSON.stringify(storedTexts, null, 2));
  console.log("Texts saved successfully");
};

exports.uploadIndexToS3 = async () => {
  const fileStream = fs.createReadStream(localPath);
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: process.env.FAISS_S3_PATH,
    Body: fileStream
  });
  console.log("Uploading index to S3:", process.env.FAISS_S3_PATH);
  await s3Client.send(command);
  console.log("Index uploaded to S3 successfully");
};

exports.uploadTextsToS3 = async () => {
  const fileStream = fs.createReadStream(textsPath);
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: 'faiss/texts.json', // Store texts.json in S3
    Body: fileStream
  });
  console.log("Uploading texts to S3: faiss/texts.json");
  await s3Client.send(command);
  console.log("Texts uploaded to S3 successfully");
};

exports.loadIndexFromS3 = async () => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: process.env.FAISS_S3_PATH,
    });
    const response = await s3Client.send(command);
    const writeStream = fs.createWriteStream(localPath);
    await pipelineAsync(response.Body, writeStream);

    const indexDim = 1024; // Match amazon.titan-embed-text-v2:0
    console.log("Loading index from:", localPath);
    index = faiss.IndexFlatL2.read(localPath);
    console.log("Index loaded: dimension =", index.getDimension(), "ntotal =", index.ntotal());

    await this.loadTextsFromS3();
  } catch (error) {
    console.error("Error loading index from S3:", error);
    throw new Error("Failed to load FAISS index from S3: " + error.message);
  }
};

exports.loadTextsFromS3 = async () => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: 'faiss/texts.json',
    });
    const response = await s3Client.send(command);
    const writeStream = fs.createWriteStream(textsPath);
    await pipelineAsync(response.Body, writeStream);

    console.log("Loading texts from:", textsPath);
    storedTexts = JSON.parse(fs.readFileSync(textsPath));
    console.log("Texts loaded: count =", storedTexts.length);
  } catch (error) {
    console.error("Error loading texts from S3:", error);
    throw new Error("Failed to load texts from S3: " + error.message);
  }
};

exports.search = (queryEmbedding, k = 5) => {
  if (!index) throw new Error("FAISS index is not loaded");
  if (!storedTexts || storedTexts.length === 0) throw new Error("No texts available for search results");

  // Validate queryEmbedding
  if (!Array.isArray(queryEmbedding) || queryEmbedding.length !== 1024) {
    throw new Error(`Invalid query embedding: Expected 1024-dimensional array, got length ${queryEmbedding.length}`);
  }
  if (!queryEmbedding.every(val => typeof val === 'number' && !isNaN(val) && isFinite(val))) {
    throw new Error("Invalid query embedding: Contains NaN, undefined, or non-numeric values");
  }

  // Log query embedding for debugging
  console.log("Query embedding length:", queryEmbedding.length);
  console.log("Query embedding sample:", queryEmbedding.slice(0, 10));

  // Pass queryEmbedding as a 2D JavaScript array
  const result = index.search(queryEmbedding, k);
  console.log("Search result:", result);

  // Validate result
  if (!result.labels || !Array.isArray(result.labels) || result.labels.length !== k) {
    throw new Error(`Invalid search result: Expected ${k} labels, got ${result.labels?.length || 0}`);
  }
  if (!result.distances || !Array.isArray(result.distances) || result.distances.length !== k) {
    throw new Error(`Invalid search result: Expected ${k} distances, got ${result.distances?.length || 0}`);
  }

  // Map indices to text chunks
  // return result.labels.map((idx, i) => ({
  //   index: idx,
  //   text: storedTexts[idx] || "Text not found",
  //   distance: result.distances[i]
  // }));
  return result.labels.map((idx, i) => ({
    text: storedTexts[idx] || "Text not found",
  }));
};