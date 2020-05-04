// @ts-check
const Joi = require("@hapi/joi");
const { JoiRequireWhen } = require("./utils");

const UserSchema = Joi.object({
  name: Joi.string().regex(/[a-zA-Z0-9]/).allow(null),

  password: Joi.string().regex(/[a-zA-Z0-9]/).allow(null),

  email: Joi.string().allow(null),
});

class UserModel {
  /** @type {string} */
  _id;

  /** @type {string} */
  name;

  /** @type {string} */
  password;

  /** @type {string} */
  email;

  /** @type {string[]} */
  cardIds;

  /** @type {number} */
  rewardPoints;

  /** @type {number} */
  point;

  /** @type { {[key: number]: [string, string[]]} } */
  categoryTags;
}

module.exports = {
  UserSchema,
  UserModel,
};
