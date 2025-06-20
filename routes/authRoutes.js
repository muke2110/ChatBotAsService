const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { authRateLimiter } = require('../middleware/rateLimiter');
const passport = require('passport');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user.model');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Public routes
router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);
router.post('/logout', authController.logout);

// Email verification and password reset routes
router.get('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authRateLimiter, authController.forgotPassword);
router.post('/reset-password', authRateLimiter, authController.resetPassword);
router.post('/resend-verification', authMiddleware, authRateLimiter, authController.resendVerification);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);

// Health check
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Auth service is running'
  });
});

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent'
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:5000/login?error=Authentication failed',
    session: false 
  }),
  async (req, res) => {
    try {
      // Make sure we have a user object
      if (!req.user) {
        console.error('No user object in request');
        return res.redirect('http://localhost:5000/login?error=Authentication failed');
      }

      // Log the user object for debugging
      // console.log('User in callback:', req.user.toJSON());

      // Generate token
      const token = req.user.generateAuthToken();

      // console.log("user token id::::", token);
      // console.log("user client id::::", req.user.dataValues.client.dataValues.clientId);
      
      // Get clientId
      // const clientId = req.user.Client ? req.user.Client.clientId : null;
      const clientId = req.user.dataValues.client.dataValues.clientId;
      // Log success
      console.log('Authentication successful, redirecting with token and clientId');
      
      // Redirect to frontend with token and clientId
      res.redirect(`http://localhost:5000/login?token=${token}&clientId=${clientId}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect('http://localhost:5000/login?error=Authentication failed');
    }
  }
);

module.exports = router;
