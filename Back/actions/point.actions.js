"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

// @ts-check

/** @typedef {import('mongodb').ClientSession} ClientSession */
var _require = require("../models/mongo"),
    client = _require.client,
    collections = _require.collections,
    simpleInsertOne = _require.simpleInsertOne,
    workInTransaction = _require.workInTransaction;

var assert = require("assert");

var _require2 = require("../models"),
    UserModel = _require2.UserModel,
    RecordModel = _require2.RecordModel,
    PointActivityModel = _require2.PointActivityModel;

var _require3 = require("./user.actions"),
    getCategoryTags = _require3.getCategoryTags;

function pointsFromEvent(_x, _x2, _x3) {
  return _pointsFromEvent.apply(this, arguments);
}
/**
 * 給予點數並將User, Record保存到資料庫
 * @param { string } subtype
 * @param { number } amount
 * @param { RecordModel } record 尚未保存的record
 * @param { UserModel } user
 * @return { Promise<boolean> } 是否成功
 */


function _pointsFromEvent() {
  _pointsFromEvent = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(subtype, amount, user) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", innerGivenPoints(subtype, amount, null, user));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _pointsFromEvent.apply(this, arguments);
}

function pointsFromRecord(_x4, _x5, _x6, _x7) {
  return _pointsFromRecord.apply(this, arguments);
}
/**
 * @param { string } subtype
 * @param { number } amount
 * @param { RecordModel= } record 要直接保存的Record
 * @param { UserModel } user
 * @return { Promise<boolean> } 是否成功
 */


function _pointsFromRecord() {
  _pointsFromRecord = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(subtype, amount, record, user) {
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            record.rewardPoints = amount;
            record.reviseDate = new Date().toISOString();
            console.log(record);
            return _context2.abrupt("return", innerGivenPoints(subtype, amount, record, user));

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _pointsFromRecord.apply(this, arguments);
}

function innerGivenPoints(_x8, _x9, _x10, _x11) {
  return _innerGivenPoints.apply(this, arguments);
} // 不檢查是否不能轉移

/**
 * @param { string } subtype
 * @param { number } amount
 * @param { UserModel } fromUser
 * @param { UserModel } toUser
 * @return { Promise<boolean> } 是否成功
 */


function _innerGivenPoints() {
  _innerGivenPoints = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(subtype, amount, record, user) {
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            return _context4.abrupt("return", workInTransaction( /*#__PURE__*/function () {
              var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(
              /** @type {ClientSession} */
              session) {
                var recordId, userUpdate, user_prom, activity, activity_prom;
                return _regenerator["default"].wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        recordId = null;
                        userUpdate = {
                          $inc: {
                            rewardPoints: amount
                          }
                        };

                        if (!record) {
                          _context3.next = 8;
                          break;
                        }

                        _context3.next = 5;
                        return simpleInsertOne(collections.record, record, session);

                      case 5:
                        recordId = _context3.sent.insertedId;
                        console.log(recordId); // add hashtags to user

                        if (record.hashtags) {
                          userUpdate.$addToSet = (0, _defineProperty2["default"])({}, "categoryTags.".concat(record.categoryId), {
                            $each: record.hashtags
                          });
                        }

                      case 8:
                        // update user
                        user_prom = collections.user.updateOne({
                          _id: user._id
                        }, userUpdate, {
                          session: session
                        }); // create activity

                        activity = new PointActivityModel("new", subtype, amount, recordId, user._id); // save activity

                        activity_prom = null;

                        if (amount) {
                          activity_prom = simpleInsertOne(collections.pointActivity, activity, session);
                        }

                        _context3.next = 14;
                        return Promise.all([user_prom, activity_prom]);

                      case 14:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              }));

              return function (_x20) {
                return _ref.apply(this, arguments);
              };
            }()));

          case 1:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _innerGivenPoints.apply(this, arguments);
}

function transferPoints(_x12, _x13, _x14, _x15) {
  return _transferPoints.apply(this, arguments);
} // 不檢查是否無法兌換

/**
 * @param { string } subtype
 * @param { UserModel } user
 * @param { object } goods
 * @param { number } quantity
 * @return { Promise<boolean> } 是否成功
 */


function _transferPoints() {
  _transferPoints = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(subtype, amount, fromUser, toUser) {
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            assert(fromUser.rewardPoints >= amount);
            return _context6.abrupt("return", workInTransaction( /*#__PURE__*/function () {
              var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(session) {
                var from_user_prom, to_user_prom, activity, activity_prom;
                return _regenerator["default"].wrap(function _callee5$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        // update user
                        from_user_prom = collections.user.updateOne({
                          _id: fromUser._id
                        }, {
                          $inc: {
                            rewardPoints: -amount
                          }
                        }, {
                          session: session
                        });
                        to_user_prom = collections.user.updateOne({
                          _id: toUser._id
                        }, {
                          $inc: {
                            rewardPoints: amount
                          }
                        }, {
                          session: session
                        });
                        activity = new PointActivityModel("transfer", subtype, amount, fromUser._id, toUser._id);
                        activity_prom = simpleInsertOne(collections.pointActivity, activity, session);
                        _context5.next = 6;
                        return Promise.all([from_user_prom, to_user_prom, activity_prom]);

                      case 6:
                      case "end":
                        return _context5.stop();
                    }
                  }
                }, _callee5);
              }));

              return function (_x21) {
                return _ref2.apply(this, arguments);
              };
            }()));

          case 2:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _transferPoints.apply(this, arguments);
}

function consumePoints(_x16, _x17, _x18, _x19) {
  return _consumePoints.apply(this, arguments);
}

function _consumePoints() {
  _consumePoints = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8(subtype, user, goods, quantity) {
    return _regenerator["default"].wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            assert(user.rewardPoints >= goods.point);
            return _context8.abrupt("return", workInTransaction( /*#__PURE__*/function () {
              var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(session) {
                var user_prom, game_user_prom, activity, activity_prom;
                return _regenerator["default"].wrap(function _callee7$(_context7) {
                  while (1) {
                    switch (_context7.prev = _context7.next) {
                      case 0:
                        // update user
                        user_prom = collections.user.updateOne({
                          _id: user._id
                        }, {
                          $inc: {
                            rewardPoints: -goods.point * quantity
                          }
                        }, {
                          session: session
                        });
                        game_user_prom = collections.gameUser.updateOne({
                          _id: user.gameUserId
                        }, {
                          $inc: (0, _defineProperty2["default"])({}, "bag." + goods._id, quantity)
                        }, {
                          session: session
                        });
                        activity = new PointActivityModel("consume", subtype, goods.point * quantity, user._id, goods._id);
                        activity.quantity = quantity;
                        activity_prom = simpleInsertOne(collections.pointActivity, activity, session);
                        _context7.next = 7;
                        return Promise.all([user_prom, activity_prom, game_user_prom]);

                      case 7:
                      case "end":
                        return _context7.stop();
                    }
                  }
                }, _callee7);
              }));

              return function (_x22) {
                return _ref3.apply(this, arguments);
              };
            }()));

          case 2:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));
  return _consumePoints.apply(this, arguments);
}

module.exports = {
  pointsFromEvent: pointsFromEvent,
  pointsFromRecord: pointsFromRecord,
  transferPoints: transferPoints,
  consumePoints: consumePoints
};