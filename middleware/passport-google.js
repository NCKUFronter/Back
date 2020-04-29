const passportGoogle = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const { collections } = require('../models/mongo');
const keys = require('../config/keys')

passportGoogle.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/login/auth/google/callback"
    }
    , function(accessToken, refreshToken, profile, done) {
      const user_coll = collections.user;
      user_coll.findOneAndUpdate(
        { googleID: profile.id },
        { $set: { googleID: profile.id, name: profile.displayName, photo: profile.photos[0].value }},
        { upsert: true, returnOriginal: false }
      , function (err, user) {
        console.log(user);
        return done(err, user);
      });
    }
));

passportGoogle.serializeUser(function(user, done) {
  done(null, user.value.googleID);
});
passportGoogle.deserializeUser(function(id, done) {
  collections.user.findOne({googleID: id}, function(err, user) {
    done(err, user);
  });
});

module.exports = {
    passportGoogle, 
    GoogleStrategy
};