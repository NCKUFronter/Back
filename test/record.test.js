// @ts-check
const log = console.log;
const test = require("baretest")("record-test");
const assert = require("assert");
const supertest = require("supertest");
const { RecordModel, UserModel } = require("../models");
const { findLast } = require("./init");
const { collections } = require("../models/mongo");
const { simpleLogin } = require("./login.test");

/** @type {import('express').Application} */
let app = null;
/** @type {import('supertest').SuperTest} */
let agent = null;

const testUrls = {
  insert: "/api/record",
  getAll: "/api/record",
  getOne: (id) => "/api/record/" + id,
  patch: (id) => "/api/record/" + id,
  delete: (id) => "/api/record/" + id,
};
let id = null;

test.before(async () => simpleLogin(agent));

test("e2e > insert record > return schema error", async () => {
  /** @type {any} */
  let record_dto = {
    recordType: "xxxx",
    money: 50,
    ledgerId: "1",
    categoryId: "3",
    date: new Date(),
  };
  await agent.post(testUrls.insert).send(record_dto).expect(400);

  record_dto.recordType = "income";
  delete record_dto.money;
  await agent.post(testUrls.insert).send(record_dto).expect(400);

  record_dto.money = 40;
  record_dto.categoryId = 20;
  await agent.post(testUrls.insert).send(record_dto).expect(400);

  record_dto.categoryId = 2;
  record_dto.ledgerId = 10;
  await agent.post(testUrls.insert).send(record_dto).expect(400);
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

  const child_agent = supertest.agent(app);
  await simpleLogin(child_agent, "child@gmail.com");

  await child_agent.post(testUrls.insert).send(record_dto).expect(403);
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

  await agent
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

  await agent
    .patch(testUrls.patch(id))
    .send(record_dto)
    .expect(400)
})

test("e2e > patch record", async () => {
  const categoryId = "4"
  const record_dto = { categoryId, hashtags: ["tag3", "tag2"] };

  await agent
    .patch(testUrls.patch(id))
    .send(record_dto)
    .expect(200)
    .then(async (res) => {
      /** @type {RecordModel} */
      let record = await collections.record.findOne({ _id: id });
      assert(record.hashtags);
      assert.deepEqual(
        record_dto.hashtags.toString(),
        record.hashtags.toString()
      );

      /** @type {UserModel} */
      const user = await collections.user.findOne({ _id: "1" });
      assert(user.categoryTags != null);
      assert(Array.isArray(user.categoryTags[categoryId]));
      const tags = user.categoryTags[categoryId];
      assert.equal(new Set(tags).size, tags.length);
      assert(tags.includes("tag2"));
      assert(tags.includes("tag3"));
    });
});

test("e2e > get all records", async () => {
  await agent
    .get(testUrls.getAll)
    .expect(200)
    .then((res) => {
      const records = res.body;
      assert(Array.isArray(records));
    });
});

test("e2e > get one record", async () => {
  await agent
    .get(testUrls.getOne(id))
    .expect(200)
    .then((res) => {
      const record = res.body;
      assert(!Array.isArray(record));
      assert.equal(record._id, id);
    });
});

test("e2e-delete record", async () => {
  await agent.delete(testUrls.delete(id)).expect(200);
  const record = await collections.record.findOne({ _id: id });
  assert(record == null);
});

module.exports = {
  /** @param {import('express').Application} express_app */
  async run(express_app) {
    console.log = () => {};
    app = express_app;
    agent = supertest.agent(app);
    await test.run();
    console.log = log;
  },
};
