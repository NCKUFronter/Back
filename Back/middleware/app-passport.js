"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

// @ts-check
var AppPassport = require("passport");

var LocalStrategy = require("passport-local").Strategy; // const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;


var _require = require("../models/mongo"),
    collections = _require.collections,
    workInTransaction = _require.workInTransaction; // const keys = require("../config/keys");

/*
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
          console.log({ now: "Google Strategy", username: user.value && user.value.name, date });
          return done(err, user.value);
        }
      );
    }
  )
);
*/


AppPassport.use(new LocalStrategy({
  usernameField: "email"
}, function (email, password, done) {
  var user_coll = collections.user;
  user_coll.findOne({
    email: email
  }, function (err, user) {
    if (err) return done(err); // console.log({ now: "local strategy", username: user && user.name });

    if (!user) {
      return done(null, false, {
        message: "Incorrect email."
      });
    }

    if (user.password != password) {
      return done(null, false, {
        message: "Incorrect password."
      });
    }

    return done(null, user);
  });
}));

function autoCreateGameUser(_x) {
  return _autoCreateGameUser.apply(this, arguments);
}

function _autoCreateGameUser() {
  _autoCreateGameUser = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(user) {
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            return _context3.abrupt("return", workInTransaction( /*#__PURE__*/function () {
              var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(session) {
                var game_user_prom, user_prom;
                return _regenerator["default"].wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        game_user_prom = collections.gameUser.insertOne({
                          _id: user._id,
                          name: user.name,
                          bag: {}
                        }, {
                          session: session
                        });
                        user_prom = collections.user.updateOne({
                          _id: user._id
                        }, {
                          $set: {
                            gameUserId: user._id
                          }
                        }, {
                          session: session
                        });
                        _context2.next = 4;
                        return Promise.all([user_prom, game_user_prom]);

                      case 4:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2);
              }));

              return function (_x4) {
                return _ref2.apply(this, arguments);
              };
            }()));

          case 1:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _autoCreateGameUser.apply(this, arguments);
}

AppPassport.serializeUser(function (user, done) {
  // console.log({ type: "serialize", username: user.name });
  done(null, {
    _id: user._id
  });
});
AppPassport.deserializeUser(function (filter, done) {
  // console.log({ type: "deserialize", filter });
  collections.user.findOne(filter, /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(err, user) {
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!(user != null && user.gameUserId == null)) {
                _context.next = 3;
                break;
              }

              _context.next = 3;
              return autoCreateGameUser(user);

            case 3:
              done(err, user);

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }());
});
module.exports = {
  AppPassport: AppPassport,
  LocalStrategy: LocalStrategy // GoogleStrategy,

};