const { bedrockClient } = require('../config/aws');
const { InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

exports.generateResponse = async (query, contexts) => {
  const prompt = `Based on the following Context:
${contexts}

Question: ${query}
Answer:`;
  console.log('Total prompt:', prompt);

  const command = new InvokeModelCommand({
    modelId: process.env.BEDROCK_GPT_MODEL,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      inputText: prompt,
      textGenerationConfig: {
        maxTokenCount: 500,
        temperature: 0.7,
        topP: 0.9 // Optional: Controls diversity
      }
    })
  });

  try {
    console.log('Command body:', JSON.parse(command.input.body));
    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(Buffer.from(response.body).toString());
    console.log('ResponseBody:', responseBody);
    if (!responseBody.results || !responseBody.results[0] || !responseBody.results[0].outputText) {
      throw new Error('Invalid response format from Bedrock');
    }
    return responseBody.results[0].outputText.trim();
  } catch (error) {
    console.error('Error in generateResponse:', error);
    throw new Error(`Failed to generate response: ${error.message}`);
  }
};