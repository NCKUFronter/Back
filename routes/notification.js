// @ts-check
const router = require("express").Router();
const loginCheck = require("../middleware/login-check");
const { notification } = require("../actions");
const {
  SSE,
  sseMiddleware,
  onlineUser,
} = require("../middleware/sse.middleware");

router.get("/notification", loginCheck(null), sseMiddleware, function (
  req,
  res
) {
  /** @type {SSE} */
  const sse = res.sse;
  const obs$ = notification
    .listen()
    .tap(console.log)
    .filter((e) => (e.data.type === "init") === (e.sessionID === req.sessionID))
    .filter((e) => {
      return e.toUserIds == null
        ? true
        : e.toUserIds.includes(req.userId) || req.userId === e.from._id;
    })
    .map((e) => e.data);
  sse.subscribe(obs$);
  // send init online users
  notification.send(req, {
    type: "init",
    action: "onlineUser",
    onlineUser,
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
