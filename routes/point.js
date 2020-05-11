// @ts-check
/// <reference types="../types" />
const router = require("express").Router();
const { collections } = require("../models/mongo");
const loginCheck = require("../middleware/login-check");
const checkParamsIdExists = require("../middleware/check-params-id-exists");
const validatePipe = require("../middleware/validate-pipe");
const pointAction = require("../actions/point.actions");
const { findWithRelation, findOneWithRelation } = require("../actions");
const {
  TransferPointsSchema,
  ConsumePointsSchema,
} = require("../models/point-activity.model");
const countDays = require("../actions/dateCount");

// GET from database
router.get("/activities", async function (req, res) {
  // collRelation(record_coll, 'category', 'categoryId', '_id', 'categoryData');
  console.log(req.query);
  const { _one, _many, ...match } = req.query;
  const oneToManyFields = req.query._one;
  const manyToManyFields = req.query._many;

  const activities = await findWithRelation(
    collections.pointActivity,
    match,
    // @ts-ignore
    oneToManyFields,
    manyToManyFields
  );
  res.status(200).json(activities);
});

// GET certain data from database
router.get("/activities/:id", async function (req, res) {
  const oneToManyFields = req.query._one;
  const manyToManyFields = req.query._many;
  const activities = await findOneWithRelation(
    collections.pointActivity,
    req.params.id,
    // @ts-ignore
    oneToManyFields,
    manyToManyFields
  );
  res.status(200).json(activities);
});
router.post(
  "/transfer",
  validatePipe("body", TransferPointsSchema),
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
    res.status(200).json("transfer success");
  }
);

router.post(
  "/consume/:goodsId",
  validatePipe("body", ConsumePointsSchema),
  loginCheck(collections.pointActivity),
  checkParamsIdExists(collections.goods, "goodsId"),
  async function (req, res) {
    // const user = await collections.user.findOne({ _id: "1" });
    const goods = req.convert_from_params.goodsId;
    if (!goods) return res.status(404).json("Goods Not Found");
    if (req.user.rewardPoints < goods.point)
      return res.status(400).json("No enough points");

    // console.log(user, good);
    await pointAction.consumePoints("", req.user, goods, req.body.quantity);

    res.status(200).json("consume success");
  }
);

/*
router.post(
  "/loginEvent",
  loginCheck(collections.pointActivity),
  async function (req, res) {
    const user = req.user;
    const userUpdate = {};
    let total = 10;

    await pointAction.pointsFromEvent("每日", 10, user);

    userUpdate.$set = { lastLoginCheck: new Date() };
    if (user.lastLogin == null) {
      userUpdate.$set = { conDays: 1 };
    } else {
      // const new_conDays = countDays(new Date(), user.lastLoginCheck, user.conDays);
      let new_conDays = user.conDays + 1; // 先不算連續天數
      if (new_conDays !== user.conDays) {
        if (new_conDays % 7 == 0) {
          total = total + 10;
          await pointAction.pointsFromEvent("連續", 10, user);
          new_conDays = 0;
        }
        userUpdate.$set = { conDays: new_conDays };
      }
    }
    await collections.user.updateOne({ _id: req.userId }, userUpdate);
    res.status(200).json();
    */

    /*
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
    await pointAction.pointsFromEvent("連續", 10, user);
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

  await pointAction.pointsFromEvent("每日", 10, user);
  console.log("Info: API point/event success");
  res.status(200).json("Info: API point/event success");
  }
);
  */

module.exports = router;
