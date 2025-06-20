const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user.model');
const Client = require('../models/client.model');
const Token = require('../models/token.model');
const { ApiError } = require('../utils/apiError');
const { Op } = require('sequelize');
const { sendEmail } = require('../services/emailService');

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

const generateVerificationToken = async (userId, type) => {
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

  await Token.create({
    userId,
    token,
    type,
    expiresAt
  });

  return token;
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

    // Generate verification token
    const verificationToken = await generateVerificationToken(user.id, 'email_verification');

    // Send verification email
    await sendEmail(user.email, 'verification', {
      verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
    });

    // Send welcome email
    await sendEmail(user.email, 'welcome', {
      userName: user.fullName,
      pricingUrl: `${process.env.FRONTEND_URL}/plans`,
      features: [
        { name: 'Document-based Training', value: 'Upload your documents and train the chatbot with your specific knowledge base.' },
        { name: 'AI-Powered Responses', value: 'Advanced AI models ensure accurate and contextual responses.' },
        { name: 'Secure & Private', value: 'Your data is encrypted and securely stored.' },
        { name: 'Real-time Chat', value: 'Instant responses and seamless conversation flow.' }
      ]
    });

    // Generate token
    const token = generateToken(user);
    
    // Send response
    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please check your email to verify your account.',
      token,
      clientId: client.clientId,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    // Find token
    const verificationToken = await Token.findOne({
      where: {
        token,
        type: 'email_verification',
        used: false,
        expiresAt: {
          [Op.gt]: new Date()
        }
      },
      include: [User]
    });

    if (!verificationToken) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid or expired verification token'
      });
    }
    console.log("verificationToken:: ", verificationToken.User.dataValues);
    // Update user
    await verificationToken.User.update({ emailVerified: true });

    // Mark token as used
    await verificationToken.update({ used: true });

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Generate reset token
    const resetToken = await generateVerificationToken(user.id, 'password_reset');

    // Send reset email
    await sendEmail(user.email, 'password_reset', {
      resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset instructions sent to your email'
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Find token
    const resetToken = await Token.findOne({
      where: {
        token,
        type: 'password_reset',
        used: false,
        expiresAt: {
          [Op.gt]: new Date()
        }
      },
      include: [{
        model: User,
        as: 'User'
      }]
    });

    if (!resetToken) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    // Hash new password
    const hash = await bcrypt.hash(password, 10);

    // Update user
    await resetToken.User.update({
      password: hash,
      lastPasswordReset: new Date()
    });

    // Mark token as used
    await resetToken.update({ used: true });

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful'
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
        clientId: clientId,
        emailVerified: user.emailVerified
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

exports.resendVerification = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.emailVerified) {
      throw new ApiError(400, 'Email is already verified');
    }

    // Generate new verification token
    const verificationToken = await generateVerificationToken(user.id, 'email_verification');

    // Send verification email
    await sendEmail(user.email, 'verification', {
      verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
    });

    res.status(200).json({
      status: 'success',
      message: 'Verification email sent successfully'
    });
  } catch (err) {
    next(err);
  }
};
