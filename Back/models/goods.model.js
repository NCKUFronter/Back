"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

// @ts-check
var Joi = require("@hapi/joi");

var _require = require("./utils"),
    JoiRequireWhen = _require.JoiRequireWhen;

var GoodsSchema = Joi.object({
  name: JoiRequireWhen(Joi.string().regex(/[a-zA-Z]/)),
  point: JoiRequireWhen(Joi.number().min(0))
}).not({});
/**
 * "swagger model"
 * @typedef Goods
 * @property {string} _id.required
 * @property {string} name.required
 * @property {number} point.required
 * @property {string} intro.required
 */

var GoodsModel = function GoodsModel() {
  (0, _classCallCheck2["default"])(this, GoodsModel);
  (0, _defineProperty2["default"])(this, "_id", void 0);
  (0, _defineProperty2["default"])(this, "name", void 0);
  (0, _defineProperty2["default"])(this, "point", void 0);
  (0, _defineProperty2["default"])(this, "intro", void 0);
};

module.exports = {
  GoodsSchema: GoodsSchema,
  GoodsModel: GoodsModel
};