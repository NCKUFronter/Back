"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// @ts-check
var _require = require("../models/mongo"),
    fetchNextId = _require.fetchNextId,
    collections = _require.collections;

var validatePipe = require("../middleware/validate-pipe");

var loginCheck = require("../middleware/login-check");

var _require2 = require("../models/statistic.model"),
    StatisticQuerySchema = _require2.StatisticQuerySchema;

var router = require("express-promise-router")["default"]();

var avail_coll = ["ledger", "user", "category"];

function getEntityName(name) {
  var coll_prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  var non_coll_prefix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
  if (name === "ledger") return coll_prefix + "ledgerName";else if (avail_coll.includes(name)) return coll_prefix + "name";else return non_coll_prefix + name;
}
/**
 * @param {Date} start
 * @param {Date} end
 * @param {any} match
 */


function recordDateCond(start, end) {
  var match = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  // 存在資料庫不統一的情形(以前date假設包含時間，但現在沒有)
  if (start || end) match.date = {};
  if (start) match.date.$gte = start.toISOString();
  if (end) match.date.$lt = end.toISOString();
  return match;
}

function pointTimeCond(start, end) {
  var match = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  // record的日期是Date格式，而pointActivity的time是string格式
  if (start || end) match.time = {};

  if (start) {
    var new_start = new Date(start);
    new_start.setHours(new_start.getHours() - 8);
    match.time.$gte = new_start.toISOString();
  }

  if (end) {
    var new_end = new Date(end);
    new_end.setHours(end.getHours() - 8);
    match.time.$lt = new_end.toISOString();
  }

  return match;
}
/**
 * @param {string} name
 * @param {string[]} branches
 */


function makeGroupId(name, branches) {
  var group_prefix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "$";
  var result = {};

  var _iterator = _createForOfIteratorHelper(branches),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var key = _step.value;
      if (avail_coll.includes(key)) result[key + "Id"] = group_prefix + key + "Id";else result[key] = group_prefix + key;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  if (name) {
    if (avail_coll.includes(name)) result[name + "Id"] = group_prefix + name + "Id";else result[name] = group_prefix + name;
  }

  return result;
}
/**
 * @param {string} coll_name
 * @param {string} localPrefix
 */


function makeLookup(coll_name) {
  var localPrefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  if (!avail_coll.includes(coll_name)) return [];
  var localField = localPrefix + coll_name + "Id";
  return [{
    $lookup: {
      from: coll_name,
      localField: localField,
      foreignField: "_id",
      as: "entity"
    }
  }, {
    $unwind: {
      path: "$entity",
      preserveNullAndEmptyArrays: true
    }
  }];
}
/**
 * @param {string} coll_name
 * @param {string[]} branches
 */


function innerHashtagsPipeline(coll_name, branches) {
  var _$group;

  var sumField = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "money";
  var nameId = coll_name + "Id";
  return [{
    $unwind: {
      path: "$hashtags",
      preserveNullAndEmptyArrays: true
    }
  }, {
    $group: (_$group = {
      _id: _objectSpread(_objectSpread({}, makeGroupId(coll_name, branches, "$_id.")), {}, {
        hashtags: "$hashtags"
      }),
      count: {
        $sum: 1
      },
      size: {
        $first: "$size"
      }
    }, (0, _defineProperty2["default"])(_$group, sumField, {
      $first: "$size"
    }), (0, _defineProperty2["default"])(_$group, nameId, {
      $first: "$_id.".concat(nameId)
    }), _$group)
  }, // group hashtags
  {
    $group: (0, _defineProperty2["default"])({
      _id: _objectSpread({}, makeGroupId(coll_name, branches, "$_id.")),
      hashtags: {
        $push: {
          $cond: [{
            $gt: ["$_id.hashtags", null]
          }, {
            tag: "$_id.hashtags",
            count: "$count"
          }, "$$REMOVE"]
        }
      },
      size: {
        $first: "$size"
      }
    }, sumField, {
      $first: "$" + sumField
    })
  }];
}
/**
 * @param {string} coll_name
 * @param {string[]} branches
 */


function hashtagsPipeline(coll_name, branches) {
  var sumField = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "money";
  return [{
    $group: {
      _id: makeGroupId(coll_name, branches),
      size: {
        $sum: "$" + sumField
      },
      hashtags: {
        $push: "$hashtags"
      }
    }
  }, {
    $project: {
      _id: 1,
      size: 1,
      hashtags: {
        $reduce: {
          input: "$hashtags",
          initialValue: [],
          "in": {
            $concatArrays: ["$$value", "$$this"]
          }
        }
      }
    }
  }].concat((0, _toConsumableArray2["default"])(innerHashtagsPipeline(coll_name, branches, sumField)), (0, _toConsumableArray2["default"])(makeLookup(coll_name, "_id.")));
}
/**
 * @param {string} name
 * @param {string} last_coll_name
 * @param {string[]} branches
 */


