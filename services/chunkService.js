const { getModelConfig } = require('../utils/planUtils');

exports.chunkText = async (text, userId = null, chunkSize = 1500, overlap = 150) => {
  // If userId is provided, get plan-specific chunk configuration
  if (userId) {
    try {
      const modelConfig = await getModelConfig(userId);
      // Use plan-specific maxVectorChunks to determine chunk size
      // Higher tier plans can have larger chunks for better context
      if (modelConfig.maxVectorChunks >= 2000) {
        chunkSize = 2000; // Pro and Enterprise plans
        overlap = 200;
      } else if (modelConfig.maxVectorChunks >= 1000) {
        chunkSize = 1500; // Basic plan
        overlap = 150;
      }
    } catch (error) {
      console.warn('Failed to get plan-specific chunk config, using defaults:', error.message);
    }
  }

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }

  return chunks;
};
