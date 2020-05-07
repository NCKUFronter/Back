// @ts-check
const log = console.log;
const test = require("baretest")("category-test");
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
  insert: "/api/category",
  getAll: "/api/category",
  getOne: (id) => "/api/category/" + id,
  patch: (id) => "/api/category/" + id,
  delete: (id) => "/api/category/" + id,
};
let id = null;

test.before(async () => {
  await simpleLogin(agent);
});

test("e2e > insert category", async () => {
  const category_dto = { name: "myCategory" };
  await agent
    .post(testUrls.insert)
    .send(category_dto)
    .expect(201)
    .then((res) => {
      /** @type {CategoryModel} */
      const { _id, ...categoryInfo } = res.body;
      id = _id;
      assert.deepStrictEqual(categoryInfo, category_dto);
    });
});

test("e2e > patch category", async () => {
  const category_dto = { name: "yourCategory" };

  await agent
    .patch(testUrls.patch(id))
    .send(category_dto)
    .expect(200)
    .then((res) => {
      const { _id, ...categoryInfo } = res.body;
      assert.deepStrictEqual(categoryInfo, category_dto);
    });
});

test("e2e > get all category", async () => {
  await agent
    .get(testUrls.getAll)
    .expect(200)
    .then((res) => {
      const categories = res.body;
      assert(Array.isArray(categories));
      for (const category of categories) {
        assert.equal(Object.keys(category).length, 2);
        assert(typeof category.name == "string");
        assert(typeof category._id == "string");
      }
    });
});

test("e2e > get one category", async () => {
  await agent
    .get(testUrls.getOne(id))
    .expect(200)
    .then((res) => {
      const category = res.body;
      assert(!Array.isArray(category));
      assert.equal(category._id, id);
    });
});

test("e2e > delete category", async () => {
  await agent.delete(testUrls.delete(id)).expect(200);
  const category = await collections.category.findOne({ _id: id });
  assert(category == null);
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
