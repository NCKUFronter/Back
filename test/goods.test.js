// @ts-check
const log = console.log;
const test = require("baretest")("goods-test");
const assert = require("assert");
const supertest = require("supertest");
const { simpleLogin } = require("./login.test");
const { collections } = require("../models/mongo");
const { CategoryModel } = require("../models");
const {} = require("./init");

/** @type {import('express').Application} */
let app = null;
/** @type {import('supertest').SuperTest} */
let agent = null;

const testUrls = {
  insert: "/api/goods",
  getAll: "/api/goods",
  getOne: (id) => "/api/goods/" + id,
  patch: (id) => "/api/goods/" + id,
  delete: (id) => "/api/goods/" + id,
};
let id = null;

test.before(async () => {
  await simpleLogin(agent);
});

test("e2e > get all goods", async () => {
  await agent
    .get(testUrls.getAll)
    .expect(200)
    .then((res) => {
      const goods = res.body;
      assert(Array.isArray(goods));
    });
});

test("e2e > get one goods", async () => {
  const id = "1"
  await agent
    .get(testUrls.getOne(id))
    .expect(200)
    .then((res) => {
      const goods = res.body;
      assert(!Array.isArray(goods));
      assert.equal(goods._id, id);
    });
});

module.exports = {
  /** @param {import('express').Application} express_app */
  async run(express_app) {
    console.log = () => {};
    app = express_app;
    agent = supertest.agent(app);
    await test.run();
    console.log = log; // 恢復log
  },
};
