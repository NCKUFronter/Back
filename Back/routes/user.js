"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// @ts-check
var _require = require("../models/mongo"),
    fetchNextId = _require.fetchNextId,
    collections = _require.collections;

var _require2 = require("../models/user.model"),
    UserSchema = _require2.UserSchema;

var validatePipe = require("../middleware/validate-pipe");

var loginCheck = require("../middleware/login-check");

var _require3 = require("../actions"),
    findWithRelation = _require3.findWithRelation;

var _require4 = require("../actions/user.actions"),
    userLedgers = _require4.userLedgers,
    userInvitations = _require4.userInvitations,
    userPointActivities = _require4.userPointActivities;

var router = require("express-promise-router")["default"]();

var user_coll = collections.user; // GET from database

router.get("/", function (req, res, next) {
  user_coll.find(req.query) // .sort({ userId: 1 })
  .toArray(function (err, result) {
    if (err) next(err);else res.status(200).send(result);
  });
}); // 此部份會與其他路徑相沖
// router.get("/:id", function (req, res) {
//   const getData = { _id: parseInt(req.params.id) };
//   user_coll.find(getData).toArray(function (err, result) {
//     if (err) throw err;
//     res.status(200).send(result);
//   });
// });

/*
router.post(
  "/",
  validatePipe("body", UserSchema),
  loginCheck(user_coll),
  async function (req, res, next) {
    const postData = {
      _id: await fetchNextId(user_coll.collectionName),
      // @ts-ignore
      userId: req.userId,
      ...req.body,
    };

    user_coll.insertOne(postData, function (err, result) {
      if (err) return next(err);
      console.log("1 user info inserted.");
      res.status(201).send(result.ops[0]);
    });
  }
);
*/
// router.put("/", validatePipe("body", UserSchema), loginCheck(user_coll),
//  function (req, res) {
//   // @ts-ignore
//   const putFilter = { _id: req.userId };
//   const putData = {
//     $set: {...req.body}
//   }
//   user_coll.findOneAndUpdate(
//     putFilter,
//     putData,
//     { returnOriginal: false },
//     function (err, result) {
//       if (err) throw err;
//       console.log("1 document updated");
//       res.status(200).send(result.value);
//     }
//   );
// });

/*
router.patch(
  "/",
  validatePipe("body", UserSchema, { context: { partial: true } }),
  loginCheck(user_coll),
  function (req, res, next) {
    // @ts-ignore
    const patchFilter = { _id: req.userId };
    const patchData = {
      $set: req.body,
    };
    user_coll.findOneAndUpdate(
      patchFilter,
      patchData,
      { returnOriginal: false },
      function (err, result) {
        if (err) return next(err);
        console.log("1 document updated");
        res.status(200).send(result.value);
      }
    );
  }
);
*/

