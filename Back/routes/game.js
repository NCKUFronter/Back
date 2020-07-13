"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// @ts-check
var _require = require("../models/mongo"),
    collections = _require.collections,
    workInTransaction = _require.workInTransaction;

var _require2 = require("../models/goods.model"),
    GoodsSchema = _require2.GoodsSchema;

var loginCheck = require("../middleware/login-check");

var checkParamsIdExists = require("../middleware/check-params-id-exists");

var router = require("express-promise-router")["default"]();

router.get("/user", /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var users;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return collections.gameUser.find().toArray();

          case 2:
            users = _context.sent;
            res.status(200).json(users);

          case 4:
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
router.get("/user/:id", checkParamsIdExists(collections.gameUser), /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var user;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            user = req.convert_from_params.id;
            res.status(200).json(user);

          case 2:
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
router.get("/user/:id/bag", checkParamsIdExists(collections.gameUser), /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var user, goodIds, id, goods, _iterator, _step, g;

    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            user = req.convert_from_params.id;
            goodIds = [];

            for (id in user.bag) {
              if (user.bag[id] > 0) goodIds.push(id);
            }

            _context3.next = 5;
            return collections.goods.find({
              _id: {
                $in: goodIds
              }
            }).toArray();

          case 5:
            goods = _context3.sent;
            _iterator = _createForOfIteratorHelper(goods);

            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                g = _step.value;
                g.count = user.bag[g._id];
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }

            res.status(200).json(goods);

          case 9:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());
router.post("/user/:id/use/:goodsId", checkParamsIdExists(collections.gameUser), /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    var user, goodsId;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            user = req.convert_from_params.id;
            goodsId = req.params.goodsId;

            if (!(user.bag && user.bag[goodsId] != null)) {
              _context4.next = 13;
              break;
            }

            if (!(user.bag[goodsId] == 1)) {
              _context4.next = 8;
              break;
            }

            _context4.next = 6;
            return collections.gameUser.updateOne({
              _id: user._id
            }, {
              $unset: (0, _defineProperty2["default"])({}, "bag." + goodsId, "")
            });

          case 6:
            _context4.next = 10;
            break;

          case 8:
            _context4.next = 10;
            return collections.gameUser.updateOne({
              _id: user._id
            }, {
              $inc: (0, _defineProperty2["default"])({}, "bag." + goodsId, -1)
            });

          case 10:
            res.status(200).json("success");
            _context4.next = 14;
            break;

          case 13:
            return _context4.abrupt("return", res.status(400).json("背包內沒有此道具"));

          case 14:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}());
module.exports = router;