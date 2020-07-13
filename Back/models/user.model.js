"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

// @ts-check
var Joi = require("@hapi/joi");

var _require = require("./utils"),
    JoiRequireWhen = _require.JoiRequireWhen;
/**
 * @typedef LoginDto
 * @property {string} email
 * @property {string} password
 */


var UserSchema = Joi.object({
  name: Joi.string().regex(/[a-zA-Z0-9]/).allow(null),
  password: Joi.string().regex(/[a-zA-Z0-9]/).allow(null),
  email: Joi.string().allow(null)
});
/**
 * "swagger model"
 * @typedef User
 * @property {string} _id.required
 * @property {string} name.required
 * @property {string} email.required
 * @property {string} photo
 * @property {string} gameUserId
 * @property {number} conDays
 * @property {string} lastLogin.required - real type: Date
 * @property {string[]} cardIds
 * @property {object} categoryTags.required
 */

var UserModel = function UserModel() {
  (0, _classCallCheck2["default"])(this, UserModel);
  (0, _defineProperty2["default"])(this, "_id", void 0);
  (0, _defineProperty2["default"])(this, "name", void 0);
  (0, _defineProperty2["default"])(this, "password", void 0);
  (0, _defineProperty2["default"])(this, "gameUserId", void 0);
  (0, _defineProperty2["default"])(this, "email", void 0);
  (0, _defineProperty2["default"])(this, "cardIds", void 0);
  (0, _defineProperty2["default"])(this, "rewardPoints", void 0);
  (0, _defineProperty2["default"])(this, "categoryTags", void 0);
  (0, _defineProperty2["default"])(this, "conDays", void 0);
  (0, _defineProperty2["default"])(this, "lastLogin", void 0);
};

module.exports = {
  UserSchema: UserSchema,
  UserModel: UserModel
};