"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

// @ts-check
/// <reference types="../types" />
var router = require("express-promise-router")["default"]();

var _require = require("../models/mongo"),
    collections = _require.collections;

var loginCheck = require("../middleware/login-check");

var checkParamsIdExists = require("../middleware/check-params-id-exists");

var validatePipe = require("../middleware/validate-pipe");

var pointAction = require("../actions/point.actions");

var _require2 = require("../actions"),
    notification = _require2.notification;

var _require3 = require("../actions"),
    findWithRelation = _require3.findWithRelation,
    findOneWithRelation = _require3.findOneWithRelation;

var _require4 = require("../models/point-activity.model"),
    TransferPointsSchema = _require4.TransferPointsSchema,
    ConsumePointsSchema = _require4.ConsumePointsSchema;

var countDays = require("../actions/dateCount"); // GET from database


router.get("/activities", /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var _req$query, _one, _many, match, oneToManyFields, manyToManyFields, activities;

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
            return findWithRelation(collections.pointActivity, match, // @ts-ignore
            oneToManyFields, manyToManyFields);

          case 6:
            activities = _context.sent;
            res.status(200).json(activities);

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

router.get("/activities/:id", /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var oneToManyFields, manyToManyFields, activities;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            oneToManyFields = req.query._one;
            manyToManyFields = req.query._many;
            _context2.next = 4;
            return findOneWithRelation(collections.pointActivity, req.params.id, // @ts-ignore
            oneToManyFields, manyToManyFields);

          case 4:
            activities = _context2.sent;
            res.status(200).json(activities);

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
router.post("/transfer", validatePipe("body", TransferPointsSchema), loginCheck(collections.pointActivity), /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(req, res) {
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return pointAction.transferPoints("", req.body.amount, req.user, req.convert_from_body.email);

          case 2:
            console.log("transfer success");
            notification.send(req, {
              type: "point",
              action: "transfer",
              to: req.convert_from_body.email,
              body: req.body
            }, [req.convert_from_body.email._id]);
            res.status(200).json("transfer success");

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
router.post("/consume/:goodsId", validatePipe("body", ConsumePointsSchema), loginCheck(collections.pointActivity), checkParamsIdExists(collections.goods, "goodsId"), /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(req, res) {
    var goods;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            // const user = await collections.user.findOne({ _id: "1" });
            goods = req.convert_from_params.goodsId;

            if (goods) {
              _context4.next = 3;
              break;
            }

            return _context4.abrupt("return", res.status(404).json("Goods Not Found"));

          case 3:
            if (!(req.user.rewardPoints < goods.point)) {
              _context4.next = 5;
              break;
            }

            return _context4.abrupt("return", res.status(400).json("No enough points"));

          case 5:
            _context4.next = 7;
            return pointAction.consumePoints("", req.user, goods, req.body.quantity);

          case 7:
            notification.send(req, {
              type: "point",
              action: "consume",
              goodsId: req.params.goodsId,
              quantity: req.body.quantity
            }, [req.user._id]);
            res.status(200).json("consume success");

          case 9:
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
/*
router.post(
  "/loginEvent",
  loginCheck(collections.pointActivity),
  async function (req, res) {
    const user = req.user;
    const userUpdate = {};
    let total = 10;

    await pointAction.pointsFromEvent("每日", 10, user);

    userUpdate.$set = { lastLoginCheck: new Date() };
    if (user.lastLogin == null) {
      userUpdate.$set = { conDays: 1 };
    } else {
      // const new_conDays = countDays(new Date(), user.lastLoginCheck, user.conDays);
      let new_conDays = user.conDays + 1; // 先不算連續天數
      if (new_conDays !== user.conDays) {
        if (new_conDays % 7 == 0) {
          total = total + 10;
          await pointAction.pointsFromEvent("連續", 10, user);
          new_conDays = 0;
        }
        userUpdate.$set = { conDays: new_conDays };
      }
    }
    await collections.user.updateOne({ _id: req.userId }, userUpdate);
    res.status(200).json();
    */

/*
  const user = await collections.user.findOne({ _id: "1" });
  //console.log(user,user.logInDate, user.lastLogIn, user.conDays)
  const nowDate = user.logInDate;
  const lastDate = user.lastLogIn;
  //const nowday = user.logInDate.getTime();
  const conDays = user.conDays;
  console.log(user.conDays);
  const date = new Date();
  var diffTime = nowDate.getTime() - lastDate.getTime();
  var diffDate = diffTime / (1000 * 3600 * 24);
  var diff = (date.getTime() - nowDate.getTime()) / (1000 * 3600 * 24);
  console.log(diff);
  if (diff < 1) console.log("kkkkkkkkkkk");
  else {
    if (diffDate < 2) {
      console.log("conDays ++");
      user.conDays = user.conDays + 1;
    } else {
      console.log("n conDays");
      user.conDays = 1;
    }
  }
  if (user.conDays % 7 === 0) {
    await pointAction.pointsFromEvent("連續", 10, user);
  }

  collections.user.findOneAndUpdate(
    { _id: "1" },
    { $set: { conDays } },
    function (err, result) {
      console.log("ok");
    }
  );

  console.log(user.conDays);
  //const ;
  //countDays(user.logInDate, user.lastDate, user.conDays)

  await pointAction.pointsFromEvent("每日", 10, user);
  console.log("Info: API point/event success");
  res.status(200).json("Info: API point/event success");
  }
);
  */

module.exports = router;