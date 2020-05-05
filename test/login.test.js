// @ts-check
// 只測試local
const log = console.log;
const test = require("baretest")("login-test");
const supertest = require("supertest");
const assert = require("assert");
const { collections } = require("../models/mongo");

/** @type {import('express').Application} */
let app = null;
/** @type {import('supertest').SuperTest} */
let agent = null;

const testUrls = {
  localLogin: "/login-local",
  localLogout: "/login/logout",
};

test("local login", async () => {
  await agent
    .post(testUrls.localLogin)
    .send({ email: "father@gmail.com", password: "0000" })
    .set("Accept", "application/json")
    .redirects(1)
    .expect(200);
  /*
    .then(({ body }) => {
      // body 應該要是使用者
      // assert.equal(body._id, "1");
      // assert.equal(body.email, "father@gmail.com");
    });
    */
  await agent.get("/record").expect(200);
});

test("local logout", async () => {
  await agent.post(testUrls.localLogout).redirects(1).expect(200);
  // await agent.put("/user/1").send({}).expect(401);
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
  /** @param {import('express').Application} express_app */
  async run(express_app) {
    // 關閉 log
    console.log = () => {};

    app = express_app;
    agent = supertest.agent(app);
    await test.run();

    console.log = log; // 恢復log
  },
  simpleLogin,
};
