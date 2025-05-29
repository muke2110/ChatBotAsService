const os = require('os');
const faiss = require('faiss-node');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const { s3Client } = require('../config/aws');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { pipeline } = require('stream');
const util = require('util');
require('dotenv').config();


const pipelineAsync = util.promisify(pipeline);
let localPath;
let textsPath;
let index = null;
let storedTexts = []; // In-memory storage for texts

exports.addToIndex = async (texts, embeddings, s3BucketLocation) => {
  localPath = path.join(__dirname, '..', 'index', `${s3BucketLocation}`, process.env.FAISS_INDEX_FILE);
  textsPath = path.join(__dirname, '..', 'index', `${s3BucketLocation}`, process.env.FAISS_TEXT_FILE); // Path for storing texts temp
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
  // console.log("Adding to index: num vectors =", embeddings.length, "dimension =", dimension);
  // console.log("Sample embedding[0]:", embeddings[0].slice(0, 10));

  for (let i = 0; i < embeddings.length; i++) {
    console.log(`Adding vector ${i + 1}/${embeddings.length}`);
    index.add(embeddings[i]); // Add single 1D array
    storedTexts.push(texts[i]); // Store corresponding text
  }

  // Storing in local REMOVE LATER
  await this.saveIndexToFile();
  await this.saveTextsToFile();

  // Uploading to s3 storage
  await this.uploadIndexToS3(s3BucketLocation);
  await this.uploadTextsToS3(s3BucketLocation);
};

// Local
exports.saveIndexToFile = async () => {
  if (!index) throw new Error("FAISS index not initialized");
  const dir = path.dirname(localPath);
  await fsPromises.mkdir(dir, { recursive: true }); // Ensure directory exists
  console.log("Saving index to:", localPath);
  index.write(localPath);
  console.log("Index saved successfully");
};

// Local
exports.saveTextsToFile = async () => {
  console.log("Saving texts to:", textsPath);
  const dir = path.dirname(textsPath);
  await fsPromises.mkdir(dir, { recursive: true }); // Ensure directory exists
  fs.writeFileSync(textsPath, JSON.stringify(storedTexts, null, 2));
  console.log("Texts saved successfully");
};

// Storing in s3
exports.uploadIndexToS3 = async (s3BucketLocation) => {
  const fileStream = fs.createReadStream(localPath);
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${s3BucketLocation}/${process.env.FAISS_S3_PATH}`, // Make this dynamic so that it stores in respected clients bucket
    Body: fileStream
  });
  console.log("Uploading index to S3:", process.env.FAISS_S3_PATH);
  await s3Client.send(command);
  console.log("Index uploaded to S3 successfully");
  await fs.promises.unlink(localPath);
  console.log("unlinked index succefully");
};

// Storing in s3
exports.uploadTextsToS3 = async (s3BucketLocation) => {
  const fileStream = fs.createReadStream(textsPath);
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key:  `${s3BucketLocation}/${process.env.FAISS_TEXT_PATH}`, // Make this dynamic so that it stores in respected clients bucket
    Body: fileStream
  });
  console.log("Uploading texts to S3: faiss/texts.json");
  await s3Client.send(command);
  console.log("Texts uploaded to S3 successfully");
  await fs.promises.unlink(textsPath);
  console.log("unlinked text succefully");

};

exports.loadIndexFromS3 = async (s3BucketLocation) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${s3BucketLocation}/${process.env.FAISS_S3_PATH}`,
    });

    const response = await s3Client.send(command);

    // Create a temp file to store the FAISS index
    const tempIndexPath = path.join(os.tmpdir(), `faiss-index-${Date.now()}.index`);

    const writeStream = fs.createWriteStream(tempIndexPath);
    await pipelineAsync(response.Body, writeStream);

    // console.log("Loading index from:", tempIndexPath);
    const index = faiss.IndexFlatL2.read(tempIndexPath);

    // console.log("Index loaded: dimension =", index.getDimension(), "ntotal =", index.ntotal());

    // Delete the temp file after reading
    await fs.promises.unlink(tempIndexPath);

    // Load texts for in-memory search
    // await this.loadTextsFromS3(s3BucketLocation);

    // Return the index
    return index;
  } catch (error) {
    console.error("Error loading index from S3:", error);
    throw new Error("Failed to load FAISS index from S3: " + error.message);
  }
};

exports.loadTextsFromS3 = async (s3BucketLocation) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${s3BucketLocation}/${process.env.FAISS_TEXT_PATH}`,
    });

    const response = await s3Client.send(command);

    // console.log("Loading texts from:", `${s3BucketLocation}/${process.env.FAISS_TEXT_PATH}`);
    const bodyString = await streamToString(response.Body);
    const storedTexts = JSON.parse(bodyString);

    // console.log("Texts loaded: count =", storedTexts.length);
    // console.log("stored text");
    
    return storedTexts;
  } catch (error) {
    console.error("Error loading texts from S3:", error);
    throw new Error("Failed to load texts from S3: " + error.message);
  }
};


const streamToString = async (stream) => {
  return await new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
};



exports.search = async(s3BucketLocation, index, queryEmbedding, k = 5) => {
  if (!index) throw new Error("FAISS index is not loaded");
  let storedTexts = await this.loadTextsFromS3(s3BucketLocation) 
  if (!storedTexts || storedTexts.length === 0) throw new Error("No texts available for search results");

  // Validate queryEmbedding
  if (!Array.isArray(queryEmbedding) || queryEmbedding.length !== 1024) {
    throw new Error(`Invalid query embedding: Expected 1024-dimensional array, got length ${queryEmbedding.length}`);
  }
  if (!queryEmbedding.every(val => typeof val === 'number' && !isNaN(val) && isFinite(val))) {
    throw new Error("Invalid query embedding: Contains NaN, undefined, or non-numeric values");
  }

  // Log query embedding for debugging
  // console.log("Query embedding length:", queryEmbedding.length);
  // console.log("Query embedding sample:", queryEmbedding.slice(0, 10));

  // Pass queryEmbedding as a 2D JavaScript array
  const result = index.search(queryEmbedding, k);
  // console.log("Search result:", result);

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