// @ts-check
const { collections } = require("../models/mongo");
const { GoodsSchema } = require("../models/goods.model");
const loginCheck = require("../middleware/login-check");
const router = require("express").Router();

const goods_coll = collections.goods;

// GET from database
router.get("/", async function (req, res) {
  goods_coll.find().toArray((err, result) => {
    if (err) throw err;
    res.status(200).json(result);
  });
});

// GET certain data from database
router.get("/:id", async function (req, res) {
  goods_coll.findOne({ _id: req.params.id }, (err, result) => {
    if (err) throw err;
    res.status(200).json(result);
  });
});

module.exports = router;
