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
    fetchNextId = _require.fetchNextId,
    collections = _require.collections;

var _require2 = require("../models/ledger.model"),
    LedgerSchema = _require2.LedgerSchema;

var validatePipe = require("../middleware/validate-pipe");

var loginCheck = require("../middleware/login-check");

var _require3 = require("../middleware/auth-guard"),
    getLedgerAuthGuard = _require3.getLedgerAuthGuard;

var checkParamsIdExists = require("../middleware/check-params-id-exists");

var _require4 = require("../actions/coll-relation"),
    findWithRelation = _require4.findWithRelation,
    findOneWithRelation = _require4.findOneWithRelation;

var _require5 = require("../actions/notification.service"),
    notification = _require5.notification;

var router = require("express-promise-router")["default"]();

var fs = require("fs");

var path = require("path"); // 假設已經 connectDB


var ledger_coll = collections.ledger;

function makeImagePath(photo) {
  var ext = photo.name.slice(photo.name.lastIndexOf("."));
  return "/img/user-ledger/ledger-".concat(Date.now()).concat(ext);
} // GET from database


router.get("/",
/*#__PURE__*/
// validatePipe("query", LedgerSchema, { context: { partial: true } }),
function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var _req$query, _one, _many, match, oneToManyFields, manyToManyFields, ledgers;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            console.log(req.query);
            _req$query = req.query, _one = _req$query._one, _many = _req$query._many, match = (0, _objectWithoutProperties2["default"])(_req$query, ["_one", "_many"]);
            oneToManyFields = req.query._one;
            manyToManyFields = req.query._many;
            _context.next = 6;
            return findWithRelation(ledger_coll, match, // @ts-ignore
            oneToManyFields, manyToManyFields);

          case 6:
            ledgers = _context.sent;
            res.status(200).json(ledgers);

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

router.get("/:id", loginCheck(ledger_coll), getLedgerAuthGuard(function (req) {
  return req.params.id;
}), /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var oneToManyFields, manyToManyFields, ledger;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            oneToManyFields = req.query._one;
            manyToManyFields = req.query._many;
            _context2.next = 4;
            return findOneWithRelation(ledger_coll, req.params.id, // @ts-ignore
            oneToManyFields, manyToManyFields);

          case 4:
            ledger = _context2.sent;
            res.status(200).json(ledger);

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
}());
router.post("/", validatePipe("body", LedgerSchema), loginCheck(ledger_coll), /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res, next) {
    var upPhoto, postData, img_path;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            upPhoto = req.files && req.files.upPhoto;

            if (!(req.body.photo == null && upPhoto == null)) {
              _context3.next = 3;
              break;
            }

            return _context3.abrupt("return", res.status(400).json("Must specify photo!!"));

          case 3:
            _context3.t0 = _objectSpread;
            _context3.next = 6;
            return fetchNextId(ledger_coll.collectionName);

          case 6:
            _context3.t1 = _context3.sent;
            _context3.t2 = req.userId;
            _context3.t3 = [req.userId];
            _context3.t4 = {
              _id: _context3.t1,
              adminId: _context3.t2,
              userIds: _context3.t3
            };
            _context3.t5 = req.body;
            postData = (0, _context3.t0)(_context3.t4, _context3.t5);

            if (!upPhoto) {
              _context3.next = 18;
              break;
            }

            if (Array.isArray(upPhoto)) upPhoto = upPhoto[0];
            img_path = makeImagePath(upPhoto);
            _context3.next = 17;
            return upPhoto.mv(path.resolve("." + img_path));

          case 17:
            postData.photo = img_path;

          case 18:
            ledger_coll.insertOne(postData, function (err, result) {
              if (err) return next(err);
              console.log("1 document inserted.");
              notification.send(req, {
                type: "ledger",
                action: "create",
                body: req.body
              }, [req.userId]);
              res.status(201).send(result.ops[0]);
            });

          case 19:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x5, _x6, _x7) {
    return _ref3.apply(this, arguments);
  };
}()); // router.put(
//   "/:id",
//   validatePipe("body", LedgerSchema, { context: { partial: true } }),
//   function (req, res) {
//     const putFilter = { _id: req.params.id };
//     const putData = {
//       $set: {
//         ...req.body
//       }
//     };
//     ledger_coll.findOneAndUpdate(
//       putFilter,
//       putData,
//       { returnOriginal: false },
//       function (err, result) {
//         if (err) throw err;
//         console.log("1 document updated");
//         res.status(200).send(result.value);
//       }
//     );
//   }
// );

