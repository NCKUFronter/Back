"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

// @ts-check
var _require = require("../models/mongo"),
    collections = _require.collections;

var _require2 = require("../models"),
    LedgerModel = _require2.LedgerModel,
    UserModel = _require2.UserModel;
/**
 * @param {(req) => string | LedgerModel} ledgerIdFn 取得ledger id or ledger
 * @return {any}
 */


function getLedgerAuthGuard(ledgerIdFn) {
  /**
   * 假設使用者已經登入，確認使用者是否有Ledger權限
   */
  function ledgerAuthGuard(_x, _x2, _x3) {
    return _ledgerAuthGuard.apply(this, arguments);
  }

  function _ledgerAuthGuard() {
    _ledgerAuthGuard = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
      var ledger;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              /** @type {any} */
              ledger = ledgerIdFn(req);

              if (!(typeof ledger === "string")) {
                _context.next = 7;
                break;
              }

              _context.next = 4;
              return collections.ledger.findOne({
                _id: ledger
              });

            case 4:
              ledger = _context.sent;

              if (!(ledger == null)) {
                _context.next = 7;
                break;
              }

              return _context.abrupt("return", res.status(404).json("Ledger Not Found"));

            case 7:
              if (!(ledger.adminId == req.userId || ledger.userIds && ledger.userIds.includes(req.userId))) {
                _context.next = 11;
                break;
              }

              next();
              _context.next = 12;
              break;

            case 11:
              return _context.abrupt("return", res.status(403).json("No access"));

            case 12:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
    return _ledgerAuthGuard.apply(this, arguments);
  }

  return ledgerAuthGuard;
}

module.exports = {
  getLedgerAuthGuard: getLedgerAuthGuard
};