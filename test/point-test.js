// @ts-check
const test = require("baretest")("point-test");
const assert = require("assert");
const {
  pointsFromEvent,
  pointsFromRecord,
  transferPoints,
  consumePoints,
} = require("../actions/point.actions");
const { collections } = require("../models/mongo");

const findLast = async (coll) =>
  (await coll.find({}).limit(1).sort({ $natural: -1 }).toArray())[0];

async function checkActivity(type, subtype, amount, fromId, toId) {
  const activity = await findLast(collections.pointActivity);
  assert.equal(activity.type, type);
  assert.equal(activity.subtype, subtype);
  assert.equal(activity.amount, amount);
  assert.equal(activity.fromId, fromId);
  assert.equal(activity.toId, toId);
}

async function checkUserPoints(userId, before_point, amount) {
  let user = await collections.user.findOne({ _id: userId });
  assert.equal(user.rewardPoints, before_point + amount);
}

test("pointsFromRecord", async function () {
  let amount = 5;
  const userId = 1;

  const fake_record = await collections.record.findOne({
    recordType: "income",
  });
  delete fake_record._id;
  let user = await collections.user.findOne({ _id: userId });
  const before_point = user.rewardPoints;
  await pointsFromRecord("every_record", amount, fake_record, user);

  // check user
  await checkUserPoints(userId, before_point, amount);

  // check record
  const record = await findLast(collections.record);
  assert.equal(record.rewardPoints, amount);

  // check activity
  await checkActivity("new", "every_record", amount, record._id, userId);
});

test("pointsFromEvent", async function () {
  let amount = 5;
  const userId = 1;

  let user = await collections.user.findOne({ _id: userId });
  const before_point = user.rewardPoints;
  await pointsFromEvent("everyday", amount, user);

  // check user
  user = await collections.user.findOne({ _id: userId });
  assert.equal(user.rewardPoints, before_point + amount);

  // check activity
  await checkActivity("new", "everyday", amount, undefined, userId);
});

test("transferPoints", async function () {
  let amount = 5;
  const fromUserId = 1;
  const toUserId = 2;

  let fromUser = await collections.user.findOne({ _id: fromUserId });
  const from_before_point = fromUser.rewardPoints;

  let toUser = await collections.user.findOne({ _id: toUserId });
  const to_before_point = toUser.rewardPoints;

  await transferPoints("", amount, fromUser, toUser);

  // check user
  await checkUserPoints(fromUserId, from_before_point, -amount);
  await checkUserPoints(toUserId, to_before_point, amount);

  // check activity
  await checkActivity("transfer", "", amount, fromUserId, toUserId);
});

test("consumePoints", async function () {
  const userId = 1;
  const goodsId = 2;

  let user = await collections.user.findOne({ _id: userId });
  const before_point = user.rewardPoints;

  let goods = await collections.goods.findOne({ _id: goodsId });
  await consumePoints("", user, goods);

  // check user
  await checkUserPoints(userId, before_point, -goods.point);

  // check activity
  await checkActivity("transfer", "", goods.point, userId, goodsId);
});
module.exports = test;
