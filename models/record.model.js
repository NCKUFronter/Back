// @ts-check
const Joi = require("@hapi/joi");
const { collections } = require("../models/mongo");
const {
  JoiRequireWhen,
  JoiNumberString,
  existInDB,
  AsyncJoi,
} = require("./utils");

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
const RecordSchema = AsyncJoi.object(
  {
    recordType: JoiRequireWhen(Joi.string().valid("income", "expense")),

    money: JoiRequireWhen(Joi.number().min(0)),

    // 或許放在url內比較好 '/ledger/:ledgerId/record'
    ledgerId: AsyncJoi.schema(JoiRequireWhen(JoiNumberString)).addRule(
      existInDB(() => collections.ledger, "_id")
    ),

    categoryId: AsyncJoi.schema(JoiRequireWhen(JoiNumberString)).addRule(
      existInDB(() => collections.category, "_id")
    ),

    date: JoiRequireWhen(Joi.date()),

    hashtags: Joi.array().items(Joi.string()),

    detail: Joi.string().allow(""),

    from: Joi.string().allow(null),
  },
  Joi.not({})
);

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

  /** @type {string | Date} */
  date;

  /** @type {string[]} */
  hashtags;

  /** @type {string} */
  detail;

  /** @type {number} */
  rewardPoints;

  /** @type {string | Date} */
  reviseDate;

  /** @type {string | null} */
  from;
}

module.exports = {
  RecordSchema,
  RecordModel,
};
