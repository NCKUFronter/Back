// @ts-check
const Joi = require("@hapi/joi");
const { JoiRequireWhen } = require("./utils");

/**
 * @typedef LedgerDto
 * @property {string} ledgerName.required
 */
const LedgerSchema = Joi.object({
  // userIds: JoiRequireWhen(Joi.array().items(Joi.string().regex(/[0-9]/).allow(null))),
  ledgerName: JoiRequireWhen(Joi.string().trim()), // .regex(/^[a-zA-Z0-9 ]+$/)),
  // adminId: JoiRequireWhen(Joi.string().regex(/[0-9]/).allow(null))
}).not({});

/**
 * "swagger model"
 * @typedef Ledger
 * @property {string} _id.required
 * @property {string} ledgerName.required
 * @property {string} adminId.required
 * @property {string[]} userIds.required
 */
class LedgerModel {
  /** @type {string} */
  _id;

  /** @type {string} */
  ledgerName;

  /** @type {string} */
  adminId;

  /** @type {string[]} */
  userIds;
}

module.exports = {
  LedgerSchema,
  LedgerModel,
};
