// @ts-check
/** @typedef {import('mongodb').ClientSession} ClientSession */
const {
  collections,
  simpleInsertOne,
  workInTransaction,
} = require("../models/mongo");
const assert = require("assert");
const { InvitationModel, LedgerModel, UserModel } = require("../models");

/**
 * @param {LedgerModel} ledger
 * @param {UserModel} fromUser
 * @param {UserModel} toUser
 * @return {Promise<boolean>} 是否成功
 */
async function invite(ledger, fromUser, toUser) {
  // 假設參數都是對的，不做任何正確性檢查
  assert(
    ledger.adminId == fromUser._id || ledger.userIds.includes(fromUser._id)
  );
  assert(ledger.adminId != toUser._id || !ledger.userIds.includes(toUser._id));

  const invitation = new InvitationModel(ledger._id, fromUser._id, toUser._id);
  return workInTransaction(async (session) => {
    await simpleInsertOne(collections.invitation, invitation, session);
  });
}

/**
 * @param {InvitationModel} invitation
 * @param {boolean} answer
 * @return {Promise<boolean>} 是否成功
 */
async function answerInvitation(invitation, answer) {
  // 假設參數都是對的，不做任何正確性檢查
  assert.equal(invitation.type, 2);

  if (!(invitation instanceof InvitationModel))
    invitation = InvitationModel.fromObject(invitation);
  invitation.answer(answer);

  return workInTransaction(async (session) => {
    let ledger_prom = null;
    if (invitation.type == 1) {
      ledger_prom = collections.ledger.updateOne(
        { _id: invitation.ledgerId },
        { $addToSet: { userIds: invitation.toUserId } },
        { session }
      );
    }

    const invit_prom = collections.invitation.updateOne(
      { _id: invitation._id },
      { $set: invitation }
    );
    await Promise.all([ledger_prom, invit_prom]);
  });
}

module.exports = {
  answerInvitation,
  invite,
};
