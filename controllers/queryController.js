const faissService = require('../services/faissService');
const embedService = require('../services/embedService');
const ragService = require('../services/ragService');

exports.handleQuery = async (req, res) => {
  try {

    // To get the s3Bucket location which is getting from the clientID (Middleware)
    // console.log("client s3ModelPath: ", req.s3ModelPath);

    const s3BucketLocation = req.s3ModelPath
 
    const query = req.body.query;
    if (!query) throw new Error('Query is required');

    // console.log('Processing query:', query);
    const queryEmbedding = await embedService.generateEmbeddings([query]);
    // console.log('Query embedding generated');


    const index = await faissService.loadIndexFromS3(s3BucketLocation);
    // console.log('FAISS index loaded');


    const results = await faissService.search(s3BucketLocation, index, queryEmbedding[0]);
    // console.log('Search results:', results);

    
    const totalText = results.map(result => result.text);
    // console.log('Total Text::::', totalText[0]);

    const finalResult = await ragService.generateResponse(query, totalText[0]);
    // console.log('Bedrock response:', finalResult);
    res.status(200).json({
      answer: finalResult,
      matches: results.map(result => ({
        text: result.text,
        index: result.index, 
        distance: result.distance
      }))
    });
  } catch (error) {
    console.error('Error in handleQuery:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};