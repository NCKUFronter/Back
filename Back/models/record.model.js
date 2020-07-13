"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

// @ts-check
var Joi = require("@hapi/joi");

var _require = require("../models/mongo"),
    collections = _require.collections;

var _require2 = require("./utils"),
    JoiRequireWhen = _require2.JoiRequireWhen,
    JoiNumberString = _require2.JoiNumberString,
    existInDB = _require2.existInDB,
    AsyncJoi = _require2.AsyncJoi;
/**
 * @typedef RecordDto
 * @property {enum} recordType - - eg:income,expense
 * @property {string} recordType.required
 * @property {number} money.required
 * @property {string} ledgerId.required - - eg:1
 * @property {string} categoryId.required - - eg:1
 * @property {string} date.required - - eg:2020-05-06T15:21:32.202Z
 * @property {string} detail
 * @property {string[]} hashtags
 */


var RecordSchema = AsyncJoi.object({
  recordType: JoiRequireWhen(Joi.string().valid("income", "expense")),
  money: JoiRequireWhen(Joi.number().min(0)),
  // 或許放在url內比較好 '/ledger/:ledgerId/record'
  ledgerId: AsyncJoi.schema(JoiRequireWhen(JoiNumberString)).addRule(existInDB(function () {
    return collections.ledger;
  }, "_id")),
  categoryId: AsyncJoi.schema(JoiRequireWhen(JoiNumberString)).addRule(existInDB(function () {
    return collections.category;
  }, "_id")),
  date: JoiRequireWhen(Joi.date()),
  hashtags: Joi.array().items(Joi.string()),
  detail: Joi.string().allow(""),
  from: Joi.string().allow(null)
}, Joi.not({}));
/**
 * "swagger model"
 * @typedef Record
 * @property {string} _id.required
 * @property {string} recordType.required
 * @property {string} money.required
 * @property {string} ledgerId.required
 * @property {string} categoryId.required
 * @property {string} userId.required
 * @property {string[]} hashtags
 * @property {string} detail
 * @property {number} rewardPoints.required
 * @property {string} from
 * @property {string} date.required - real type: Date
 * @property {string} reviseDate.required - real type: Date
 * @property {string} createDate.required - real type: Date
 */

var RecordModel = function RecordModel() {
  (0, _classCallCheck2["default"])(this, RecordModel);
  (0, _defineProperty2["default"])(this, "_id", void 0);
  (0, _defineProperty2["default"])(this, "recordType", void 0);
  (0, _defineProperty2["default"])(this, "money", void 0);
  (0, _defineProperty2["default"])(this, "ledgerId", void 0);
  (0, _defineProperty2["default"])(this, "categoryId", void 0);
  (0, _defineProperty2["default"])(this, "userId", void 0);
  (0, _defineProperty2["default"])(this, "date", void 0);
  (0, _defineProperty2["default"])(this, "hashtags", void 0);
  (0, _defineProperty2["default"])(this, "detail", void 0);
  (0, _defineProperty2["default"])(this, "rewardPoints", void 0);
  (0, _defineProperty2["default"])(this, "reviseDate", void 0);
  (0, _defineProperty2["default"])(this, "from", void 0);
};

module.exports = {
  RecordSchema: RecordSchema,
  RecordModel: RecordModel
};