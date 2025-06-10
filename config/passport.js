const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');
const Client = require('../models/client.model');
const { v4: uuidv4 } = require('uuid');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/v1/auth/google/callback",
    passReqToCallback: true
  },
  async function(request, accessToken, refreshToken, profile, done) {
    try {
      // Check if user already exists using googleId
      let user = await User.findOne({ 
        where: { 
          googleId: profile.id 
        },
        include: [{
          model: Client,
          as: 'Client',
          attributes: ['clientId']
        }]
      });

      if (!user) {
        // If not found by googleId, check by email
        user = await User.findOne({ 
          where: { 
            email: profile.emails[0].value 
          },
          include: [{
            model: Client,
            as: 'Client',
            attributes: ['clientId']
          }]
        });

        if (user) {
          // Update existing user with Google ID
          user.googleId = profile.id;
          user.emailVerified = true;
          await user.save();
        } else {
          // Create new user
          user = await User.create({
            fullName: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            emailVerified: true,
            role: 'user'
          });
        }

        // Create client if it doesn't exist
        if (!user.Client) {
          const clientId = uuidv4();
          await Client.create({
            userId: user.id,
            clientId: clientId,
            name: user.fullName
          });

          // Reload user to include the new client
          user = await User.findOne({
            where: { id: user.id },
            include: [{
              model: Client,
              as: 'Client',
              attributes: ['clientId']
            }]
          });
        }
      }

      // Log the user object for debugging
      console.log('User object with client:', user.toJSON());
      
      return done(null, user);
    } catch (error) {
      console.error('Passport Google Strategy Error:', error);
      return done(error, null);
    }
  }
));

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findOne({ 
      where: { id: id },
      include: [{
        model: Client,
        as: 'Client',
        attributes: ['clientId']
      }]
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport; 