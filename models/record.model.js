// @ts-check
const Joi = require("@hapi/joi");
const { collections } = require("../models/mongo");
const { JoiRequireWhen, existInDB, AsyncJoi } = require("./utils");

const RecordSchema = Joi.object({
  recordType: JoiRequireWhen(Joi.string().valid("income", "expense")),

  money: JoiRequireWhen(Joi.number().min(0)),

  // 或許放在url內比較好 '/ledger/:ledgerId/record'
  ledgerId: JoiRequireWhen(Joi.string().regex(/[0-9]/).min(0)),

  categoryId: JoiRequireWhen(Joi.string().regex(/[0-9]/).min(0)),

  date: JoiRequireWhen(Joi.date()),

  hashtags: Joi.array().items(Joi.string()),

  detail: Joi.string().allow(""),

  from: Joi.string().allow(null),
}).not({});

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
 */
class RecordModel {
  /** @type {string} */
  _id;

  /** @type {string} */
  recordType;

  /** @type {number} */
  money;

  /** @type {number} */
  ledgerId;

  /** @type {number} */
  categoryId;

  /** @type {number} */
  userId;

  /** @type {string} */
  date;

  /** @type {string[]} */
  hashtags;

  /** @type {string} */
  detail;

  /** @type {number} */
  rewardPoints;

  /** @type {number} */
  reviseDate;

  /** @type {string | null} */
  from;
}

module.exports = {
  RecordSchema,
  RecordModel,
};
