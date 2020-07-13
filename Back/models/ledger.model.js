"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

// @ts-check
var Joi = require("@hapi/joi");

var _require = require("./utils"),
    JoiRequireWhen = _require.JoiRequireWhen;
/**
 * @typedef LedgerDto
 * @property {string} ledgerName.required
 * @property {string} photo.required
 * @property {file} upPhoto
 */


var LedgerSchema = Joi.object({
  // userIds: JoiRequireWhen(Joi.array().items(Joi.string().regex(/[0-9]/).allow(null))),
  ledgerName: JoiRequireWhen(Joi.string().trim()),
  // .regex(/^[a-zA-Z0-9 ]+$/)),
  photo: Joi.string() // adminId: JoiRequireWhen(Joi.string().regex(/[0-9]/).allow(null))

});
/**
 * "swagger model"
 * @typedef Ledger
 * @property {string} _id.required
 * @property {string} ledgerName.required
 * @property {string} adminId.required
 * @property {string[]} userIds.required
 * @property {string} photo.required
 */

var LedgerModel = function LedgerModel() {
  (0, _classCallCheck2["default"])(this, LedgerModel);
  (0, _defineProperty2["default"])(this, "_id", void 0);
  (0, _defineProperty2["default"])(this, "ledgerName", void 0);
  (0, _defineProperty2["default"])(this, "adminId", void 0);
  (0, _defineProperty2["default"])(this, "userIds", void 0);
};

module.exports = {
  LedgerSchema: LedgerSchema,
  LedgerModel: LedgerModel
};