router.patch("/:id", validatePipe("body", LedgerSchema, {
  context: {
    partial: true
  }
}), loginCheck(ledger_coll), checkParamsIdExists(collections.ledger), getLedgerAuthGuard(function (req) {
  return req.convert_from_params.id;
}), /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res, next) {
    var ledger, patchFilter, patchData, upPhoto, photo, img_path;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            // @ts-ignore
            ledger = req.convert_from_params.id;
            patchFilter = {
              _id: req.params.id,
              adminId: req.userId
            };
            patchData = req.body;
            upPhoto = req.files && req.files.upPhoto;

            if (!(Object.keys(req.body).length == 0 && upPhoto == null)) {
              _context4.next = 6;
              break;
            }

            return _context4.abrupt("return", res.status(400).json("Must specify body!!"));

          case 6:
            if (!(req.files && req.files.upPhoto)) {
              _context4.next = 13;
              break;
            }

            photo = req.files.upPhoto;
            if (Array.isArray(photo)) photo = photo[0];
            img_path = makeImagePath(photo);
            _context4.next = 12;
            return photo.mv(path.resolve("." + img_path));

          case 12:
            patchData.photo = img_path;

          case 13:
            ledger_coll.findOneAndUpdate(patchFilter, {
              $set: patchData
            }, {
              returnOriginal: false
            }, function (err, result) {
              if (err) return next(err);
              console.log("1 document updated");
              var ledger = req.convert_from_params.id;
              notification.send(req, {
                type: "ledger",
                action: "update",
                ledger: ledger
              }, ledger.userIds);

              if (ledger.photo && ledger.photo.startsWith("/img/user-ledger")) {
                fs.unlink(path.resolve("." + ledger.photo), function (err) {
                  console.log(err);
                });
              }

              res.status(200).send(result.value);
            });

          case 14:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x8, _x9, _x10) {
    return _ref4.apply(this, arguments);
  };
}());
router["delete"]("/:id", loginCheck(ledger_coll), checkParamsIdExists(collections.ledger), function (req, res, next) {
  if (req.userId !== req.convert_from_params.id.adminId) return res.status(403).json("No access"); // @ts-ignore

  var deleteFilter = {
    _id: req.params.id,
    adminId: req.userId
  };
  ledger_coll.deleteOne(deleteFilter, function (err, result) {
    if (err) return next(err);
    console.log("Delete row: " + req.params.id + " with filter: " + deleteFilter + ". Deleted: " + result.result.n);
    var ledger = req.convert_from_params.id;
    notification.send(req, {
      type: "ledger",
      action: "delete",
      ledger: ledger
    }, ledger.userIds);

    if (ledger.photo && ledger.photo.startsWith("/img/user-ledger")) {
      fs.unlink(path.resolve("." + ledger.photo), function (err) {
        console.log(err);
      });
    }

    res.status(200).send("Delete row: " + req.params.id + " from db Successfully!");
  });
});
router.get("/:id/records", loginCheck(ledger_coll), getLedgerAuthGuard(function (req) {
  return req.params.id;
}), /*#__PURE__*/function () {
  var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res) {
    var _req$query2, _one, _many, records;

    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _req$query2 = req.query, _one = _req$query2._one, _many = _req$query2._many;
            _context5.next = 3;
            return findWithRelation(collections.record, {
              ledgerId: req.params.id
            }, _one, _many);

          case 3:
            records = _context5.sent;
            res.status(200).json(records);

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
router.get("/:id/invitations", loginCheck(ledger_coll), getLedgerAuthGuard(function (req) {
  return req.params.id;
}), /*#__PURE__*/function () {
  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(req, res) {
    var _req$query3, _one, _many, invitations;

    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _req$query3 = req.query, _one = _req$query3._one, _many = _req$query3._many;
            _context6.next = 3;
            return findWithRelation(collections.invitation, {
              ledgerId: req.params.id
            }, _one, _many);

          case 3:
            invitations = _context6.sent;
            res.status(200).json(invitations);

          case 5:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function (_x13, _x14) {
    return _ref6.apply(this, arguments);
  };
}());
router.post("/:id/leave", loginCheck(ledger_coll), checkParamsIdExists(collections.ledger), getLedgerAuthGuard(function (req) {
  return req.convert_from_params.id;
}), /*#__PURE__*/function () {
  var _ref7 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(req, res) {
    var ledger;
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            if (!(req.convert_from_params.id.adminId === req.userId)) {
              _context7.next = 2;
              break;
            }

            return _context7.abrupt("return", res.status(400).json("Admin cannot leave ledger"));

          case 2:
            _context7.next = 4;
            return collections.ledger.updateOne({
              _id: req.params.id
            }, {
              $pull: {
                userIds: req.userId
              }
            });

          case 4:
            ledger = req.convert_from_params.id;
            notification.send(req, {
              type: "ledger",
              action: "leave",
              ledger: ledger
            }, ledger.userIds);
            res.status(200).json("success");

          case 7:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function (_x15, _x16) {
    return _ref7.apply(this, arguments);
  };
}());
router.post("/:id/leave/:userId", loginCheck(ledger_coll), checkParamsIdExists(collections.ledger), checkParamsIdExists(collections.user, "userId"), getLedgerAuthGuard(function (req) {
  return req.convert_from_params.id;
}), /*#__PURE__*/function () {
  var _ref8 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(req, res) {
    var ledger;
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            if (!(req.convert_from_params.id.adminId !== req.userId)) {
              _context8.next = 2;
              break;
            }

            return _context8.abrupt("return", res.status(403).json("Only admin can make people leave ledger"));

          case 2:
            if (!(req.params.userId === req.userId)) {
              _context8.next = 4;
              break;
            }

            return _context8.abrupt("return", res.status(400).json("Admin cannot leave ledger"));

          case 4:
            _context8.next = 6;
            return collections.ledger.updateOne({
              _id: req.params.id
            }, {
              $pull: {
                userIds: req.params.userId
              }
            });

          case 6:
            ledger = req.convert_from_params.id;
            notification.send(req, {
              type: "ledger",
              action: "kickout",
              to: req.convert_from_params.userId,
              ledger: ledger
            }, ledger.userIds);
            res.status(200).json("success");

          case 9:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function (_x17, _x18) {
    return _ref8.apply(this, arguments);
  };
}());
module.exports = router;