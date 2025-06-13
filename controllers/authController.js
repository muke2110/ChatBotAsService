const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user.model');
const Client = require('../models/client.model');
const { ApiError } = require('../utils/apiError');
const { Op } = require('sequelize');

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      role: user.role 
    }, 
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      throw new ApiError(400, 'Please provide all required fields');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ApiError(400, 'Email already registered');
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      fullName,
      email,
      password: hash
    });

    // Generate clientId
    const clientId = uuidv4();

    // Create client
    const client = await Client.create({
      userId: user.id,
      clientId,
      name: fullName
    });

    // Generate token
    const token = generateToken(user);
    console.log('clientId', clientId);
    console.log('client', client.clientId);
    
    // Send response
    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      token,
      clientId: client.clientId,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new ApiError(400, 'Please provide email and password');
    }

    // Find user
    const user = await User.findOne({ 
      where: { email },
      include: [{
        model: Client,
        as: 'client',
        attributes: ['clientId']
      }]
    });

    // Check if user exists
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new ApiError(401, 'Invalid password');
    }

    // Generate token
    const token = generateToken(user);

    // Get clientId
    const clientId = user.client ? user.client.clientId : null;

    // If no clientId exists, create one
    if (!clientId) {
      const newClient = await Client.create({
        userId: user.id,
        clientId: uuidv4(),
        name: user.fullName
      });
      clientId = newClient.clientId;
    }

    // Send response
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      token,
      clientId,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    // Since we're using JWT, we don't need to do anything on the server
    // The frontend will remove the token
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Client,
        as: 'client',
        attributes: ['clientId']
      }]
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    const clientId = user.client ? user.client.clientId : null;
    console.log('clientId', clientId);

    res.status(200).json({
      status: 'success',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        clientId: clientId
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, email } = req.body;

    // Validate required fields
    if (!fullName || !email) {
      throw new ApiError(400, 'Please provide all required fields');
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      where: { 
        email,
        id: { [Op.ne]: req.user.id } // Exclude current user
      }
    });

    if (existingUser) {
      throw new ApiError(400, 'Email already taken');
    }

    // Update user
    const user = await User.findByPk(req.user.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    await user.update({
      fullName,
      email
    });

    // Update client name if it exists
    const client = await Client.findOne({ where: { userId: user.id } });
    if (client) {
      await client.update({ name: fullName });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};
