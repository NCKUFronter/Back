"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

// @ts-check

/** @typedef {import('mongodb').ClientSession} ClientSession */
var _require = require("../models/mongo"),
    collections = _require.collections,
    simpleInsertOne = _require.simpleInsertOne,
    workInTransaction = _require.workInTransaction;

var assert = require("assert");

var _require2 = require("../models"),
    InvitationModel = _require2.InvitationModel,
    LedgerModel = _require2.LedgerModel,
    UserModel = _require2.UserModel;
/**
 * @param {LedgerModel} ledger
 * @param {UserModel} fromUser
 * @param {UserModel} toUser
 * @return {Promise<boolean>} 是否成功
 */


function invite(_x, _x2, _x3) {
  return _invite.apply(this, arguments);
}
/**
 * @param {InvitationModel} invitation
 * @param {boolean} answer
 * @return {Promise<boolean>} 是否成功
 */


function _invite() {
  _invite = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(ledger, fromUser, toUser) {
    var invitation;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            // 假設參數都是對的，不做任何正確性檢查
            assert(ledger.adminId == fromUser._id || ledger.userIds.includes(fromUser._id));
            assert(ledger.adminId != toUser._id && !ledger.userIds.includes(toUser._id));
            invitation = new InvitationModel(ledger._id, fromUser._id, toUser._id);
            return _context2.abrupt("return", workInTransaction( /*#__PURE__*/function () {
              var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(session) {
                return _regenerator["default"].wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return simpleInsertOne(collections.invitation, invitation, session);

                      case 2:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function (_x6) {
                return _ref.apply(this, arguments);
              };
            }()));

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _invite.apply(this, arguments);
}

function answerInvitation(_x4, _x5) {
  return _answerInvitation.apply(this, arguments);
}

function _answerInvitation() {
  _answerInvitation = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(invitation, answer) {
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            // 假設參數都是對的，不做任何正確性檢查
            assert.equal(invitation.type, 2);
            if (!(invitation instanceof InvitationModel)) invitation = InvitationModel.fromObject(invitation);
            invitation.answer(answer);
            return _context4.abrupt("return", workInTransaction( /*#__PURE__*/function () {
              var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(session) {
                var ledger_prom, invit_prom;
                return _regenerator["default"].wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        ledger_prom = null;

                        if (invitation.type == 1) {
                          ledger_prom = collections.ledger.updateOne({
                            _id: invitation.ledgerId
                          }, {
                            $addToSet: {
                              userIds: invitation.toUserId
                            }
                          }, {
                            session: session
                          });
                        }

                        invit_prom = collections.invitation.updateOne({
                          _id: invitation._id
                        }, {
                          $set: invitation
                        }, {
                          session: session
                        });
                        _context3.next = 5;
                        return Promise.all([ledger_prom, invit_prom]);

                      case 5:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              }));

              return function (_x7) {
                return _ref2.apply(this, arguments);
              };
            }()));

          case 4:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _answerInvitation.apply(this, arguments);
}

module.exports = {
  answerInvitation: answerInvitation,
  invite: invite
};