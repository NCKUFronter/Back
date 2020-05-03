// @ts-check
const Joi = require("@hapi/joi");
const { JoiNumberString } = require("./utils");

const TransferPointsSchema = Joi.object({
  ledgerId: JoiNumberString.required(),
  email: Joi.string().email().required(),
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
   * @param {number} fromId
   * @param {number} toId
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
        /** @type {number} */
        this.fromRecordId = fromId;
        /** @type {number} */
        this.toUserId = toId;
        break;
      case "transfer":
        /** @type {number} */
        this.fromUserId = fromId;
        /** @type {number} */
        this.toUserId = toId;
        break;
      case "consume":
        /** @type {number} */
        this.fromUserId = fromId;
        /** @type {number} */
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
};
