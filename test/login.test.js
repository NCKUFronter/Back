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
  localLogin: "/api/user/login",
  localLogout: "/api/user/logout",
};

test("e2e-local login", async () => {
  await agent.get("/api/ledger/2").expect(401);
  await agent
    .post(testUrls.localLogin)
    .send({ email: "father@gmail.com", password: "0000" })
    .expect(200);
  await agent.get("/api/ledger/2").expect(200);
});

test("e2e-local logout", async () => {
  await agent.post(testUrls.localLogout).expect(200);
  await agent.get("/api/ledger/1").expect(401);
});

/**
 * 目前可以運作的login
 * @param {import('supertest').SuperTest} agent
 */
async function simpleLogin(agent, email = "father@gmail.com") {
  await agent
    .post(testUrls.localLogin)
    .send({ email, password: "0000" })
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
