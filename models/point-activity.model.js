// @ts-check
const Joi = require("@hapi/joi");
const { collections } = require("../models/mongo");
const { JoiNumberString, AsyncJoi, existInDB } = require("./utils");

/**
 * @typedef TransferPointsDto
 * @property {string} email.required
 * @property {number} amount.required - amount of points
 */
const TransferPointsSchema = AsyncJoi.object({
  email: AsyncJoi.schema(Joi.string().email().required()).addRule(
    existInDB(() => collections.user, "email")
  ),
  amout: Joi.number().required(),
});

/**
 * @typedef ConsumePointsDto
 * @property {string} email.required
 * @property {number} amount.required - amount of points
 */
const ConsumePointsSchema = AsyncJoi.object({
  goodsId: AsyncJoi.schema(JoiNumberString).addRule(
    existInDB(() => collections.goods, "_id")
  ),
});

/**
 * @typedef PointActivity
 * @property {string} _id.required
 * @property {enum} type.required - - eg:new,transfer,consume
 * @property {string} subtype.required
 * @property {string} time.required - real type: Date
 * @property {string} fromRecordId - for type = 'new'
 * @property {string} toUserId - for type = 'transfer' or 'new'
 * @property {string} fromUserId - for type = 'consume' or 'transfer'
 * @property {string} toGoodsId - for type = 'consume'
 */
class PointActivityModel {
  /** @type {string} */
  _id;

  /** @type {string} */
  type;

  /** @type {string=} */
  subtype;

  /** @type {string} */
  time;

  /**
   * @param {'new' | 'transfer' | 'consume'} type
   * @param {string} subtype
   * @param {number} amount
   * @param {string} fromId
   * @param {string} toId
   * @param {string=} detail
   */
  constructor(type, subtype, amount, fromId, toId, detail) {
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
        throw `Unknown record type: ${type}`;
    }
  }
}

module.exports = {
  PointActivityModel,
  TransferPointsSchema,
  ConsumePointsSchema,
};
