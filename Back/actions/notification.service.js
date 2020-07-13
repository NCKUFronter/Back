"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

// @ts-nocheck
var _require = require("fastrx"),
    rx = _require.rx;

var _require2 = require("../models/mongo"),
    collections = _require2.collections;

var _require3 = require("../actions/user.actions"),
    userRelativeUserIds = _require3.userRelativeUserIds,
    serializeUser = _require3.serializeUser;
/** @typedef {import('fastrx').Sink} Sink */

/** @typedef {import('fastrx').Rx.Observable} Observable */


function sseMessage(req, data, toUserIds) {
  data.from = serializeUser(req.user);
  data.time = Date.now();
  return {
    sessionID: req.sessionID,
    toUserIds: toUserIds,
    data: data,
    from: req.user
  };
}

var NotificationService = /*#__PURE__*/function () {
  function NotificationService() {
    (0, _classCallCheck2["default"])(this, NotificationService);
    (0, _defineProperty2["default"])(this, "_subject", rx.subject());
  }

  (0, _createClass2["default"])(NotificationService, [{
    key: "send",

    /**
     * @param {import('express').Request} req
     * @param {any} data
     * @param {string[]=} toUserIds
     */
    value: function send(req, data, toUserIds) {
      this._subject.next(sseMessage(req, data, toUserIds));
    }
  }, {
    key: "sendToLedgerUsers",
    value: function () {
      var _sendToLedgerUsers = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, data, ledgerId) {
        var ledger;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return collections.ledger.findOne({
                  _id: ledgerId
                });

              case 2:
                ledger = _context.sent;
                data.ledger = ledger;
                this.send(req, data, ledger.userIds);

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function sendToLedgerUsers(_x, _x2, _x3) {
        return _sendToLedgerUsers.apply(this, arguments);
      }

      return sendToLedgerUsers;
    }()
  }, {
    key: "sendToRelativeUsers",
    value: function () {
      var _sendToRelativeUsers = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, data) {
        var toUserIds;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return userRelativeUserIds(req.userId);

              case 2:
                toUserIds = _context2.sent;
                this.send(req, data, toUserIds);

              case 4:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function sendToRelativeUsers(_x4, _x5) {
        return _sendToRelativeUsers.apply(this, arguments);
      }

      return sendToRelativeUsers;
    }()
    /** @return {Observable} */

  }, {
    key: "listen",
    value: function listen() {
      return this._subject;
    }
  }]);
  return NotificationService;
}();

module.exports = {
  notification: new NotificationService(),
  sseMessage: sseMessage
};