// @ts-check
/** @typedef {import('mongodb').ClientSession} ClientSession */
const {
  client,
  collections,
  simpleInsertOne,
  workInTransaction,
} = require("../models/mongo");
const assert = require("assert");
const { UserModel, RecordModel, PointActivityModel } = require("../models");

/**
 * @param {RecordModel} old_record
 * @param {any} update_dto
 */
async function updateRecord(old_record, update_dto) {
  return workInTransaction(async (session) => {
    const userUpdate = {};

    // 1. update rewardPoints
    let activity_prom = null;
    if (update_dto.money) {
      const new_point = Math.round(update_dto.money / 100);
      update_dto.rewardPoints = new_point;
      if (new_point !== old_record.rewardPoints) {
        // 1.1 count user new point
        userUpdate.$inc = { rewardPoints: new_point - old_record.rewardPoints };

        // 1.2 update activity
        activity_prom = collections.pointActivity.updateOne(
          { fromRecordId: old_record._id },
          { $set: { amount: new_point } },
          { session }
        );
      }
    }

    // 2. update user categoryTags
    if (update_dto.categoryId || update_dto.hashtags) {
      const new_record = Object.assign(old_record, update_dto);
      userUpdate.$addToSet = {
        [`categoryTags.${new_record.categoryId}`]: {
          $each: new_record.hashtags,
        },
      };
    }

    // 3. update user
    let user_prom = null;
    if (userUpdate.$inc || userUpdate.$addToSet) {
      user_prom = collections.user.updateOne(
        { _id: old_record.userId },
        userUpdate,
        { session }
      );
    }

    // 4. update record
    const record_prom = collections.record.updateOne(
      { _id: old_record._id },
      { $set: update_dto },
      { session }
    );

    await Promise.all([activity_prom, record_prom, user_prom]);
  });
}

/**
 * @param {RecordModel} record
 * @param {string} userId
 */
async function removeRecord(record, userId) {
  return workInTransaction(async (session) => {
    // 1. delete pointActivity
    const activity_prom = collections.pointActivity.deleteOne(
      { fromRecordId: record._id },
      { session }
    );

    // 2. delete record
    const record_prom = collections.record.deleteOne(
      { _id: record._id },
      { session }
    );

    // 3. decrease user rewardPoints
    const user_prom = collections.user.updateOne(
      { _id: userId },
      { $inc: { rewardPoints: -record.rewardPoints } },
      { session }
    );

    await Promise.all([activity_prom, record_prom, user_prom]);
  });
}

module.exports = {
  removeRecord,
  updateRecord,
};
