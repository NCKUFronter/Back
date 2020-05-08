const router = require("express").Router();
const { collections } = require("../models/mongo");
const loginCheck = require("../middleware/login-check");
const validatePipe = require("../middleware/validate-pipe");
const pointAction = require("../actions/point.actions");
const {
  TransferPointsSchema,
  ConsumePointsSchema,
} = require("../models/point-activity.model");
const countDays = require("../actions/dateCount");

router.post(
  "/transfer",
  validatePipe(TransferPointsSchema),
  loginCheck(collections.pointActivity),
  async function (req, res) {
    // const from = await collections.user.findOne({ _id: req.userId });
    // const to = await collections.user.findOne({ email: "father@gmail.com" });

    await pointAction.transferPoints(
      "",
      req.body.amount,
      req.user,
      req.convert_from_body.email
    );

    console.log("transfer success");
    res.status(200);
  }
);

router.post(
  "/consume/:goodsId",
  validatePipe(ConsumePointsSchema),
  loginCheck(collections.pointActivity),
  async function (req, res) {
    // const user = await collections.user.findOne({ _id: "1" });
    const goods = await collections.goods.findOne({ _id: req.params.goodsId });
    if (!goods) return res.status(404).json("Goods Not Found");
    if (req.user.rewardPoints < goods.point)
      return res.status(400).json("No enough points");

    // console.log(user, good);
    pointAction.consumePoints("", user, goods);

    console.log("consume success");
    res.status(200);
  }
);

router.post("/event", loginCheck(collections.pointActivity), async function (
  req,
  res
) {
  const user = await collections.user.findOne({ _id: "1" });
  //console.log(user,user.logInDate, user.lastLogIn, user.conDays)
  const nowDate = user.logInDate;
  const lastDate = user.lastLogIn;
  //const nowday = user.logInDate.getTime();
  const conDays = user.conDays;
  console.log(user.conDays);
  const date = new Date();
  var diffTime = nowDate.getTime() - lastDate.getTime();
  var diffDate = diffTime / (1000 * 3600 * 24);
  var diff = (date.getTime() - nowDate.getTime()) / (1000 * 3600 * 24);
  console.log(diff);
  if (diff < 1) console.log("kkkkkkkkkkk");
  else {
    if (diffDate < 2) {
      console.log("conDays ++");
      user.conDays = user.conDays + 1;
    } else {
      console.log("n conDays");
      user.conDays = 1;
    }
  }
  if (user.conDays % 7 === 0) {
    pointAction.pointsFromEvent("連續", 10, user);
  }

  collections.user.findOneAndUpdate(
    { _id: "1" },
    { $set: { conDays } },
    function (err, result) {
      console.log("ok");
    }
  );

  console.log(user.conDays);
  //const ;
  //countDays(user.logInDate, user.lastDate, user.conDays)

  pointAction.pointsFromEvent("每日", 10, user);
  console.log("Info: API point/event success");
  res.status(200);
});

module.exports = router;
