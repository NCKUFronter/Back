"use strict";

// @ts-check
var router = require("express-promise-router")["default"]();

var loginCheck = require("../middleware/login-check");

var _require = require("../actions"),
    notification = _require.notification;

var _require2 = require("../middleware/sse.middleware"),
    SSE = _require2.SSE,
    sseMiddleware = _require2.sseMiddleware,
    onlineUser = _require2.onlineUser;

router.get("/notification", loginCheck(null), sseMiddleware, function (req, res) {
  /** @type {SSE} */
  var sse = res.sse;
  var obs$ = notification.listen().filter(function (e) {
    return e.data.type === "init" === (e.sessionID === req.sessionID);
  }).filter(function (e) {
    return e.toUserIds == null ? true : e.toUserIds.includes(req.userId) || req.userId === e.from._id;
  }).map(function (e) {
    return e.data;
  });
  sse.subscribe(obs$); // send init online users

  notification.send(req, {
    type: "init",
    action: "onlineUser",
    onlineUser: onlineUser
  });
  /*
  notification.send(req, {
    type: "invitation",
    action: "answer",
    body: {
      answer: false,
    },
    ledger: {
      name: "xxxxx"
    }
  }, ["1", "2"]);
  */
});
module.exports = router;