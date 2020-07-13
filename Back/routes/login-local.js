"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

// @ts-check
var router = require("express-promise-router")["default"]();

var _require = require("../models/mongo"),
    collections = _require.collections;

var _require2 = require("../middleware/app-passport"),
    AppPassport = _require2.AppPassport;

var loginCheck = require("../middleware/login-check");

var _require3 = require("../actions/point.actions"),
    pointsFromEvent = _require3.pointsFromEvent;

router.post("/login", AppPassport.authenticate("local", {
  session: true
}), /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (req.isAuthenticated()) {
              res.status(200).json("Login Successful!");
            } else {
              res.status(401).json("登入失敗! 帳號或密碼錯誤。");
            }

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
router.post("/pointCheck", loginCheck(collections.user), /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var result, userUpdate, lastLogin, now, nextLastDate;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            result = {};
            userUpdate = {
              $set: {
                lastLogin: new Date().toISOString()
              }
            };

            if (!(req.user.lastLogin != null)) {
              _context2.next = 27;
              break;
            }

            lastLogin = new Date(req.user.lastLogin);
            now = new Date(userUpdate.$set.lastLogin);
            nextLastDate = new Date(lastLogin);
            nextLastDate.setDate(lastLogin.getDate() + 1);

            if (!(now.toDateString() === lastLogin.toDateString())) {
              _context2.next = 10;
              break;
            }

            _context2.next = 25;
            break;

          case 10:
            if (!(nextLastDate.toDateString() === now.toDateString())) {
              _context2.next = 21;
              break;
            }

            _context2.next = 13;
            return pointsFromEvent("perLogin", 10, req.user);

          case 13:
            result.perLogin = 10;
            userUpdate.$inc = {
              conDays: 1
            };

            if (!(req.user.conDays % 7 === 6)) {
              _context2.next = 19;
              break;
            }

            _context2.next = 18;
            return pointsFromEvent("continueLogin", 10, req.user);

          case 18:
            result.continueLogin = 10;

          case 19:
            _context2.next = 25;
            break;

          case 21:
            _context2.next = 23;
            return pointsFromEvent("perLogin", 10, req.user);

          case 23:
            result.perLogin = 10;
            userUpdate.$set.conDays = 1;

          case 25:
            _context2.next = 31;
            break;

          case 27:
            _context2.next = 29;
            return pointsFromEvent("perLogin", 10, req.user);

          case 29:
            result.perLogin = 10;
            userUpdate.$set.conDays = 1;

          case 31:
            _context2.next = 33;
            return collections.user.updateOne({
              _id: req.userId
            }, userUpdate);

          case 33:
            res.status(200).json(result);

          case 34:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
/*
router.get("/", function (req, res, next) {
  AppPassport.authenticate("local", function (err, user, info) {
    if (err) return next(err);
    if (!user) return res.redirect("/");
    req.logIn(user, function (err) {
      if (err) return next(err);
      return res.redirect("/user/" + user.email);
    });
  })(req, res, next);
});
*/

router.post("/logout", function (req, res) {
  req.logout();
  res.status(200).json("Logout Success!");
});
module.exports = router;