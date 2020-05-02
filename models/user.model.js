// @ts-check
const Joi = require("@hapi/joi");
const { JoiRequireWhen } = require("./utils");

const UserSchema = Joi.object({
  name: JoiRequireWhen(Joi.string()),

  password: JoiRequireWhen(Joi.string()),

  email: JoiRequireWhen(Joi.string()),
});

class UserModel {
  /** @type {number} */
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

  /** @type { {[key: number]: string[]} } */
  hashtags;
}

module.exports = {
  UserSchema,
  UserModel,
};
