// const Client = require('../models/client.model');
const User = require('../models/user.model')
const Client = require('../models/client.model')

module.exports = async function (req, res, next) {
  const clientId = req.headers['x-client-id'];

  if (!clientId) return res.status(400).json({ message: 'Missing clientId' });

  const client = await Client.findOne({ where: { clientId: clientId } });

  if (!client) return res.status(404).json({ message: 'Invalid clientId' });
  
  // console.log("Client Data: ", client);
  // console.log("Client ID: ",client.clientId);
  // console.log("Client Bucket location: ",client.s3ModelPath);
  
  req.s3ModelPath = client.s3ModelPath; // Add client data to request
  next();
};
