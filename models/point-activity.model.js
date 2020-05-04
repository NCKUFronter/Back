// @ts-check
const Joi = require("@hapi/joi");
const { JoiNumberString } = require("./utils");

const TransferPointsSchema = Joi.object({
  toUserId: Joi.string().email().required(),
});

const ConsumePointsSchema = Joi.object({
  goodsId: JoiNumberString,
});

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
