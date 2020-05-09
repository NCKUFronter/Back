// @ts-check
const Joi = require("@hapi/joi");
const { JoiRequireWhen } = require("./utils");

/**
 * @typedef LoginDto
 * @property {string} email
 * @property {string} password
 */

const UserSchema = Joi.object({
  name: Joi.string().regex(/[a-zA-Z0-9]/).allow(null),

  password: Joi.string().regex(/[a-zA-Z0-9]/).allow(null),

  email: Joi.string().allow(null),
});

/**
 * "swagger model"
 * @typedef User
 * @property {string} _id.required
 * @property {string} name.required
 * @property {string} email.required
 * @property {string} photo
 * @property {number} conDays
 * @property {string} lastLogin.required - real type: Date
 * @property {string[]} cardIds
 * @property {object} categoryTags.required
 */
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

  /** @type { {[key: string]: string | string[]} } */
  categoryTags;

  /** @type {number} */
  conDays;

  /** @type {Date} */
  lastLogin;
}

module.exports = {
  UserSchema,
  UserModel,
};
