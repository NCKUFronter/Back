// @ts-check
const router = require("express").Router();
const { collections } = require("../models/mongo");
const loginCheck = require("../middleware/login-check");
const checkParamsIdExists = require("../middleware/check-params-id-exists");
const {
  findWithRelation,
  findOneWithRelation,
  notification,
} = require("../actions");
const { SSE, sseMiddleware } = require("../actions/sse.actions");

router.get("/notification", loginCheck(null), sseMiddleware, function (
  req,
  res
) {
  console.log(req.user);
  /** @type {SSE} */
  const sse = res.sse;
  const obs$ = notification.listen();
  sse.subscribe(obs$);
  setInterval(() => {
    notification.send(5)
  }, 5000)
});

module.exports = router;
