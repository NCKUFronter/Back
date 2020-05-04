// @ts-check
const Joi = require("@hapi/joi");
const { JoiNumberString } = require("./utils");

const InvitationSchema = Joi.object({
  ledgerId: JoiNumberString.required(),
  email: Joi.string().email().required(),
});

const AnswerInvitationSchema = Joi.object({
  answer: Joi.boolean().required(),
});

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
    const model = new InvitationModel(null, null, null);
    return Object.assign(model, obj);
  }
}

module.exports = {
  InvitationSchema,
  InvitationModel,
  AnswerInvitationSchema,
};
