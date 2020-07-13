// @ts-check
const Joi = require("@hapi/joi");
const { collections } = require("../models/mongo");
const { JoiNumberString, existInDB, AsyncJoi } = require("./utils");

/**
 * @typedef InviteDto
 * @property {string} ledgerId.required
 * @property {string} email.required
 */
const InvitationSchema = AsyncJoi.object({
  ledgerId: AsyncJoi.schema(JoiNumberString.required()).addRule(
    existInDB(() => collections.ledger, "_id")
  ),
  email: AsyncJoi.schema(Joi.string().email().required()).addRule(
    existInDB(() => collections.user, "email")
  ),
});

/**
 * @typedef AnswerDto
 * @property {boolean} answer.required
 */
const AnswerInvitationSchema = Joi.object({
  answer: Joi.boolean().required(),
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
class InvitationModel {
  /** @type {string} */
  _id;
  /** @type {string} */
  fromUserId;
  /** @type {string} */
  toUserId;
  /** @type {string} */
  ledgerId;
  /** @type {number} */
  type = 2;
  /** @type {string} */
  createTime = new Date().toISOString();

  /**
   * @param {string} ledgerId
   * @param {string} fromUserId
   * @param {string} toUserId
   */
  constructor(ledgerId, fromUserId, toUserId) {
    this.ledgerId = ledgerId;
    this.fromUserId = fromUserId;
    this.toUserId = toUserId;
  }

  /**
   * @param {boolean} answer
   */
  answer(answer) {
    this.type = Number(answer);
    /** @type {string} */
    this.answerTime = new Date().toISOString();
  }

  static fromObject(obj) {
    const model = Object.create(InvitationModel.prototype);
    return Object.assign(model, obj);
  }
}

module.exports = {
  InvitationSchema,
  InvitationModel,
  AnswerInvitationSchema,
};
