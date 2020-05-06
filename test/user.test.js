// @ts-check
const test = require("baretest")("user-test");
const assert = require("assert");
const {
  userLedgers,
  userInvitations,
  userPointActivities,
} = require("../actions/user.actions");
const { collections } = require("../models/mongo");
const { InvitationModel, PointActivityModel } = require("../models");

test("user ledgers", async () => {
  const userId = "3";
  const ledgers = await userLedgers(userId);
  assert.equal(ledgers.length, 1);
  assert.equal(ledgers[0]._id, "2");
});

test("user invitations", async () => {
  const userId = "3";
  /** @type {InvitationModel[]} */
  const invitations = await userInvitations(userId);
  for (const invitation of invitations) {
    assert.equal(invitation.type, 2);
    assert.notEqual(invitation.fromUserId, userId);
    assert.equal(invitation.toUserId, userId);
  }
});

test("user pointActivity", async () => {
  const userId = "1";
  /** @type {PointActivityModel[]} */
  const pointActivities = await userPointActivities(userId);

  for (const activity of pointActivities) {
    assert(activity.toUserId == userId || activity.fromUserId == userId);
  }
});

test("e2e-user invitations", async () => {
  assert(false, "not implement")
});

test("e2e-user ledgers", async () => {
  assert(false, "not implement")
});

test("e2e-user pointActivity", async () => {
  assert(false, "not implement")
});

module.exports = test;
