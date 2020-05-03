// @ts-check
// 只測試local
const test = require("baretest")("point-test");
const assert = require("assert");
const { collections } = require("../models/mongo");

/** @type {import('supertest').SuperTest} */
let agent = null;

const testUrls = {
  localLogin: "/login-local",
};

test("local login", async () => {
  await agent
    .post(testUrls.localLogin)
    .send({ email: "father@gmail.com", password: "0000" })
    .set("Accept", "application/json")
    // .redirects(1)
    .expect(200)
    .then(({ body }) => {
      // body 應該要是使用者
      assert.equal(body._id, "1");
      assert.equal(body.email, "father@gmail.com");
    });
  await agent.get("/record").expect(200).end();
});

/**
 * 目前可以運作的login
 * @param {import('supertest').SuperTest} agent
 */
async function simpleLogin(agent) {
  await agent
    .post(testUrls.localLogin)
    .send({ username: "father@gmail.com", password: "0000" })
    .redirects(1);
}

module.exports = {
  /** @param {import('supertest').SuperTest} supertest_agent */
  run: async (supertest_agent) => {
    agent = supertest_agent;
    return test.run();
  },
  simpleLogin,
};
