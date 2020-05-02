// @ts-check
const Joi = require("@hapi/joi");
const { JoiRequireWhen } = require("./utils");

const LedgerSchema = Joi.object({
  name: JoiRequireWhen(Joi.string())
});

class LedgerModel {
  /** @type {number} */
  _id;

  /** @type {string} */
  name;

  /** @type {string} */
  admin;

  /** @type {string[]} */
  user;
}

module.exports = {
  LedgerSchema,
  LedgerModel,
};
