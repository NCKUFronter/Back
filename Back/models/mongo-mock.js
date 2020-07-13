"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

// @ts-check
var log = console.log;

var assert = require("assert");

var mongodb = require("mongo-mock");

mongodb.max_delay = 0;
var MongoClient = mongodb.MongoClient;
var dbfile = process.env.dbfile || "fronter.db";
var uri = "mongodb://localhost/uidd";

function getFronterClient() {
  /** @type { import('mongodb').MongoClient } */
  var client = null;
  return {
    db: function db() {
      return client.db("uidd");
    },
    connect: function () {
      var _connect = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return MongoClient.load(dbfile);

              case 3:
                _context.next = 8;
                break;

              case 5:
                _context.prev = 5;
                _context.t0 = _context["catch"](0);
                // console.log(err)
                console.log("db file not exist, will create one.");

              case 8:
                // @ts-ignore
                MongoClient.persist = dbfile;
                _context.next = 11;
                return MongoClient.connect(uri);

              case 11:
                client = _context.sent;

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[0, 5]]);
      }));

      function connect() {
        return _connect.apply(this, arguments);
      }

      return connect;
    }(),
    close: function close() {
      return client.close();
    }
  };
}

module.exports = getFronterClient;