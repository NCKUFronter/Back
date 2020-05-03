// @ts-check
const Joi = require("@hapi/joi");
const { JoiRequireWhen } = require("./utils");

const LedgerSchema = Joi.object({
  userIds: JoiRequireWhen(Joi.array().items(Joi.string().regex(/[0-9]/).allow(null))),
  ledgerName: JoiRequireWhen(Joi.string().regex(/[a-zA-Z0-9]/)),
  admin: JoiRequireWhen(Joi.string().regex(/[0-9]/).allow(null))
}).not({});

class LedgerModel {
  /** @type {string} */
  _id;

  /** @type {string} */
  ledgerName;

  /** @type {string} */
  admin;

  /** @type {string[]} */
  userIds;
}

module.exports = {
  LedgerSchema,
  LedgerModel,
};
