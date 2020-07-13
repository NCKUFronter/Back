"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

// @ts-check
var Joi = require("@hapi/joi");

var _require = require("./utils"),
    JoiRequireWhen = _require.JoiRequireWhen;
/**
 * @typedef CategoryDto
 * @property {string} name.required
 * @property {string[]} hashtags
 * @property {string} color.required - 顏色只接受hex 6碼 - example: #aabbcc
 * @property {string} icon.required
 */


var CategorySchema = Joi.object({
  name: JoiRequireWhen(Joi.string()),
  hashtags: Joi.array().items(Joi.string()),
  color: JoiRequireWhen(Joi.string().regex(/^#[0-9A-Fa-f]{6}$/)),
  icon: JoiRequireWhen(Joi.string())
}).not({});
/**
 * @typedef Category
 * @property {string} _id.required
 * @property {string} name.required
 * @property {string} userId
 * @property {string} color.required - - example: #aabbcc
 * @property {string} icon.required
 */

var CategoryModel = function CategoryModel() {
  (0, _classCallCheck2["default"])(this, CategoryModel);
  (0, _defineProperty2["default"])(this, "_id", void 0);
  (0, _defineProperty2["default"])(this, "name", void 0);
  (0, _defineProperty2["default"])(this, "userId", void 0);
  (0, _defineProperty2["default"])(this, "color", void 0);
  (0, _defineProperty2["default"])(this, "icon", void 0);
};

module.exports = {
  CategorySchema: CategorySchema,
  CategoryModel: CategoryModel
};