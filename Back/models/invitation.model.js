"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

// @ts-check
var Joi = require("@hapi/joi");

var _require = require("../models/mongo"),
    collections = _require.collections;

var _require2 = require("./utils"),
    JoiNumberString = _require2.JoiNumberString,
    existInDB = _require2.existInDB,
    AsyncJoi = _require2.AsyncJoi;
/**
 * @typedef InviteDto
 * @property {string} ledgerId.required
 * @property {string} email.required
 */


var InvitationSchema = AsyncJoi.object({
  ledgerId: AsyncJoi.schema(JoiNumberString.required()).addRule(existInDB(function () {
    return collections.ledger;
  }, "_id")),
  email: AsyncJoi.schema(Joi.string().email().required()).addRule(existInDB(function () {
    return collections.user;
  }, "email"))
});
/**
 * @typedef AnswerDto
 * @property {boolean} answer.required
 */

var AnswerInvitationSchema = Joi.object({
  answer: Joi["boolean"]().required()
});
/**
 * "swagger model"
 * @typedef Invitation
 * @property {string} _id.required
 * @property {string} fromUserId.required
 * @property {string} toUserId.required
 * @property {string} ledgerId.required
 * @property {number} type.required - - eg:0,1,2
 * @property {string} createIime.required - real type: Date
 */

var InvitationModel = /*#__PURE__*/function () {
  /** @type {string} */

  /** @type {string} */

  /** @type {string} */

  /** @type {string} */

  /** @type {number} */

  /** @type {string} */

  /**
   * @param {string} ledgerId
   * @param {string} fromUserId
   * @param {string} toUserId
   */
  function InvitationModel(ledgerId, fromUserId, toUserId) {
    (0, _classCallCheck2["default"])(this, InvitationModel);
    (0, _defineProperty2["default"])(this, "_id", void 0);
    (0, _defineProperty2["default"])(this, "fromUserId", void 0);
    (0, _defineProperty2["default"])(this, "toUserId", void 0);
    (0, _defineProperty2["default"])(this, "ledgerId", void 0);
    (0, _defineProperty2["default"])(this, "type", 2);
    (0, _defineProperty2["default"])(this, "createTime", new Date().toISOString());
    this.ledgerId = ledgerId;
    this.fromUserId = fromUserId;
    this.toUserId = toUserId;
  }
  /**
   * @param {boolean} answer
   */


  (0, _createClass2["default"])(InvitationModel, [{
    key: "answer",
    value: function answer(_answer) {
      this.type = Number(_answer);
      /** @type {string} */

      this.answerTime = new Date().toISOString();
    }
  }], [{
    key: "fromObject",
    value: function fromObject(obj) {
      var model = Object.create(InvitationModel.prototype);
      return Object.assign(model, obj);
    }
  }]);
  return InvitationModel;
}();

module.exports = {
  InvitationSchema: InvitationSchema,
  InvitationModel: InvitationModel,
  AnswerInvitationSchema: AnswerInvitationSchema
};