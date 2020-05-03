// @ts-check
/** @typedef {import('mongodb').ClientSession} ClientSession */
const {
  collections,
  simpleInsertOne,
  workInTransaction,
} = require("../models/mongo");
const { InvitationModel, LedgerModel, UserModel } = require("../models");

/**
 * @param {LedgerModel} ledger
 * @param {UserModel} fromUser
 * @param {UserModel} toUser
 * @return {Promise<boolean>} 是否成功
 */
async function invite(ledger, fromUser, toUser) {
  // 假設參數都是對的，不做任何正確性檢查

  if (!ledger.userIds) ledger.userIds = [];
  ledger.userIds.push(toUser._id);

  const invitation = new InvitationModel(ledger._id, fromUser._id, toUser._id);
  return workInTransaction(async (session) => {
    const ledger_prom = collections.ledger.updateOne(
      { _id: ledger._id },
      { $set: { userIds: ledger.userIds } },
      { session }
    );

    const invit_prom = simpleInsertOne(
      collections.invitation,
      invitation,
      session
    );

    await Promise.all([ledger_prom, invit_prom]);
  });
}

/**
 * @param {InvitationModel} invitation
 * @param {boolean} answer
 * @return {Promise<boolean>} 是否成功
 */
async function answerInvitation(invitation, answer) {
  // 假設參數都是對的，不做任何正確性檢查
  invitation.type = Number(answer);
  try {
    await collections.invitation.updateOne(
      { _id: invitation._id },
      { $set: { type: invitation.type } }
    );
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
}

module.exports = {
  answerInvitation,
  invite,
};
