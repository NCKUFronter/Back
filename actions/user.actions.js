// @ts-check
const { collections } = require("../models/mongo");
const { UserModel, RecordModel } = require("../models");

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
  return collections.pointActivity
    .find({
      $or: [{ fromUserId: userId }, { toUserId: userId }],
    })
    .toArray();
}

/**
 * 假設record內一定有hashtags
 * @param {RecordModel} record
 * @param {UserModel} user
 * @return categoryTags
 */
function getCategoryTags(record, user) {
  const categoryTags = user.categoryTags ? user.categoryTags : {};
  if (!categoryTags[record.categoryId]) categoryTags[record.categoryId] = [];
  let now_tags = new Set([
    ...record.hashtags,
    ...categoryTags[record.categoryId],
  ]);
  categoryTags[record.categoryId] = Array.from(now_tags);
  return categoryTags;
}

/** @param {string} userId */
async function userRelativeUserIds(userId) {
  const results = await collections.ledger
    .aggregate([
      { $match: { $or: [{ userIds: userId }, { adminId: userId }] } },
      { $group: { _id: 0, user: { $push: "$userIds" } } },
      {
        $project: {
          userIds: {
            $reduce: {
              input: "$user",
              initialValue: [],
              in: { $setUnion: ["$$value", "$$this"] },
            },
          },
        },
      },
    ])
    .toArray();
  if (results.length == 0) return [];

  const userIds = results[0].userIds;
  for (let i = 0; i < userIds.length; i++) {
    if (userIds[i] === userId) {
      userIds.splice(i, 1);
      break;
    }
  }
  return userIds;
}

function serializeUser(user) {
  if (!user) return user;
  const { _id, name, email, photo } = user;
  return { _id, name, email, photo };
}

module.exports = {
  userInvitations,
  userLedgers,
  userPointActivities,
  getCategoryTags,
  userRelativeUserIds,
  serializeUser,
};
