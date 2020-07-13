"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

// @ts-check
var _require = require("../models/mongo"),
    collections = _require.collections;

var _require2 = require("../models"),
    UserModel = _require2.UserModel,
    RecordModel = _require2.RecordModel;
/** @param {string} userId */


function userInvitations(userId) {
  return collections.invitation.find({
    toUserId: userId,
    type: 2
  }).toArray();
}
/** @param {string} userId */


function userLedgers(userId) {
  return collections.ledger.find({
    userIds: userId
  }).toArray();
}
/** @param {string} userId */


function userPointActivities(userId) {
  return collections.pointActivity.find({
    $or: [{
      fromUserId: userId
    }, {
      toUserId: userId
    }]
  }).toArray();
}
/**
 * 假設record內一定有hashtags
 * @param {RecordModel} record
 * @param {UserModel} user
 * @return categoryTags
 */


function getCategoryTags(record, user) {
  var categoryTags = user.categoryTags ? user.categoryTags : {};
  if (!categoryTags[record.categoryId]) categoryTags[record.categoryId] = [];
  var now_tags = new Set([].concat((0, _toConsumableArray2["default"])(record.hashtags), (0, _toConsumableArray2["default"])(categoryTags[record.categoryId])));
  categoryTags[record.categoryId] = Array.from(now_tags);
  return categoryTags;
}
/** @param {string} userId */


function userRelativeUserIds(_x) {
  return _userRelativeUserIds.apply(this, arguments);
}

function _userRelativeUserIds() {
  _userRelativeUserIds = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(userId) {
    var results, userIds, i;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return collections.ledger.aggregate([{
              $match: {
                $or: [{
                  userIds: userId
                }, {
                  adminId: userId
                }]
              }
            }, {
              $group: {
                _id: 0,
                user: {
                  $push: "$userIds"
                }
              }
            }, {
              $project: {
                userIds: {
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
            results = _context.sent;

            if (!(results.length == 0)) {
              _context.next = 5;
              break;
            }

            return _context.abrupt("return", []);

          case 5:
            userIds = results[0].userIds;
            i = 0;

          case 7:
            if (!(i < userIds.length)) {
              _context.next = 14;
              break;
            }

            if (!(userIds[i] === userId)) {
              _context.next = 11;
              break;
            }

            userIds.splice(i, 1);
            return _context.abrupt("break", 14);

          case 11:
            i++;
            _context.next = 7;
            break;

          case 14:
            return _context.abrupt("return", userIds);

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _userRelativeUserIds.apply(this, arguments);
}

function serializeUser(user) {
  if (!user) return user;
  var _id = user._id,
      name = user.name,
      email = user.email,
      photo = user.photo;
  return {
    _id: _id,
    name: name,
    email: email,
    photo: photo
  };
}

module.exports = {
  userInvitations: userInvitations,
  userLedgers: userLedgers,
  userPointActivities: userPointActivities,
  getCategoryTags: getCategoryTags,
  userRelativeUserIds: userRelativeUserIds,
  serializeUser: serializeUser
};