// @ts-check
const router = require("express").Router();
const loginCheck = require("../middleware/login-check");
const { notification } = require("../actions");
const { SSE, sseMiddleware } = require("../middleware/sse.middleware");

router.get("/notification", loginCheck(null), sseMiddleware, function (
  req,
  res
) {
  /** @type {SSE} */
  const sse = res.sse;
  const obs$ = notification
    .listen()
    .filter((e) => e.sessionID != req.sessionID)
    .filter((e) => {
      console.log({
        send:
          e.toUserIds == null
            ? true
            : e.toUserIds.includes(req.userId) || req.userId === e.from._id,
      });
      return e.toUserIds == null
        ? true
        : e.toUserIds.includes(req.userId) || req.userId === e.from._id;
    })
    .map((e) => e.data);
  sse.subscribe(obs$);
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
