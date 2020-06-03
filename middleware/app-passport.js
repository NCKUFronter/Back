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
      callbackURL: "/api/login/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      console.log(accessToken, profile);
      const user_coll = collections.user;
      const date = new Date();
      user_coll.findOneAndUpdate(
        { _id: profile.id },
        {
          $set: {
            _id: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            photo: profile.photos[0].value,
            // lastDate: null,
            // conDays: 0,
            // logInDate: date,
          },
          $setOnInsert: {
            rewardPoints: 0,
          },
        },
        { upsert: true, returnOriginal: false },
        function (err, user) {
          console.log({ now: "Google Strategy", user, date });
          return done(err, user.value);
        }
      );
    }
  )
);

AppPassport.use(
  new LocalStrategy({ usernameField: "email" }, function (
    email,
    password,
    done
  ) {
    const user_coll = collections.user;
    user_coll.findOne({ email: email }, function (err, user) {
      console.log({ now: "local strategy", username: user.name });
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect email." });
      }
      if (user.password != password) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user);
    });
  })
);

AppPassport.serializeUser(function (user, done) {
  console.log({ type: "serialize", username: user.name });
  done(null, { _id: user._id });
});

AppPassport.deserializeUser(function (filter, done) {
  console.log({ type: "deserialize", filter });
  collections.user.findOne(filter, function (err, user) {
    console.log({ err, username: user && user.name });
    done(err, user);
  });
});

module.exports = {
  AppPassport,
  LocalStrategy,
  GoogleStrategy,
};