router["delete"]("/", loginCheck(user_coll), function (req, res, next) {
  // @ts-ignore
  var deleteFilter = {
    _id: req.userId
  };
  user_coll.deleteOne(deleteFilter, function (err, result) {
    if (err) return next(err);
    console.log("Delete row: " + req.params.id + " with filter: " + deleteFilter + ". Deleted: " + result.result.n);
    res.status(200).send("Delete from db Successfully!");
  });
});
router.get("/profile", loginCheck(user_coll), function (req, res) {
  // @ts-ignore
  var _req$user = req.user,
      password = _req$user.password,
      user_rest = (0, _objectWithoutProperties2["default"])(_req$user, ["password"]);
  res.status(200).json(user_rest);
});
router.get("/ledgers", loginCheck(user_coll), /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var _req$query, _one, _many, match, ledgers;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // const ledgers = await userLedgers(req.userId);
            _req$query = req.query, _one = _req$query._one, _many = _req$query._many, match = (0, _objectWithoutProperties2["default"])(_req$query, ["_one", "_many"]);
            _context.next = 3;
            return findWithRelation(collections.ledger, {
              $or: [_objectSpread(_objectSpread({}, match), {}, {
                userIds: req.userId
              }), _objectSpread(_objectSpread({}, match), {}, {
                adminId: req.userId
              })]
            }, _one, _many);

          case 3:
            ledgers = _context.sent;
            res.status(200).json(ledgers);

          case 5:
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
router.get("/invitations", loginCheck(user_coll), /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var _req$query2, _one, _many, invitations;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            // const invitations = await userInvitations(req.userId);
            _req$query2 = req.query, _one = _req$query2._one, _many = _req$query2._many;
            _context2.next = 3;
            return findWithRelation(collections.invitation, {
              toUserId: req.userId,
              type: 2
            }, _one, _many);

          case 3:
            invitations = _context2.sent;
            res.status(200).json(invitations);

          case 5:
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
router.get("/pointActivities", loginCheck(user_coll), /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var _req$query3, _one, _many, match, activities;

    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            // const activities = await userPointActivities(req.userId);
            _req$query3 = req.query, _one = _req$query3._one, _many = _req$query3._many, match = (0, _objectWithoutProperties2["default"])(_req$query3, ["_one", "_many"]);
            _context3.next = 3;
            return findWithRelation(collections.pointActivity, {
              $or: [_objectSpread(_objectSpread({}, match), {}, {
                fromUserId: req.userId
              }), _objectSpread(_objectSpread({}, match), {}, {
                toUserId: req.userId
              })]
            }, _one, _many);

          case 3:
            activities = _context3.sent;
            res.status(200).json(activities);

          case 5:
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
router.get("/relativeUsers", loginCheck(user_coll), /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    var results, users, i;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return collections.ledger.aggregate([{
              $match: {
                $or: [{
                  userIds: req.userId
                }, {
                  adminId: req.userId
                }]
              }
            }, {
              $lookup: {
                from: "user",
                foreignField: "_id",
                localField: "userIds",
                as: "users"
              }
            }, {
              $group: {
                _id: 0,
                user: {
                  $push: "$users"
                }
              }
            }, {
              $project: {
                users: {
                  $reduce: {
                    input: "$user",
                    initialValue: [],
                    "in": {
                      $setUnion: ["$$value", "$$this"]
                    }
                  }
                }
              }
            }]).toArray();

          case 2:
            results = _context4.sent;

            if (!(results.length == 0)) {
              _context4.next = 5;
              break;
            }

            return _context4.abrupt("return", res.status(200).json([]));

          case 5:
            users = results[0].users;
            i = 0;

          case 7:
            if (!(i < users.length)) {
              _context4.next = 14;
              break;
            }

            if (!(users[i]._id === req.userId)) {
              _context4.next = 11;
              break;
            }

            users.splice(i, 1);
            return _context4.abrupt("break", 14);

          case 11:
            i++;
            _context4.next = 7;
            break;

          case 14:
            /** @type {any[]} */
            res.status(200).json(users);

          case 15:
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
router.get("/categories", loginCheck(user_coll), /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res) {
    var categories, _iterator, _step, category;

    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return collections.category.find({
              $or: [{
                userId: null
              }, {
                userId: req.userId
              }]
            }).toArray();

          case 2:
            categories = _context5.sent;

            if (req.user.categoryTags) {
              _iterator = _createForOfIteratorHelper(categories);

              try {
                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                  category = _step.value;
                  category.hashtags = req.user.categoryTags[category._id];
                }
              } catch (err) {
                _iterator.e(err);
              } finally {
                _iterator.f();
              }
            }

            res.status(200).json(categories);

          case 5:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}());
router.get("/ledgers/records", loginCheck(user_coll), /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res) {
    var ledgersWithRecords;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return collections.ledger.aggregate([{
              $match: {
                $or: [{
                  adminId: "1"
                }, {
                  userIds: "1"
                }]
              }
            }, {
              $lookup: {
                from: "record",
                foreignField: "ledgerId",
                localField: "_id",
                as: "records"
              }
            }, {
              $unwind: {
                path: "$records",
                preserveNullAndEmptyArrays: true
              }
            }, {
              $lookup: {
                from: "user",
                foreignField: "_id",
                localField: "records.userId",
                as: "records.user"
              }
            }, {
              $unwind: {
                path: "$records.user",
                preserveNullAndEmptyArrays: true
              }
            }, {
              $lookup: {
                from: "category",
                foreignField: "_id",
                localField: "records.categoryId",
                as: "records.category"
              }
            }, {
              $unwind: {
                path: "$records.category",
                preserveNullAndEmptyArrays: true
              }
            }, {
              $group: {
                _id: "$_id",
                ledgerName: {
                  $first: "$ledgerName"
                },
                userIds: {
                  $first: "$userIds"
                },
                records: {
                  $push: "$records"
                }
              }
            }, {
              $lookup: {
                from: "user",
                foreignField: "_id",
                localField: "userIds",
                as: "users"
              }
            }]).toArray();

          case 2:
            ledgersWithRecords = _context6.sent;
            res.status(200).json(ledgersWithRecords);

          case 4:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}());
module.exports = router;