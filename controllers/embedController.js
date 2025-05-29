const fileService = require('../services/fileService');
const chunkService = require('../services/chunkService');
const embedService = require('../services/embedService');
const s3Service = require('../services/s3Service');
const faissService = require('../services/faissService');

exports.uploadAndEmbedFiles = async (req, res) => {
  try {
    const files = req.files;
    const s3BucketLocation = req.s3ModelPath
    let allChunks = [];

    for (const file of files) {
      const text = await fileService.extractText(file);
      const chunks = chunkService.chunkText(text);
      allChunks = allChunks.concat(chunks);
    }

    const embeddings = await embedService.generateEmbeddings(allChunks);

    // console.log("Embeddings length:", embeddings.length);
    // console.log("First embedding length:", embeddings[0]?.length);
    // console.log("Sample embedding:", embeddings[0]);
    // console.log("Any NaN/undefined:", embeddings.some(e => 
    //   e.some(val => val == null || isNaN(val) || !isFinite(val))
    // ));

    const inconsistent = embeddings.find(e => e.length !== embeddings[0]?.length);
    if (inconsistent) {
      console.error("❌ Inconsistent embedding found:", inconsistent.length);
    }


    // Also send the s3 Bucket Location to that s3Service function so that it can go their with respected bucket

    // await s3Service.uploadEmbeddings(allChunks, embeddings, s3BucketLocation);
    await faissService.addToIndex(allChunks, embeddings, s3BucketLocation); // Make async

    res.status(200).json({ message: 'Files processed and embeddings stored successfully.' });
  } catch (error) {
    console.error('Error in uploadAndEmbedFiles:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};