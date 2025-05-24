const { BedrockRuntimeClient } = require("@aws-sdk/client-bedrock-runtime");
const { S3Client } = require("@aws-sdk/client-s3");
require('dotenv').config();

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
const s3Client = new S3Client({ region: process.env.AWS_REGION });

module.exports = { bedrockClient, s3Client };
