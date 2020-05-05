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
  insert: "/category",
  getAll: "/category",
  getOne: (id) => "/category/" + id,
  patch: (id) => "/category/" + id,
  delete: (id) => "/category/" + id,
};
let id = "5";

test.before(async () => {
  await simpleLogin(agent);
});

test("insert category", async () => {
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

test("patch category", async () => {
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

test("get all category", async () => {
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

test("delete category", async () => {
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
