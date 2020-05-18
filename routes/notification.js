// @ts-check
const router = require("express").Router();
const loginCheck = require("../middleware/login-check");
const { notification } = require("../actions");
const { SSE, sseMiddleware } = require("../actions/sse.actions");

router.get("/notification", loginCheck(null), sseMiddleware, function (
  req,
  res
) {
  console.log(req.user);
  /** @type {SSE} */
  const sse = res.sse;
  const obs$ = notification
    .listen()
    .filter((e) => e.data.from._id != req.userId)
    .filter((e) => (e.toUsers != null ? true : e.toUsers.includes(req.userId)))
    .map((e) => e.data);
  sse.subscribe(obs$);
});

module.exports = router;
