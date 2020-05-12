// @ts-check
// 只測試local
/** @typedef {import('supertest').SuperTest} SuperTest */
const log = console.log;
const test = require("baretest")("login-test");
const supertest = require("supertest");
const assert = require("assert");
const { collections } = require("../models/mongo");
const { findLast } = require("./init");

/** @type {import('express').Application} */
let app = null;
/** @type {import('supertest').SuperTest} */
let agent = null;

const testUrls = {
  localLogin: "/api/user/login",
  localLogout: "/api/user/logout",
};

test("e2e > local login > success", async () => {
  await agent.get("/api/ledger/2").expect(401);
  await agent
    .post(testUrls.localLogin)
    .send({ email: "father@gmail.com", password: "0000" })
    .expect(200);
  await agent.get("/api/ledger/2").expect(200);
});

test("e2e > login point check > no point", async () => {
  const mother_agent = await get_mother_agent(app);
  let mother = await collections.user.findOne({ _id: "2" });
  const before_mother_points = mother.rewardPoints;

  await mother_agent
    .post("/api/user/pointCheck")
    .expect(200)
    .then((res) => {
      assert.deepEqual(res.body, {});
    });

  mother = await collections.user.findOne({ _id: "2" });
  assert.equal(mother.rewardPoints, before_mother_points);
});

test("e2e > login point check > login point", async () => {
  const father_agent = agent;
  let father = await collections.user.findOne({ _id: "1" });
  const before_father_points = father.rewardPoints;

  await father_agent
    .post("/api/user/pointCheck")
    .expect(200)
    .then((res) => {
      assert.deepEqual(res.body, { perLogin: 10 });
    });

  father = await collections.user.findOne({ _id: "1" });
  assert.equal(father.rewardPoints, before_father_points + 10);
});

test("e2e > login point check > login + continue point", async () => {
  const child_agent = await get_child_agent(app);
  let child = await collections.user.findOne({ _id: "3" });
  const before_child_points = child.rewardPoints;

  await child_agent
    .post("/api/user/pointCheck")
    .expect(200)
    .then((res) => {
      assert.deepEqual(res.body, { perLogin: 10, continueLogin: 10 });
    });

  child = await collections.user.findOne({ _id: "3" });
  assert.equal(child.rewardPoints, before_child_points + 20);
});

test("e2e > local logout > success", async () => {
  await agent.post(testUrls.localLogout).expect(200);
  await agent.get("/api/ledger/1").expect(401);
});

/**
 * 目前可以運作的login
 * @param {import('supertest').SuperTest} agent
 */
async function simpleLogin(agent, email = "father@gmail.com") {
  await agent.post(testUrls.localLogin).send({ email, password: "0000" });
}

async function get_child_agent(app) {
  const agent = supertest.agent(app);
  await simpleLogin(agent, "child@gmail.com");
  return agent;
}

async function get_mother_agent(app) {
  const agent = supertest.agent(app);
  await simpleLogin(agent, "mother@gmail.com");
  return agent;
}

/**
 * @typedef { {id: string, agent: SuperTest} } PersonAgentInfo
 */
/**
 * @typedef { object } Agents
 * @property {PersonAgentInfo} father
 * @property {PersonAgentInfo} mother
 * @property {PersonAgentInfo} child
 */

/**
 * @param {import('express').Application} app
 */
async function get_test_agents(app) {
  const father_agent = supertest.agent(app);
  const mother_agent = supertest.agent(app);
  const child_agent = supertest.agent(app);

  await simpleLogin(father_agent, "father@gmail.com");
  await simpleLogin(mother_agent, "mother@gmail.com");
  await simpleLogin(child_agent, "child@gmail.com");

  return {
    father: {
      agent: father_agent,
      id: "1",
    },
    mother: {
      agent: mother_agent,
      id: "2",
    },
    child: {
      agent: child_agent,
      id: "3",
    },
    notLogin: {
      agent: supertest(app) 
    }
  };
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
  get_child_agent,
  get_mother_agent,
  get_test_agents,
};
