// @ts-check
const Joi = require("@hapi/joi");
const { JoiRequireWhen } = require("./utils");

const LedgerSchema = Joi.object({
  name: JoiRequireWhen(Joi.string()),
});

class LedgerModel {
  /** @type {number} */
  _id;

  /** @type {string} */
  name;

  /** @type {string} */
  admin;

  /** @type {string[]} */
  userIds;
}

module.exports = {
  LedgerSchema,
  LedgerModel,
};
