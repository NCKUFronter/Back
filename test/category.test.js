// @ts-check
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
  delete: "/category",
};

test.before(async () => {
  await simpleLogin(agent);
});

test("insert category", async () => {
  const category_dto = { name: "myCategory" };
  await supertest(app)
    .post(testUrls.insert)
    .send(category_dto)
    .expect(201)
    .then((res) => {
      /** @type {CategoryModel} */
      const { _id, ...categoryInfo } = res.body;
      assert.deepStrictEqual(categoryInfo, category_dto);
    });
});

test("patch category", async () => {
  const id = "5";
  const category_dto = { name: "yourCategory" };

  await supertest(app)
    .patch(testUrls.patch(id))
    .send(category_dto)
    .expect(200)
    .then((res) => {
      const { _id, ...categoryInfo } = res.body;
      assert.deepStrictEqual(categoryInfo, category_dto);
    });
});

test("get all category", async () => {
  await supertest(app).get(testUrls.get).expect(200);
});

module.exports = {
  /** @param {import('express').Application} express_app */
  run(express_app) {
    app = express_app;
    agent = supertest.agent(app);
    return test.run();
  },
};
