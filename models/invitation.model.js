// @ts-check
const Joi = require("@hapi/joi");
const { JoiNumberString } = require("./utils");

/**
 * @typedef InviteDto
 * @property {string} ledgerId.required
 * @property {string} email.required
 */
const InvitationSchema = Joi.object({
  ledgerId: JoiNumberString.required(),
  email: Joi.string().email().required(),
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
 * @property {string} fromUserId
 * @property {string} toUserId
 * @property {string} ledgerId
 * @property {number} type - - eg:0,1,2
 * @property {string} createIime - real type: Date
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
  /** @type {Date} */
  createTime = new Date();

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
    /** @type {Date} */
    this.answerTime = new Date();
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
