// @ts-check
const log = console.log;
const test = require("baretest")("ledger-test");
const assert = require("assert");
const supertest = require("supertest");
const { LedgerModel, UserModel } = require("../models");
const { findLast } = require("./init");
const { collections } = require("../models/mongo");
const { simpleLogin, get_child_agent } = require("./login.test");

/** @type {import('express').Application} */
let app = null;
/** @type {import('supertest').SuperTest} */
let agent = null;

const testUrls = {
  insert: "/api/ledger",
  getAll: "/api/ledger",
  getOne: (id) => "/api/ledger/" + id,
  patch: (id) => "/api/ledger/" + id,
  delete: (id) => "/api/ledger/" + id,
};
let id = null;

test.before(async () => simpleLogin(agent));

test("e2e > insert ledger > return schema error", async () => {
  /** @type {any} */
  let ledger_dto = {};
  await agent.post(testUrls.insert).send(ledger_dto).expect(400);
});

test("e2e > insert ledger > success", async () => {
  /** @type {any} */
  let ledger_dto = {
    ledgerName: "child ledger",
  };

  await agent
    .post(testUrls.insert)
    .send(ledger_dto)
    .expect(201)
    .then(async (res) => {
      /** @type {LedgerModel} */
      let ledger = await findLast(collections.ledger);

      id = ledger._id;
      assert.equal(ledger.ledgerName, "child ledger");
      assert.equal(ledger.adminId, "1");
      assert(ledger.userIds != null);
      assert.deepEqual(ledger.userIds, []);
    });
});

test("e2e > patch ledger > return 400", async () => {
  const ledger_dto = { categoryId: 4, hashtags: ["tag3", "tag2"] };

  await agent.patch(testUrls.patch(id)).send(ledger_dto).expect(400);
});

test("e2e > patch ledger", async () => {
  const ledger_dto = { ledgerName: "new ledger" };

  await agent
    .patch(testUrls.patch(id))
    .send(ledger_dto)
    .expect(200)
    .then(async (res) => {
      /** @type {LedgerModel} */
      let ledger = await collections.ledger.findOne({ _id: id });
      assert.equal(ledger.ledgerName, "new ledger");
    });
});

test("e2e > no auth to access ledger > return 403", async () => {
  /** @type {any} */
  const child_agent = await get_child_agent(app);
  const dto = { ledgerName: "my ledger" };

  await child_agent.get(testUrls.getOne(1)).expect(403);
  await child_agent.patch(testUrls.patch(1)).send(dto).expect(403);
  await child_agent.delete(testUrls.delete(1)).expect(403);

  await agent.delete(testUrls.delete(2)).expect(403);
});

test("e2e > get all ledgers", async () => {
  await agent
    .get(testUrls.getAll)
    .expect(200)
    .then((res) => {
      const ledgers = res.body;
      assert(Array.isArray(ledgers));
    });
});

test("e2e > delete ledger", async () => {
  await agent.delete(testUrls.delete(id)).expect(200);
  const ledger = await collections.ledger.findOne({ _id: id });
  assert(ledger == null);
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