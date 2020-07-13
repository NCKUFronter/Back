"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// @ts-check
// mongoDB init
// var config = require('../config');
// const { MongoClient } = require("mongodb");

/** @typedef { import('mongodb').Collection } Collection */

/** @typedef {import('mongodb').ClientSession} ClientSession */
var uri = process.env.DB_URI; // config.mongo.uri;

var client = require("./mongo-mock")();

var collections = {
  /** @type {Collection} */
  record: null,

  /** @type {Collection} */
  user: null,

  /** @type {Collection} */
  ledger: null,

  /** @type {Collection} */
  category: null,

  /** @type {Collection} */
  goods: null,

  /** @type {Collection} */
  pointActivity: null,

  /** @type {Collection} */
  counter: null,

  /** @type {Collection} */
  invitation: null,

  /** @type {Collection} */
  gameUser: null
};

function connectDB() {
  return _connectDB.apply(this, arguments);
}
/**
 * 小心這個會直接修改到資料庫數值
 * @param {string} coll_name
 * @param {ClientSession=} session
 * @return {Promise<string>}
 */


function _connectDB() {
  _connectDB = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
    var db;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return client.connect();

          case 2:
            console.log("DB connection successed"); // init

            db = client.db();
            collections.record = db.collection("record");
            collections.category = db.collection("category");
            collections.user = db.collection("user");
            collections.ledger = db.collection("ledger");
            collections.goods = db.collection("goods");
            collections.counter = db.collection("counter");
            collections.pointActivity = db.collection("point-activity");
            collections.invitation = db.collection("invitation");
            collections.gameUser = db.collection("game-user"); // mock session for lower version mongodb

            if (true || process.env.NO_TRANSACTION) {
              // @ts-ignore
              client.startSession = function () {
                return {
                  withTransaction: function () {
                    var _withTransaction = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(fn) {
                      return _regenerator["default"].wrap(function _callee$(_context) {
                        while (1) {
                          switch (_context.prev = _context.next) {
                            case 0:
                              _context.next = 2;
                              return fn(null);

                            case 2:
                            case "end":
                              return _context.stop();
                          }
                        }
                      }, _callee);
                    }));

                    function withTransaction(_x8) {
                      return _withTransaction.apply(this, arguments);
                    }

                    return withTransaction;
                  }(),
                  endSession: function endSession() {}
                };
              };
            }

          case 14:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _connectDB.apply(this, arguments);
}

function fetchNextId(_x, _x2) {
  return _fetchNextId.apply(this, arguments);
}
/**
 * @param {string} coll_name
 * @return {Promise<string>}
 */


function _fetchNextId() {
  _fetchNextId = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(coll_name, session) {
    var coll_document;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return collections.counter.findOneAndUpdate({
              _id: coll_name
            }, {
              $inc: {
                nowId: 1
              }
            }, {
              session: session,
              returnOriginal: false
            });

          case 2:
            coll_document = _context3.sent;
            return _context3.abrupt("return", String(coll_document.value.nowId));

          case 4:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));
  return _fetchNextId.apply(this, arguments);
}

function fetchNowId(_x3) {
  return _fetchNowId.apply(this, arguments);
}
/**
 * @param {Collection} coll
 * @param {object} value
 * @param {ClientSession=} session
 */


function _fetchNowId() {
  _fetchNowId = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(coll_name) {
    var coll_document;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return collections.counter.findOne({
              _id: coll_name
            });

          case 2:
            coll_document = _context4.sent;
            return _context4.abrupt("return", String(coll_document.nowId));

          case 4:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));
  return _fetchNowId.apply(this, arguments);
}

function simpleInsertOne(_x4, _x5, _x6) {
  return _simpleInsertOne.apply(this, arguments);
}
/**
 * @param {(session: ClientSession) => Promise<void>} fn
 */


function _simpleInsertOne() {
  _simpleInsertOne = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(coll, value, session) {
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.t0 = coll;
            _context5.t1 = _objectSpread;
            _context5.t2 = _objectSpread({}, value);
            _context5.t3 = {};
            _context5.next = 6;
            return fetchNextId(coll.collectionName);

          case 6:
            _context5.t4 = _context5.sent;
            _context5.t5 = {
              _id: _context5.t4
            };
            _context5.t6 = (0, _context5.t1)(_context5.t2, _context5.t3, _context5.t5);
            _context5.t7 = {
              session: session
            };
            return _context5.abrupt("return", _context5.t0.insertOne.call(_context5.t0, _context5.t6, _context5.t7));

          case 11:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));
  return _simpleInsertOne.apply(this, arguments);
}

function workInTransaction(_x7) {
  return _workInTransaction.apply(this, arguments);
}

function _workInTransaction() {
  _workInTransaction = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(fn) {
    var session;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            session = client.startSession();
            _context6.prev = 1;
            _context6.next = 4;
            return session.withTransaction(fn);

          case 4:
            _context6.next = 12;
            break;

          case 6:
            _context6.prev = 6;
            _context6.t0 = _context6["catch"](1);
            console.log(_context6.t0);
            _context6.next = 11;
            return session.endSession();

          case 11:
            throw _context6.t0;

          case 12:
            _context6.next = 14;
            return session.endSession();

          case 14:
            return _context6.abrupt("return", true);

          case 15:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[1, 6]]);
  }));
  return _workInTransaction.apply(this, arguments);
}

module.exports = {
  client: client,
  connectDB: connectDB,
  collections: collections,
  fetchNextId: fetchNextId,
  fetchNowId: fetchNowId,
  simpleInsertOne: simpleInsertOne,
  workInTransaction: workInTransaction
};