function otherPipeline(name, last_coll_name, branches) {
  var _$push, _$group3;

  var sumField = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "money";
  return [{
    $sort: (0, _defineProperty2["default"])({}, getEntityName(last_coll_name, "entity.", "_id."), 1)
  }, {
    $group: (_$group3 = {
      _id: _objectSpread(_objectSpread({}, makeGroupId(name, branches, "$_id.")), {}, {
        child_type_name: last_coll_name
      })
    }, (0, _defineProperty2["default"])(_$group3, sumField, {
      $sum: "$" + sumField
    }), (0, _defineProperty2["default"])(_$group3, "children", {
      $push: (_$push = {}, (0, _defineProperty2["default"])(_$push, sumField, "$" + sumField), (0, _defineProperty2["default"])(_$push, "name", getEntityName(last_coll_name, "$entity.", "$_id.")), (0, _defineProperty2["default"])(_$push, "hashtags", "$hashtags"), (0, _defineProperty2["default"])(_$push, "size", "$size"), (0, _defineProperty2["default"])(_$push, "child_type_name", "$_id.child_type_name"), (0, _defineProperty2["default"])(_$push, "children", "$children"), _$push)
    }), _$group3)
  }].concat((0, _toConsumableArray2["default"])(makeLookup(name, "_id.")));
}
/**
 * @param {string} coll_name
 */


function endPipeline(coll_name) {
  var _$project, _$project2;

  var sumField = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "money";
  return [{
    $sort: (0, _defineProperty2["default"])({}, getEntityName(coll_name, "entity.", "_id."), 1)
  }, {
    $project: (_$project = {
      _id: 0,
      name: getEntityName(coll_name, "$entity.", "$_id."),
      hashtags: 1,
      size: 1
    }, (0, _defineProperty2["default"])(_$project, sumField, 1), (0, _defineProperty2["default"])(_$project, "children", 1), (0, _defineProperty2["default"])(_$project, "child_type_name", "$_id.child_type_name"), _$project)
  }, {
    $group: (0, _defineProperty2["default"])({
      _id: 0,
      children: {
        $push: "$$ROOT"
      }
    }, sumField, {
      $sum: "$" + sumField
    })
  }, {
    $project: (_$project2 = {
      _id: 0,
      size: 1
    }, (0, _defineProperty2["default"])(_$project2, sumField, 1), (0, _defineProperty2["default"])(_$project2, "child_type_name", coll_name), (0, _defineProperty2["default"])(_$project2, "children", 1), _$project2)
  }];
}

function makeStatistic(_x, _x2) {
  return _makeStatistic.apply(this, arguments);
} // available branch: ledgerId, categoryId, userId, recordType
// sum with money
// hashtag always be latest one


function _makeStatistic() {
  _makeStatistic = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(match, branches) {
    var coll,
        basePipeline,
        coll_name,
        last_coll_name,
        arr,
        _args6 = arguments;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            coll = _args6.length > 2 && _args6[2] !== undefined ? _args6[2] : collections.record;

            /** @type {any} */
            basePipeline = [{
              $match: match
            }];
            if (!Array.isArray(branches)) branches = [branches];
            coll_name = branches.pop();
            basePipeline.push.apply(basePipeline, (0, _toConsumableArray2["default"])(hashtagsPipeline(coll_name, branches)));

            while (branches.length > 0) {
              last_coll_name = coll_name;
              coll_name = branches.pop();
              basePipeline.push.apply(basePipeline, (0, _toConsumableArray2["default"])(otherPipeline(coll_name, last_coll_name, branches)));
            }

            basePipeline.push.apply(basePipeline, (0, _toConsumableArray2["default"])(endPipeline(coll_name)));
            _context6.next = 9;
            return coll.aggregate(basePipeline).toArray();

          case 9:
            arr = _context6.sent;
            return _context6.abrupt("return", arr[0]);

          case 11:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _makeStatistic.apply(this, arguments);
}

router.get("/ledger", loginCheck(null), validatePipe("query", StatisticQuerySchema), /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var _req$query, order, start, end, ledgers, ledgerIds, summary;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _req$query = req.query, order = _req$query.order, start = _req$query.start, end = _req$query.end;
            _context.next = 3;
            return collections.ledger.find({
              userIds: req.userId
            }).toArray();

          case 3:
            ledgers = _context.sent;
            ledgerIds = ledgers.map(function (ledger) {
              return ledger._id;
            });
            _context.next = 7;
            return makeStatistic(recordDateCond(start, end, {
              ledgerId: {
                $in: ledgerIds
              }
            }), order);

          case 7:
            summary = _context.sent;
            if (!summary) summary = {};
            summary.name = "帳本";
            return _context.abrupt("return", res.status(200).json(summary));

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x3, _x4) {
    return _ref.apply(this, arguments);
  };
}()); // available: type, user, flow, subtype

