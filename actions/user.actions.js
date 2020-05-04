// @ts-check
const { collections } = require("../models/mongo");

/** @param {string} userId */
function userInvitations(userId) {
  return collections.invitation.find({ toUserId: userId, type: 2 }).toArray();
}

/** @param {string} userId */
function userLedgers(userId) {
  return collections.ledger.find({ userIds: userId }).toArray();
}

/** @param {string} userId */
function userPointActivities(userId) {
  return collections.pointActivity.find({
    $or: [{ fromUserId: userId }, { toUserId: userId }],
  }).toArray();
}

module.exports = {
  userInvitations,
  userLedgers,
  userPointActivities,
};
