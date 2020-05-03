// @ts-check
/** @typedef {import('mongodb').ClientSession} ClientSession */
const {
  client,
  collections,
  simpleInsertOne,
  workInTransaction,
} = require("../models/mongo");
const { UserModel, RecordModel, PointActivityModel } = require("../models");

async function pointsFromEvent(subtype, amount, user) {
  return innerGivenPoints(subtype, amount, null, user);
}

/**
 * 給予點數並將User, Record保存到資料庫
 * @param { string } subtype
 * @param {number} amount
 * @param { RecordModel } record 尚未保存的record
 * @param { UserModel } user
 * @return { Promise<boolean> } 是否成功
 */
async function pointsFromRecord(subtype, amount, record, user) {
  record.rewardPoints = amount;
  return innerGivenPoints(subtype, amount, record, user);
}

/**
 * @param { string } subtype
 * @param { number } amount
 * @param { RecordModel= } record 要直接保存的Record
 * @param { UserModel } user
 * @return { Promise<boolean> } 是否成功
 */
async function innerGivenPoints(subtype, amount, record, user) {
  return workInTransaction(async (/** @type {ClientSession} */ session) => {
    let recordId = null;
    if (record) {
      // insert record
      recordId = (await simpleInsertOne(collections.record, record, session))
        .insertedId;
    }

    const activity = new PointActivityModel(
      "new",
      subtype,
      amount,
      recordId,
      user._id
    );

    const activity_prom = simpleInsertOne(
      collections.pointActivity,
      activity,
      session
    );

    // update user
    const user_prom = collections.user.updateOne(
      { _id: user._id },
      { $inc: { rewardPoints: amount } },
      { session }
    );
    await Promise.all([user_prom, activity_prom]);
  });
}

// 不檢查是否不能轉移
/**
 * @param { string } subtype
 * @param { number } amount
 * @param { UserModel } fromUser
 * @param { UserModel } toUser
 * @return { Promise<boolean> } 是否成功
 */
async function transferPoints(subtype, amount, fromUser, toUser) {
  return workInTransaction(async (session) => {
    // update user
    const from_user_prom = collections.user.updateOne(
      { _id: fromUser._id },
      { $inc: { rewardPoints: -amount } },
      { session }
    );

    const to_user_prom = collections.user.updateOne(
      { _id: toUser._id },
      { $inc: { rewardPoints: amount } },
      { session }
    );

    const activity = new PointActivityModel(
      "transfer",
      subtype,
      amount,
      fromUser._id,
      toUser._id
    );

    const activity_prom = simpleInsertOne(
      collections.pointActivity,
      activity,
      session
    );
    await Promise.all([from_user_prom, to_user_prom, activity_prom]);
  });
}

// 不檢查是否無法兌換
/**
 * @param { string } subtype
 * @param { UserModel } user
 * @param { object } goods
 * @return { Promise<boolean> } 是否成功
 */
async function consumePoints(subtype, user, goods) {
  return workInTransaction(async (session) => {
    // update user
    const user_prom = collections.user.updateOne(
      { _id: user._id },
      { $inc: { rewardPoints: -goods.point } },
      { session }
    );

    const activity = new PointActivityModel(
      "consume",
      subtype,
      goods.point,
      user._id,
      goods._id
    );

    const activity_prom = simpleInsertOne(
      collections.pointActivity,
      activity,
      session
    );
    await Promise.all([user_prom, activity_prom]);
  });
}

module.exports = {
  pointsFromEvent,
  pointsFromRecord,
  transferPoints,
  consumePoints,
};