router.get("/points", loginCheck(null), validatePipe("query", StatisticQuerySchema), /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var _req$query2, order, start, end, branches, basePipeline, coll_name, last_coll_name, arr, summary;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _req$query2 = req.query, order = _req$query2.order, start = _req$query2.start, end = _req$query2.end;
            branches = order;
            if (!Array.isArray(branches)) branches = [branches];
            /** @type {any} */

            basePipeline = [{
              $match: {
                $or: [pointTimeCond(start, end, {
                  fromUserId: req.userId
                }), pointTimeCond(start, end, {
                  toUserId: req.userId
                })]
              }
            }, {
              $addFields: {
                flow: {
                  $cond: [{
                    $eq: ["$fromUserId", req.userId]
                  }, "out", "in"]
                },
                userId: {
                  $cond: [{
                    $eq: ["$type", "transfer"]
                  }, {
                    $cond: [{
                      $eq: ["$fromUserId", req.userId]
                    }, "$toUserId", "$fromUserId"]
                  }, "$$REMOVE"]
                }
              }
            }];
            coll_name = branches.pop();
            basePipeline.push.apply(basePipeline, (0, _toConsumableArray2["default"])(hashtagsPipeline(coll_name, branches, "amount")));

            while (branches.length > 0) {
              last_coll_name = coll_name;
              coll_name = branches.pop();
              basePipeline.push.apply(basePipeline, (0, _toConsumableArray2["default"])(otherPipeline(coll_name, last_coll_name, branches, "amount")));
            }

            basePipeline.push.apply(basePipeline, (0, _toConsumableArray2["default"])(endPipeline(coll_name, "amount")));
            _context2.next = 10;
            return collections.pointActivity.aggregate(basePipeline).toArray();

          case 10:
            arr = _context2.sent;
            summary = arr[0];
            if (!summary) summary = {};
            summary.name = "點數";
            return _context2.abrupt("return", res.status(200).json(summary));

          case 15:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}()); // available: recordType, categor, ledger

router.get("/personal", loginCheck(null), validatePipe("query", StatisticQuerySchema), /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var _req$query3, order, start, end, summary;

    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _req$query3 = req.query, order = _req$query3.order, start = _req$query3.start, end = _req$query3.end;
            _context3.next = 3;
            return makeStatistic(recordDateCond(start, end, {
              userId: req.userId
            }), order);

          case 3:
            summary = _context3.sent;
            if (!summary) summary = {};
            summary.name = "個人";
            return _context3.abrupt("return", res.status(200).json(summary));

          case 7:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x7, _x8) {
    return _ref3.apply(this, arguments);
  };
}());

var testbranches = function testbranches() {
  return ["ledger", "user", "recordType", "category"];
};

function testPipeline() {
  var branches = testbranches();
  /** @type {any[]} */

  var basePipeline = [{
    $match: {
      ledgerId: {
        $in: ["1", "2"]
      },
      date: {
        $gte: "2020-04-19T00:00:00.000Z",
        $lt: "2020-04-22T00:00:00.000Z"
      }
    }
  }];
  var coll_name = branches.pop();
  basePipeline.push.apply(basePipeline, (0, _toConsumableArray2["default"])(hashtagsPipeline(coll_name, branches)));

  while (branches.length > 0) {
    var last_coll_name = coll_name;
    coll_name = branches.pop();
    basePipeline.push.apply(basePipeline, (0, _toConsumableArray2["default"])(otherPipeline(coll_name, last_coll_name, branches)));
  }

  basePipeline.push.apply(basePipeline, (0, _toConsumableArray2["default"])(endPipeline(coll_name)));
  return basePipeline;
}

router.get("/test-pipeline", /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            return _context4.abrupt("return", res.status(200).json(testPipeline()));

          case 1:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x9, _x10) {
    return _ref4.apply(this, arguments);
  };
}());
router.get("/test", /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res) {
    var basePipeline, arr;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            /** @type {any[]} */
            basePipeline = testPipeline();
            _context5.next = 3;
            return collections.record.aggregate(basePipeline).toArray();

          case 3:
            arr = _context5.sent;
            res.status(200).json(arr);

          case 5:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function (_x11, _x12) {
    return _ref5.apply(this, arguments);
  };
}());
/*
async function test() {

  console.log(arr);
}
test();
*/

module.exports = router;