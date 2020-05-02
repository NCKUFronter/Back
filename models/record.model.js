// @ts-check
const Joi = require("@hapi/joi");
const { JoiRequireWhen } = require("./utils");

const RecordSchema = Joi.object({
  recordType: JoiRequireWhen(Joi.string().valid("income", "expense")),

  money: JoiRequireWhen(Joi.number().min(0)),

  // 或許放在url內比較好 '/ledger/:ledgerId/record'
  ledgerId: JoiRequireWhen(Joi.number().min(0)),

  categoryId: JoiRequireWhen(Joi.number().min(0)),

  // 應該辨識使用者身份自動填入
  userId: JoiRequireWhen(Joi.number().min(0)),

  date: JoiRequireWhen(Joi.date()),

  hashtags: Joi.array().items(Joi.string()),

  detail: Joi.string().allow(""),
}).not({});

class RecordModel {
  /** @type {number} */
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
