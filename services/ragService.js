const { bedrockClient } = require('../config/aws');
const { InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { getModelConfig, getBedrockModelId } = require('../utils/planUtils');

exports.generateResponse = async (query, contexts, userId) => {
  // Get user's plan configuration
  const modelConfig = await getModelConfig(userId);
  const responseModelId = getBedrockModelId(modelConfig.responseModel);

  const prompt = `Based on the following Context:
${contexts}

Question: ${query}
Answer:`;

  // Prepare request body depending on the model
  let bodyPayload;

  if (responseModelId.startsWith('amazon.titan-text')) {
    bodyPayload = {
      prompt: prompt,
      maxTokenCount: 500,
      temperature: 0.7,
      topP: 0.9,
      stopSequences: []
    };
  } else if (responseModelId.startsWith('meta.llama3')) {
    bodyPayload = {
      prompt: prompt,
      max_gen_len: 500,
      temperature: 0.7,
      top_p: 0.9
    };
  } else {
    throw new Error(`Unsupported model ID: ${responseModelId}`);
  }

  const command = new InvokeModelCommand({
    modelId: responseModelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(bodyPayload)
  });

  try {
    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(Buffer.from(response.body).toString());

    let outputText;

    if (responseModelId.startsWith('amazon.titan-text')) {
      if (!responseBody.results || !responseBody.results[0] || !responseBody.results[0].outputText) {
        throw new Error('Invalid response format from Titan model');
      }
      outputText = responseBody.results[0].outputText;
    } else if (responseModelId.startsWith('meta.llama3')) {
      if (!responseBody.generation) {
        throw new Error('Invalid response format from Llama 3 model');
      }
      outputText = responseBody.generation;
    } else {
      throw new Error('Unsupported model for parsing response');
    }

    return outputText.trim();

  } catch (error) {
    console.error('Error in generateResponse:', error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
};
