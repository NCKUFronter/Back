// @ts-check
const log = console.log;
const test = require("baretest")("record-test");
const assert = require("assert");
const supertest = require("supertest");
const { RecordModel, UserModel } = process.env.BABEL_TEST
  ? require("../dist/models")
  : require("../models");
const { findLast } = require("./init");
const { collections } = process.env.BABEL_TEST
  ? require("../dist/models/mongo")
  : require("../models/mongo");
const { get_test_agents } = require("./login.test");

/** @type {import('express').Application} */
let app = null;

/** @type {import('./login.test').Agents} */
let agents = null;

const testUrls = {
  insert: "/api/record",
  getAll: "/api/record",
  getOne: (id) => "/api/record/" + id,
  patch: (id) => "/api/record/" + id,
  delete: (id) => "/api/record/" + id,
};
let id = null;

test.before(async () => {
  agents = await get_test_agents(app);
});

test("e2e > insert record > return schema error", async () => {
  /** @type {any} */
  let record_dto = {
    recordType: "xxxx",
    money: 50,
    ledgerId: "1",
    categoryId: "3",
    date: new Date(),
  };
  await agents.father.agent.post(testUrls.insert).send(record_dto).expect(400);

  record_dto.recordType = "income";
  delete record_dto.money;
  await agents.father.agent.post(testUrls.insert).send(record_dto).expect(400);

  record_dto.money = 40;
  record_dto.categoryId = 20;
  await agents.father.agent.post(testUrls.insert).send(record_dto).expect(400);

  record_dto.categoryId = 2;
  record_dto.ledgerId = 10;
  await agents.father.agent.post(testUrls.insert).send(record_dto).expect(400);
});

test("e2e > insert record > return 403", async () => {
  /** @type {any} */
  let record_dto = {
    recordType: "income",
    money: 1050,
    ledgerId: "1",
    categoryId: "3",
    date: new Date(),
    hashtags: ["tag1", "tag2"],
  };

  await agents.child.agent.post(testUrls.insert).send(record_dto).expect(403);
});

test("e2e > insert record > success", async () => {
  /** @type {any} */
  let record_dto = {
    recordType: "income",
    money: 1050,
    ledgerId: "1",
    categoryId: "3",
    date: new Date(),
    hashtags: ["tag1", "tag2"],
  };

  await agents.father.agent
    .post(testUrls.insert)
    .send(record_dto)
    .expect(201)
    .then(async (res) => {
      assert.equal(res.body.rewardPoints, 11);
      /** @type {RecordModel} */
      let record = await findLast(collections.record);

      id = record._id;
      assert.equal(record.recordType, "income");
      assert.equal(record.money, 1050);
      assert.equal(record.userId, 1);
      assert.equal(record.categoryId, 3);
      assert.equal(record.ledgerId, 1);
      assert.equal(record.rewardPoints, 11);
      assert(Date.now() - new Date(record.reviseDate).valueOf() < 100);

      /** @type {UserModel} */
      const user = await collections.user.findOne({ _id: "1" });
      assert(user.categoryTags != null);
      assert(Array.isArray(user.categoryTags["3"]));
      const tags = user.categoryTags["3"];
      assert.equal(new Set(tags).size, tags.length);
      assert(tags.includes("tag1"));
      assert(tags.includes("tag2"));
    });
});

test("e2e > patch record > return 400", async () => {
  const record_dto = { categoryId: 4, hashtags: ["tag3", "tag2"] };

  await agents.father.agent
    .patch(testUrls.patch(id))
    .send(record_dto)
    .expect(400);
});

test("e2e > patch record", async () => {
  const categoryId = "4";
  const record_dto = { categoryId, hashtags: ["tag3", "tag2"], money: 5000 };
  const origin_record = await collections.record.findOne({ _id: id });

  const user = await collections.user.findOne({ _id: "1" });
  const before_point = user.rewardPoints;

  await agents.father.agent
    .patch(testUrls.patch(id))
    .send(record_dto)
    .expect(200)
    .then(async (res) => {
      /** @type {RecordModel} */
      let record = await collections.record.findOne({ _id: id });
      assert(record.hashtags);
      assert.deepEqual(
        record.hashtags.toString(),
        record_dto.hashtags.toString()
      );
      assert.equal(origin_record.ledgerId, record.ledgerId);

      /** @type {UserModel} */
      const user = await collections.user.findOne({ _id: "1" });
      assert(user.categoryTags != null);
      assert(Array.isArray(user.categoryTags[categoryId]));
      const tags = user.categoryTags[categoryId];
      assert.equal(new Set(tags).size, tags.length);
      assert(tags.includes("tag2"));
      assert(tags.includes("tag3"));
      assert.equal(user.rewardPoints, before_point + 39);

      const activity = await collections.pointActivity.findOne({
        fromRecordId: id,
      });
      assert.equal(activity.amount, record.rewardPoints);
      assert.equal(activity.amount, 50);
    });
});

test("e2e > get all records", async () => {
  await agents.father.agent
    .get(testUrls.getAll)
    .expect(200)
    .then((res) => {
      const records = res.body;
      assert(Array.isArray(records));
    });
});

test("e2e > get one record", async () => {
  await agents.father.agent
    .get(testUrls.getOne(id))
    .expect(200)
    .then((res) => {
      const record = res.body;
      assert(!Array.isArray(record));
      assert.equal(record._id, id);
    });
});

test("e2e > delete record", async () => {
  let user = await collections.user.findOne({ _id: "1" });
  const before_point = user.rewardPoints;

  await agents.father.agent.delete(testUrls.delete(id)).expect(200);
  const record = await collections.record.findOne({ _id: id });
  assert(record == null);

  const activity = await collections.pointActivity.findOne({
    fromRecordId: id,
  });
  assert(activity == null);

  user = await collections.user.findOne({ _id: "1" });
  assert.equal(user.rewardPoints, before_point - 50);
});

module.exports = {
  /** @param {import('express').Application} express_app */
  async run(express_app) {
    console.log = () => {};
    app = express_app;
    await test.run();
    console.log = log;
  },
};
