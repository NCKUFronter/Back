"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

// @ts-check
var Joi = require("@hapi/joi");

var _require = require("../models/mongo"),
    collections = _require.collections;

var _require2 = require("./utils"),
    JoiNumberString = _require2.JoiNumberString,
    AsyncJoi = _require2.AsyncJoi,
    existInDB = _require2.existInDB;
/**
 * @typedef TransferPointsDto
 * @property {string} email.required
 * @property {number} amount.required - amount of points
 */


var TransferPointsSchema = AsyncJoi.object({
  email: AsyncJoi.schema(Joi.string().email().required()).addRule(existInDB(function () {
    return collections.user;
  }, "email")),
  amount: Joi.number().required()
});
/**
 * @typedef ConsumePointsDto
 * @property {string} quantity.required
 */

var ConsumePointsSchema = Joi.object({
  quantity: Joi.number().min(1).required()
});
/**
 * @typedef PointActivity
 * @property {string} _id.required
 * @property {enum} type.required - - eg:new,transfer,consume
 * @property {string} subtype.required
 * @property {string} time.required - real type: Date
 * @property {number} amount.required - amount of points
 * @property {string} fromRecordId - for type = 'new'
 * @property {string} toUserId - for type = 'transfer' or 'new'
 * @property {string} fromUserId - for type = 'consume' or 'transfer'
 * @property {string} toGoodsId - for type = 'consume'
 * @property {number} quantity.required
 */

var PointActivityModel =
/** @type {string} */

/** @type {string} */

/** @type {string=} */

/** @type {string} */

/** @type {number} */

/**
 * @param {'new' | 'transfer' | 'consume'} type
 * @param {string} subtype
 * @param {number} amount
 * @param {string} fromId
 * @param {string} toId
 * @param {string=} detail
 */
function PointActivityModel(type, subtype, amount, fromId, toId, detail) {
  (0, _classCallCheck2["default"])(this, PointActivityModel);
  (0, _defineProperty2["default"])(this, "_id", void 0);
  (0, _defineProperty2["default"])(this, "type", void 0);
  (0, _defineProperty2["default"])(this, "subtype", void 0);
  (0, _defineProperty2["default"])(this, "time", void 0);
  (0, _defineProperty2["default"])(this, "quantity", 1);
  this.type = type;
  this.subtype = subtype;
  this.amount = amount;
  if (detail) this.detail = detail;
  this.time = new Date().toISOString();

  switch (type) {
    case "new":
      /** @type {string} */
      this.fromRecordId = fromId;
      /** @type {string} */

      this.toUserId = toId;
      break;

    case "transfer":
      /** @type {string} */
      this.fromUserId = fromId;
      /** @type {string} */

      this.toUserId = toId;
      break;

    case "consume":
      /** @type {string} */
      this.fromUserId = fromId;
      /** @type {string} */

      this.toGoodsId = toId;
      break;

    default:
      throw "Unknown record type: ".concat(type);
  }
};

module.exports = {
  PointActivityModel: PointActivityModel,
  TransferPointsSchema: TransferPointsSchema,
  ConsumePointsSchema: ConsumePointsSchema
};