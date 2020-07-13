"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

// @ts-check
var _require = require("../models/mongo"),
    collections = _require.collections,
    workInTransaction = _require.workInTransaction;

function loginCheck(coll) {
  return /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (req.isAuthenticated()) {
                if (Array.isArray(req.user)) req.user = req.user[0];
                req.userId = req.user._id;
                next();
              } else if (coll == collections.record) {
                req.userId = req.cookies["connect.sid"];
                next();
              } else {
                res.status(401).send("User not logged in!");
              }

            case 1:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }();
}

module.exports = loginCheck;