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
}

module.exports = {
  InvitationSchema,
  InvitationModel,
  AnswerInvitationSchema,
};
