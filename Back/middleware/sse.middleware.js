"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// @ts-check
/// <reference types="../types" />
var stringify = require("fast-stable-stringify");

var _require = require("../actions/notification.service"),
    notification = _require.notification,
    sseMessage = _require.sseMessage;

var SSE = /*#__PURE__*/function () {
  /** @type {import('fastrx').Sink[]} */

  /**
   * @param {import('express').Response} res
   */
  function SSE(res) {
    var _this = this;

    (0, _classCallCheck2["default"])(this, SSE);
    (0, _defineProperty2["default"])(this, "keepAlive", void 0);
    (0, _defineProperty2["default"])(this, "isClose", false);
    (0, _defineProperty2["default"])(this, "subscriptions", []);

    /** @type {import('express').Response} res */
    this.res = res;
    this.keepAlive = setInterval(function () {
      if (!_this.isClose) {
        _this.send("keep-alive", "", true);
      }
    }, 20000);
  }
  /**
   * @param {any} data
   * @param {string} field
   * @param {boolean} end = false
   */


  (0, _createClass2["default"])(SSE, [{
    key: "send",
    value: function send(data, field) {
      var end = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if (field === "data") {
        data = this.serialize(data);
      }

      var content = "".concat(field, ": ").concat(data, "\n");
      if (end) content += "\n";
      this.res.write(content);
    }
    /**
     * @param {any} data
     * @param {string} eventName = "message"
     */

  }, {
    key: "sendEvent",
    value: function sendEvent(data) {
      var eventName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "message";
      this.send(eventName, "event");
      this.send(data, "data", true);
    }
    /**
     * @param {import('fastrx').Rx.Observable} source$
     * @param {string=} eventName
     */

  }, {
    key: "subscribe",
    value: function subscribe(source$, eventName) {
      var _this2 = this;

      var subscription = source$.subscribe(function (data) {
        _this2.sendEvent(data, eventName);
      }); // console.log(subscription);
      // console.log(subscription.dispose);

      this.subscriptions.push(subscription);
    }
  }, {
    key: "unsubscribeAll",
    value: function unsubscribeAll() {
      var _iterator = _createForOfIteratorHelper(this.subscriptions),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var subscription = _step.value;
          subscription.dispose();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "close",
    value: function close() {
      this.isClose = true;
      clearInterval(this.keepAlive);
      this.unsubscribeAll();
    }
    /**
     * @param {any} data
     * @return {string}
     */

  }, {
    key: "serialize",
    value: function serialize(data) {
      return stringify(data);
    }
  }]);
  return SSE;
}();

var connections = {};
var onlineUser = {};

function sseMiddleware(req, res, next) {
  if (connections[req.sessionID]) return res.status(400).json("Already connected");else connections[req.sessionID] = 1;

  if (onlineUser[req.userId] == null) {
    onlineUser[req.userId] = 1;
    notification.sendToRelativeUsers(req, {
      type: "user",
      action: "online"
    });
  } else onlineUser[req.userId]++; // console.log({ onlineUser, connections });


  req.socket.setTimeout(0);
  req.socket.setNoDelay(true);
  req.socket.setKeepAlive(true); // header
  // from https://zhuanlan.zhihu.com/p/47099953

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no" // "Access-Control-Allow-Origin": "*",

  }); // 2kB of padding (for IE)

  res.write(":" + Array(2049).join(" ") + "\n");
  res.write("retry: 2000\n\n");
  var sse = new SSE(res);
  res.sse = sse; // let controller can get SSE object in nestjs

  res.on("close", function () {
    delete connections[req.sessionID]; // avoid reconnect immediately

    setTimeout(function () {
      if (onlineUser[req.userId] == 1) {
        notification.sendToRelativeUsers(req, {
          type: "user",
          action: "offline"
        });
        delete onlineUser[req.userId];
      } else onlineUser[req.userId]--;
    }, 3000);
    sse.close();
  });
  next();
}

module.exports = {
  SSE: SSE,
  sseMiddleware: sseMiddleware,
  sseMessage: sseMessage,
  onlineUser: onlineUser,
  connections: connections
};