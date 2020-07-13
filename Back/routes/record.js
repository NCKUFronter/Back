"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// @ts-check
var _require = require("../models/mongo"),
    collections = _require.collections,
    workInTransaction = _require.workInTransaction;

var _require2 = require("../models/record.model"),
    RecordSchema = _require2.RecordSchema;

var validatePipe = require("../middleware/validate-pipe");

var loginCheck = require("../middleware/login-check");

var _require3 = require("../middleware/auth-guard"),
    getLedgerAuthGuard = _require3.getLedgerAuthGuard;

var _require4 = require("../actions"),
    notification = _require4.notification;

var checkParamsIdExists = require("../middleware/check-params-id-exists");

var _require5 = require("../actions"),
    findWithRelation = _require5.findWithRelation,
    findOneWithRelation = _require5.findOneWithRelation;

var pointAction = require("../actions/point.actions");

var _require6 = require("../actions/record.actions"),
    removeRecord = _require6.removeRecord,
    updateRecord = _require6.updateRecord;

var router = require("express-promise-router")["default"]();

var record_coll = collections.record; // record 要考慮 pointActivity
// pointActivity 要考慮 user
// GET from database

router.get("/", /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var _req$query, _one, _many, match, oneToManyFields, manyToManyFields, records;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // collRelation(record_coll, 'category', 'categoryId', '_id', 'categoryData');
            console.log(req.query);
            _req$query = req.query, _one = _req$query._one, _many = _req$query._many, match = (0, _objectWithoutProperties2["default"])(_req$query, ["_one", "_many"]);
            oneToManyFields = req.query._one;
            manyToManyFields = req.query._many;
            _context.next = 6;
            return findWithRelation(record_coll, match, // @ts-ignore
            oneToManyFields, manyToManyFields);

          case 6:
            records = _context.sent;
            res.status(200).json(records);

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}()); // GET certain data from database

router.get("/:id", loginCheck(record_coll), /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var oneToManyFields, manyToManyFields, record;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            oneToManyFields = req.query._one;
            manyToManyFields = req.query._many;
            _context2.next = 4;
            return findOneWithRelation(record_coll, req.params.id, // @ts-ignore
            oneToManyFields, manyToManyFields);

          case 4:
            record = _context2.sent;
            res.status(200).json(record);

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}()); // Post the info

router.post("/", validatePipe("body", RecordSchema), loginCheck(record_coll), getLedgerAuthGuard(function (req) {
  return req.convert_from_body.ledgerId;
}), /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    var postData, user, amount, ledger;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            postData = _objectSpread(_objectSpread({}, req.body), {}, {
              userId: req.userId,
              createDate: new Date().toISOString()
            });
            _context3.next = 3;
            return collections.user.findOne({
              _id: req.userId
            });

          case 3:
            user = _context3.sent;
            amount = Math.round(req.body.money / 100);
            _context3.next = 7;
            return pointAction.pointsFromRecord("record", amount, postData, user);

          case 7:
            console.log("1 document inserted.");
            ledger = req.convert_from_body.ledgerId;
            notification.send(req, {
              type: "record",
              action: "create",
              ledger: ledger
            }, ledger.userIds);
            res.status(201).json({
              message: "Insert Success",
              rewardPoints: amount
            });

          case 11:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}()); // PUT to update certain row info
// router.put("/", validatePipe("body", RecordSchema), loginCheck(record_coll), function (req, res) {
//   // @ts-ignore
//   const putFilter = { _id: req.userId };
//   const putData = {
//     $set: { ...req.body, reviseDate: new Date().toISOString() },
//   };
//   record_coll.findOneAndUpdate(
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
// PATCH to update certain row info

router.patch("/:id", validatePipe("body", RecordSchema, {
  context: {
    partial: true
  }
}), loginCheck(record_coll), checkParamsIdExists(collections.record), /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    var record;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            record = req.convert_from_params.id;

            if (!(record.userId !== req.userId)) {
              _context4.next = 3;
              break;
            }

            return _context4.abrupt("return", res.status(403).json("No access"));

          case 3:
            _context4.next = 5;
            return updateRecord(record, req.body);

          case 5:
            notification.sendToLedgerUsers(req, {
              type: "record",
              action: "update"
            }, req.convert_from_params.id.ledgerId);
            res.status(200).json("success"); // @ts-ignore

            /*
            const patchFilter = { _id: req.params.id, userId: req.userId };
            const patchData = { $set: req.body };
            record_coll.findOneAndUpdate(
              patchFilter,
              patchData,
              { returnOriginal: false },
              function (err, result) {
                if (err) throw err;
                console.log("1 document updated");
                res.status(200).send(result.value);
              }
            );
            */

          case 7:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()); // DELETE certain row

router["delete"]("/:id", loginCheck(record_coll), checkParamsIdExists(collections.record), /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res) {
    var record;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            record = req.convert_from_params.id;

            if (!(record.userId !== req.userId)) {
              _context5.next = 3;
              break;
            }

            return _context5.abrupt("return", res.status(403).json("No access"));

          case 3:
            _context5.next = 5;
            return removeRecord(record, req.userId);

          case 5:
            notification.sendToLedgerUsers(req, {
              type: "record",
              action: "delete"
            }, req.convert_from_params.id.ledgerId);
            res.status(200).json("delete successs");
            /*
            var deleteFilter = { _id: req.params.id };
            record_coll.deleteOne(deleteFilter, (err, result) => {
            console.log(req.params.id, deleteFilter, result.result.n);
            res
              .status(200)
              .send("Delete row: " + req.params.id + " from db Successfully!");
            });
            */

          case 7:
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
module.exports = router;