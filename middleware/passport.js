const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const { collections } = require('../models/mongo');
const keys = require('../config/keys')

passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/login/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile)
      const user_coll = collections.user;
      user_coll.updateOne(
        // { _id: id, googleID: profile.id}
        { googleID: profile.id },
        { $set: { googleID: profile.id }},
        { upsert: true}
      , function (err, user) {
        console.log(user);
        return done(err, user);
      });
    }
));

passport.serializeUser(function(user, done) {
  done(null, user.upsertedId._id);
});
passport.deserializeUser(function(id, done) {
  collections.user.find({_id: id}, function(err, user) {
    done(err, user);
  });
});


module.exports = {
    passport, 
    GoogleStrategy
};