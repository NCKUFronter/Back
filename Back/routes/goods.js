"use strict";

// @ts-check
var _require = require("../models/mongo"),
    collections = _require.collections;

var _require2 = require("../models/goods.model"),
    GoodsSchema = _require2.GoodsSchema;

var loginCheck = require("../middleware/login-check");

var router = require("express-promise-router")["default"]();

var goods_coll = collections.goods; // GET from database

router.get("/", function (req, res, next) {
  goods_coll.find().toArray(function (err, result) {
    if (err) next(err);else res.status(200).json(result);
  });
}); // GET certain data from database

router.get("/:id", function (req, res, next) {
  goods_coll.findOne({
    _id: req.params.id
  }, function (err, result) {
    if (err) next(err);else res.status(200).json(result);
  });
});
module.exports = router;