// @ts-check
const { collections } = require("../models/mongo");
const { GoodsSchema } = require("../models/goods.model");
const loginCheck = require("../middleware/login-check");
const checkParamsIdExists = require("../middleware/check-params-id-exists");
const router = require("express").Router();

router.get(
  "/user",
  async function (req, res) {
    const users = await collections.gameUser.find().toArray();
    res.status(200).json(users);
  }
);

router.get(
  "/user/:id",
  checkParamsIdExists(collections.gameUser),
  async function (req, res) {
    const user = req.convert_from_params.id;
    res.status(200).json(user);
  }
);

router.get(
  "/user/:id/bag",
  checkParamsIdExists(collections.gameUser),
  async function (req, res) {
    const user = req.convert_from_params.id;
    const goodIds = [];
    for (const id in user.bag) {
      if (user.bag[id] > 0) goodIds.push(id);
    }

    const goods = await collections.goods
      .find({ _id: { $in: goodIds } })
      .toArray();
    for (const g of goods) {
      g.count = user.bag[g._id];
    }

    res.status(200).json(goods);
  }
);

router.post(
  "/user/:id/use/:goodsId",
  checkParamsIdExists(collections.gameUser),
  async (req, res) => {
    const user = req.convert_from_params.id;
    const goodsId = req.params.goodsId;
    if (user.bag && user.bag[goodsId] != null) {
      if (user.bag[goodsId] == 1)
        await collections.gameUser.updateOne(
          { _id: user._id },
          { $unset: { ["bag." + goodsId]: "" } }
        );
      else
        await collections.gameUser.updateOne(
          { _id: user._id },
          { $inc: { ["bag." + goodsId]: -1 } }
        );
      res.status(200).json("success");
    } else return res.status(400).json("背包內沒有此道具");
  }
);

module.exports = router;
