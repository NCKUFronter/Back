// @ts-check
const test = require("baretest")("invitation-test");
const assert = require("assert");
const { invite, answerInvitation } = require("../actions/invitation.actions");
const { collections } = require("../models/mongo");
const { InvitationModel } = require("../models");
const { findLast } = require("./init");

async function doInviteTest(ledgerId, fromUserId, toUserId) {
  const ledger = await collections.ledger.findOne({ _id: ledgerId });
  const fromUser = await collections.user.findOne({ _id: fromUserId });
  const toUser = await collections.user.findOne({ _id: toUserId });

  await invite(ledger, fromUser, toUser);

  /** @type {InvitationModel} */
  const invitation = await findLast(collections.invitation);
  assert.equal(invitation.ledgerId, ledger._id);
  assert.equal(invitation.fromUserId, fromUser._id);
  assert.equal(invitation.toUserId, toUser._id);
  assert.equal(invitation.type, 2);
}

test("invite", async () => {
  const ledgerId = "1";
  const fromUserId = "2";
  const toUserId = "3";
  await doInviteTest(ledgerId, fromUserId, toUserId);
});

test("accept invitation", async () => {
  await doInviteTest("2", "2", "3");

  /** @type {InvitationModel} */
  let invitation = await findLast(collections.invitation);
  await answerInvitation(invitation, true);

  invitation = await findLast(collections.invitation);
  assert.equal(invitation.type, 1);

  const ledger = await collections.ledger.findOne({ _id: invitation.ledgerId });
  assert.equal(new Set(ledger.userIds).size, ledger.userIds.length);
  assert.equal(ledger.userIds.includes("3"), true)
});

test("reject invitation", async () => {
  await doInviteTest("1", "1", "3");

  /** @type {InvitationModel} */
  let invitation = await findLast(collections.invitation);
  await answerInvitation(invitation, false);

  invitation = await findLast(collections.invitation);
  assert.equal(invitation.type, 0);
  assert.notEqual(invitation.answerTime, null);

  const ledger = await collections.ledger.findOne({ _id: invitation.ledgerId });
  assert.equal(new Set(ledger.userIds).size, ledger.userIds.length);
  assert.equal(ledger.userIds.includes("3"), false)
});

module.exports = test;
