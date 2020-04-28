const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { collections } = require('../models/mongo');

passport.use(new LocalStrategy(
  // 這是 verify callback
  function(username, password, done) {
    const user_coll = collections.user;
    user_coll.findOne({ name: username }, function (err, user) {
      console.log(user);
      if (err) { return done(err); }
      
      // 如果使用者不存在
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      // 如果使用者密碼錯誤
      if (user.password != password) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      // 認證成功，回傳使用者資訊 user
      return done(null, user);
    });
  }
));

// passport.serializeUser(function(user, done) {
//     done(null, user.id);
//   });
  
// passport.deserializeUser(function(id, done) {
//     collections.user.findById(id, function(err, user) {
//       done(err, user);
//     });
//   });

module.exports = {
    passport, 
    LocalStrategy,
};