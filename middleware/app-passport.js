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
    function (accessToken, refreshToken, profile, done) {
      const user_coll = collections.user;
      user_coll.findOneAndUpdate(
        { googleID: profile.id },
        {
          $set: {
            googleID: profile.id,
            name: profile.displayName,
            photo: profile.photos[0].value,
          },
        },
        { upsert: true, returnOriginal: false },
        function (err, user) {
          console.log({ now: "now GoogleStrategy", user });
          return done(err, user.value);
        }
      );
    }
  )
);

AppPassport.use(
  new LocalStrategy(
    // 這是 verify callback
    function (username, password, done) {
      const user_coll = collections.user;
      user_coll.findOne({ name: username }, function (err, user) {
        console.log({ now: "local strategy", user });
        if (err) {
          return done(err);
        }

        // 如果使用者不存在
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }

        // 如果使用者密碼錯誤
        if (user.password != password) {
          return done(null, false, { message: "Incorrect password." });
        }

        // 認證成功，回傳使用者資訊 user
        return done(null, user);
      });
    }
  )
);

AppPassport.serializeUser(function (user, done) {
  console.log({ type: "serialize", user });
  if (user.googleID) done(null, { googleID: user.googleID });
  else done(null, { _id: user._id });
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
