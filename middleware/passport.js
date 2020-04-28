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
    // 這是 verify callback
    function(accessToken, refreshToken, profile, done) {
      const user_coll = collections.user;
      // console.log(accessToken);
      // console.log(refreshToken);
      user_coll.findOneAndUpdate(
        { _id: 2 },
        { $set: { googleID: profile.id }}
      , function (err, user) {
        return done(err, user);
      });
    }
));

passport.serializeUser(function(user, done) {
  done(null, user.value._id);
});
passport.deserializeUser(function(id, done) {
  user_coll.find({_id: id}, function(err, user) {
    done(err, user);
  });
});


module.exports = {
    passport, 
    GoogleStrategy,
};