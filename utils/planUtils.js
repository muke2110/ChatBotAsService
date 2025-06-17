const { UserPlan, Plan } = require('../models');

/**
 * Get the current active plan for a user
 * @param {string} userId - The user ID
 * @returns {Object} User plan with plan details
 */
const getUserPlan = async (userId) => {
  try {
    const userPlan = await UserPlan.findOne({
      where: { 
        userId: userId,
        status: 'active'
      },
      include: [{
        model: Plan,
        attributes: [
          'id',
          'name',
          'embeddingModel',
          'responseModel',
          'searchResults',
          'maxVectorChunks',
          'maxDocumentTokens',
          'maxQueriesPerMonth',
          'maxStorageMB'
        ]
      }]
    });

    if (!userPlan) {
      throw new Error('No active plan found for user');
    }

    return userPlan;
  } catch (error) {
    throw new Error(`Failed to get user plan: ${error.message}`);
  }
};

/**
 * Get model configuration based on plan
 * @param {string} userId - The user ID
 * @returns {Object} Model configuration
 */
const getModelConfig = async (userId) => {
  const userPlan = await getUserPlan(userId);
  
  return {
    embeddingModel: userPlan.Plan.embeddingModel,
    responseModel: userPlan.Plan.responseModel,
    searchResults: userPlan.Plan.searchResults,
    maxVectorChunks: userPlan.Plan.maxVectorChunks,
    maxDocumentTokens: userPlan.Plan.maxDocumentTokens,
    maxQueriesPerMonth: userPlan.Plan.maxQueriesPerMonth,
    maxStorageMB: userPlan.Plan.maxStorageMB
  };
};

/**
 * Map model names to Bedrock model IDs
 * @param {string} modelName - The model name from plan
 * @returns {string} Bedrock model ID
 */
const getBedrockModelId = (modelName) => {
  const modelMap = {
    'Titan Text Embeddings V2': 'amazon.titan-embed-text-v2:0',
    'Titan Multimodal Embeddings G1': 'amazon.titan-embed-image-v1',
    'Titan Text G1 - Express': 'amazon.titan-text-express-v1:0',
    'Llama 3 70B': 'meta.llama3-70b-instruct-v1:0'
  };

  return modelMap[modelName] || 'amazon.titan-embed-text-v2:0'; // Default fallback
};

module.exports = {
  getUserPlan,
  getModelConfig,
  getBedrockModelId
}; 