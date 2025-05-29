const { s3Client } = require('../config/aws');
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require('uuid');

exports.uploadEmbeddings = async (chunks, embeddings, s3BucketLocation) => {
  for (let i = 0; i < chunks.length; i++) {

    //Need to update the embeddings( Adding Client's bucket name for .json file extension with the client_id )

    const key = `embeddings/${s3BucketLocation}/${uuidv4()}.json`;
    const body = JSON.stringify({ text: chunks[i], embedding: embeddings[i] });

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: body
    });

    await s3Client.send(command);
  }
};
