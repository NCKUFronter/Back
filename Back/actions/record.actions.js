"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

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
/**
 * @param {RecordModel} old_record
 * @param {any} update_dto
 */


function updateRecord(_x, _x2) {
  return _updateRecord.apply(this, arguments);
}
/**
 * @param {RecordModel} record
 * @param {string} userId
 */


function _updateRecord() {
  _updateRecord = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(old_record, update_dto) {
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", workInTransaction( /*#__PURE__*/function () {
              var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(session) {
                var userUpdate, activity_prom, new_point, new_record, user_prom, record_prom;
                return _regenerator["default"].wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        userUpdate = {}; // 1. update rewardPoints

                        activity_prom = null;

                        if (update_dto.money) {
                          new_point = Math.round(update_dto.money / 100);
                          update_dto.rewardPoints = new_point;

                          if (new_point !== old_record.rewardPoints) {
                            // 1.1 count user new point
                            userUpdate.$inc = {
                              rewardPoints: new_point - old_record.rewardPoints
                            }; // 1.2 update activity

                            activity_prom = collections.pointActivity.updateOne({
                              fromRecordId: old_record._id
                            }, {
                              $set: {
                                amount: new_point
                              }
                            }, {
                              session: session
                            });
                          }
                        } // 2. update user categoryTags


                        if (update_dto.categoryId || update_dto.hashtags) {
                          new_record = Object.assign(old_record, update_dto);
                          userUpdate.$addToSet = (0, _defineProperty2["default"])({}, "categoryTags.".concat(new_record.categoryId), {
                            $each: new_record.hashtags
                          });
                        } // 3. update user


                        user_prom = null;

                        if (userUpdate.$inc || userUpdate.$addToSet) {
                          user_prom = collections.user.updateOne({
                            _id: old_record.userId
                          }, userUpdate, {
                            session: session
                          });
                        } // 4. update record


                        record_prom = collections.record.updateOne({
                          _id: old_record._id
                        }, {
                          $set: update_dto
                        }, {
                          session: session
                        });
                        _context.next = 9;
                        return Promise.all([activity_prom, record_prom, user_prom]);

                      case 9:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function (_x5) {
                return _ref.apply(this, arguments);
              };
            }()));

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _updateRecord.apply(this, arguments);
}

function removeRecord(_x3, _x4) {
  return _removeRecord.apply(this, arguments);
}

function _removeRecord() {
  _removeRecord = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(record, userId) {
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            return _context4.abrupt("return", workInTransaction( /*#__PURE__*/function () {
              var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(session) {
                var activity_prom, record_prom, user_prom;
                return _regenerator["default"].wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        // 1. delete pointActivity
                        activity_prom = collections.pointActivity.deleteOne({
                          fromRecordId: record._id
                        }, {
                          session: session
                        }); // 2. delete record

                        record_prom = collections.record.deleteOne({
                          _id: record._id
                        }, {
                          session: session
                        }); // 3. decrease user rewardPoints

                        user_prom = collections.user.updateOne({
                          _id: userId
                        }, {
                          $inc: {
                            rewardPoints: -record.rewardPoints
                          }
                        }, {
                          session: session
                        });
                        _context3.next = 5;
                        return Promise.all([activity_prom, record_prom, user_prom]);

                      case 5:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              }));

              return function (_x6) {
                return _ref2.apply(this, arguments);
              };
            }()));

          case 1:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _removeRecord.apply(this, arguments);
}

module.exports = {
  removeRecord: removeRecord,
  updateRecord: updateRecord
};