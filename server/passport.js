const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const FacebookStrategy = require('passport-facebook').Strategy;
require("dotenv/config")
const User = require('./userModel');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth strategy
passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.clientID,
        clientSecret: process.env.clientSecret,
        callbackURL: 'https://scintillating-cucurucho-8944ab.netlify.app//auth/google/callback', 
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails[0].value });
          if (!user) {
            // Create a new user if not found
            user = await User.create({
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              email: profile.emails[0].value,
              role: 'user', // Set the user role as per your requirements
            });
          }
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
)