// @ts-check
const AppPassport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const { collections } = require("../models/mongo");
const keys = require("../config/keys");

AppPassport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: "/login/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      const user_coll = collections.user;
      user_coll.findOneAndUpdate(
        { _id: profile.id },
        {
          $set: {
            _id: profile.id,
            name: profile.displayName,
            photo: profile.photos[0].value,
          },
        },
        { upsert: true, returnOriginal: false },
        function (err, user) {
          console.log({ now: "Google Strategy", user });
          return done(err, user.value);
        }
      );
    }
  )
);

AppPassport.use(
  new LocalStrategy(
    function (username, password, done) {
      const user_coll = collections.user;
      user_coll.findOne({ name: username }, function (err, user) {
        console.log({ now: "local strategy", user });
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (user.password != password) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      });
    }
  )
);

AppPassport.serializeUser(function (user, done) {
  console.log({ type: "serialize", user });
  done(null, { _id: user._id });
});

AppPassport.deserializeUser(function (filter, done) {
  console.log({ type: "deserialize", filter });
  collections.user.findOne(filter, function (err, user) {
    console.log({ err, user });
    done(err, user);
  });
});

module.exports = {
  AppPassport,
  LocalStrategy,
  GoogleStrategy,
};