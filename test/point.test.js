// @ts-check
const log = console.log;
const test = require("baretest")("point-test");
const assert = require("assert");
const {
  pointsFromEvent,
  pointsFromRecord,
  transferPoints,
  consumePoints,
} = require("../actions/point.actions");
const { collections } = require("../models/mongo");
const { findLast } = require("./init");
const { get_test_agents } = require("./login.test");

/** @type {import('express').Application} */
let app = null;
/** @type {import('./login.test').Agents} */
let agents = null;

test.before(async () => {
  agents = await get_test_agents(app);
});

async function checkActivity(type, subtype, amount, fromId, toId) {
  const activity = await findLast(collections.pointActivity);
  assert.equal(activity.type, type);
  assert.equal(activity.subtype, subtype);
  assert.equal(activity.amount, amount);
  switch (type) {
    case "new":
      assert.equal(activity.fromRecordId, fromId);
      assert.equal(activity.toUserId, toId);
      assert.equal(activity.fromUserId, null);
      assert.equal(activity.toGoodsId, null);
      break;
    case "transfer":
      assert.equal(activity.fromUserId, fromId);
      assert.equal(activity.toUserId, toId);
      assert.equal(activity.fromRecordId, null);
      assert.equal(activity.toGoodsId, null);
      break;
    case "consume":
      assert.equal(activity.fromUserId, fromId);
      assert.equal(activity.toGoodsId, toId);
      assert.equal(activity.fromRecordId, null);
      assert.equal(activity.toUserId, null);
      break;
    default:
      throw `Unknown record type: ${type}`;
  }
}

async function checkUserPoints(userId, before_point, amount) {
  let user = await collections.user.findOne({ _id: userId });
  assert.equal(user.rewardPoints, before_point + amount);
}

test("unit > pointsFromRecord", async function () {
  let amount = 5;
  const userId = "1";

  const fake_record = await collections.record.findOne({
    recordType: "income",
  });
  delete fake_record._id;
  let user = await collections.user.findOne({ _id: userId });
  const before_point = user.rewardPoints;
  await pointsFromRecord("record", amount, fake_record, user);

  // check user
  await checkUserPoints(userId, before_point, amount);

  // check record
  const record = await findLast(collections.record);
  assert.equal(record.rewardPoints, amount);

  // check activity
  await checkActivity("new", "record", amount, record._id, userId);
});

test("unit > pointsFromEvent", async function () {
  let amount = 5;
  const userId = "1";

  let user = await collections.user.findOne({ _id: userId });
  const before_point = user.rewardPoints;
  await pointsFromEvent("perLogin", amount, user);

  // check user
  user = await collections.user.findOne({ _id: userId });
  assert.equal(user.rewardPoints, before_point + amount);

  // check activity
  await checkActivity("new", "perLogin", amount, undefined, userId);
});

test("unit > transferPoints", async function () {
  let amount = 5;
  const fromUserId = "1";
  const toUserId = "2";

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

test("unit > consumePoints", async function () {
  const userId = "1";
  const goodsId = "2";

  let user = await collections.user.findOne({ _id: userId });
  const before_point = user.rewardPoints;

  let goods = await collections.goods.findOne({ _id: goodsId });
  await consumePoints("", user, goods, 1);

  // check user
  await checkUserPoints(userId, before_point, -goods.point);

  // check activity
  await checkActivity("consume", "", goods.point, userId, goodsId);
});

test("e2e > transferPoints", async function () {
  let amount = 5;
  let fromUserId = agents.father.id;
  let toUserId = agents.mother.id;

  let fromUser = await collections.user.findOne({ _id: fromUserId });
  const from_before_point = fromUser.rewardPoints;

  let toUser = await collections.user.findOne({ _id: toUserId });
  const to_before_point = toUser.rewardPoints;

  await agents.father.agent
    .post("/api/point/transfer")
    .send({ email: "mother@gmail.com", amount })
    .expect(200);

  // check user
  await checkUserPoints(fromUserId, from_before_point, -amount);
  await checkUserPoints(toUserId, to_before_point, amount);

  // check activity
  await checkActivity("transfer", "", amount, fromUserId, toUserId);
});

test("e2e > consumePoints", async function () {
  const goodsId = "2";

  let user = await collections.user.findOne({ _id: agents.father.id });
  const before_point = user.rewardPoints;
  let goods = await collections.goods.findOne({ _id: goodsId });
  await agents.father.agent
    .post(`/api/point/consume/${goodsId}`)
    .send({ quantity: 2 })
    .expect(200);

  // check user
  await checkUserPoints(agents.father.id, before_point, -(goods.point * 2));

  // check activity
  await checkActivity("consume", "", goods.point * 2, agents.father.id, goodsId);
  const activity = await findLast(collections.pointActivity);
  assert.equal(activity.quantity, 2);
});

module.exports = {
  /** @param {import('express').Application} express_app*/
  async run(express_app) {
    console.log = () => {};
    app = express_app;
    await test.run();
    console.log = log;
  },
};
