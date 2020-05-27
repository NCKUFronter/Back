// @ts-check
const log = console.log;
const test = require("baretest")("category-test");
const assert = require("assert");
const { get_test_agents } = require("./login.test");
const { collections } = process.env.BABEL_TEST
  ? require("../dist/models/mongo")
  : require("../models/mongo");
const { CategoryModel } = process.env.BABEL_TEST
  ? require("../dist/models")
  : require("../models");

/** @type {import('express').Application} */
let app = null;

/** @type {import('./login.test').Agents} */
let agents = null;

const testUrls = {
  insert: "/api/category",
  getAll: "/api/category",
  getOne: (id) => "/api/category/" + id,
  patch: (id) => "/api/category/" + id,
  delete: (id) => "/api/category/" + id,
};
let id = null;

test.before(async () => {
  agents = await get_test_agents(app);
});

test("e2e > insert category > return 400", async () => {
  const category_dto = { name: "myCategory" };
  await agents.father.agent
    .post(testUrls.insert)
    .send(category_dto)
    .expect(400);

  category_dto.icon = "mdi-arrow-left";
  await agents.father.agent
    .post(testUrls.insert)
    .send(category_dto)
    .expect(400);

  category_dto.color = "#aaff";
  await agents.father.agent
    .post(testUrls.insert)
    .send(category_dto)
    .expect(400);
});

test("e2e > insert category(only category)", async () => {
  const category_dto = { name: "myCategory", color: "#aabbcc", icon: "1" };
  await agents.father.agent
    .post(testUrls.insert)
    .send(category_dto)
    .expect(201)
    .then((res) => {
      /** @type {CategoryModel} */
      const category = res.body;
      id = category._id;
      assert.equal(category.name, category_dto.name);
      assert.equal(category.userId, agents.father.id);
      assert.equal(category.color, "#aabbcc");
      assert.strictEqual(category.icon, "1");
    });
});

test("e2e > insert category(with hashtags)", async () => {
  const category_dto = {
    name: "myCategory2",
    color: "#aabbcc",
    icon: "1",
    hashtags: ["xxx", "ooo"],
  };
  await agents.father.agent
    .post(testUrls.insert)
    .send(category_dto)
    .expect(201)
    .then(async (res) => {
      /** @type {CategoryModel} */
      const category = res.body;
      id = category._id;
      assert.equal(category.name, category_dto.name);
      assert.equal(category.userId, agents.father.id);
      assert.equal(category.color, "#aabbcc");
      assert.strictEqual(category.icon, "1");
      assert.strictEqual(category.hashtags, undefined);

      const user = await collections.user.findOne({ _id: agents.father.id });
      assert.notEqual(user.categoryTags, null);
      assert.notEqual(user.categoryTags[id], ["xxx", "ooo"]);
    });
});

test("e2e > patch category", async () => {
  const category_dto = {
    name: "yourCategory",
    hashtags: ["xxx1", "xxx2"],
    color: "#fffaaa",
  };

  await agents.father.agent
    .patch(testUrls.patch(id))
    .send(category_dto)
    .expect(200);

  const category = await collections.category.findOne({ _id: id });
  assert.equal(category.name, "yourCategory");
  assert.strictEqual(category.hashtags, undefined);
  assert.strictEqual(category.color, "#fffaaa");

  const user = await collections.user.findOne({ _id: agents.father.id });
  assert.notEqual(user.categoryTags, null);
  assert.deepEqual(user.categoryTags[id], ["xxx1", "xxx2"]);
});

test("e2e > category > return 403", async () => {
  const child_no_auth_id = "1";
  const category_dto = { name: "yourCategory" };

  await agents.child.agent
    .patch(testUrls.patch(child_no_auth_id))
    .send(category_dto)
    .expect(403);
  await agents.child.agent.delete(testUrls.patch(child_no_auth_id)).expect(403);
});

test("e2e > get all category", async () => {
  await agents.father.agent
    .get(testUrls.getAll)
    .expect(200)
    .then((res) => {
      const categories = res.body;
      assert(Array.isArray(categories));
      for (const category of categories) {
        assert(typeof category.icon == "string");
        assert(typeof category.color == "string");
        assert(typeof category.name == "string");
        assert(typeof category._id == "string");
      }
    });
});

test("e2e > get one category", async () => {
  await agents.father.agent
    .get(testUrls.getOne(id))
    .expect(200)
    .then((res) => {
      const category = res.body;
      assert(!Array.isArray(category));
      assert.equal(category._id, id);
    });
});

test("e2e > delete category", async () => {
  await agents.father.agent.delete(testUrls.delete(id)).expect(200);
  const category = await collections.category.findOne({ _id: id });
  assert.equal(category, null);

  const user = await collections.user.findOne({ _id: agents.father.id });
  assert.notEqual(user.categoryTags[id], ["xxx", "ooo"]);
});

async function simpleInsertCategories(name, agent) {
  await agent.post(testUrls.insert).send({ name });
}

module.exports = {
  /** @param {import('express').Application} express_app */
  async run(express_app) {
    console.log = () => {};
    app = express_app;
    await test.run();
    console.log = log; // 恢復log
  },
  simpleInsertCategories,
};
