// @ts-check
const log = console.log;
const test = require("baretest")("user-test");
const assert = require("assert");
const supertest = require("supertest");
const {
  userLedgers,
  userInvitations,
  userPointActivities,
} = require("../actions/user.actions");
const { collections } = require("../models/mongo");
const { simpleLogin } = require("./login.test");
const { InvitationModel, PointActivityModel } = require("../models");

/** @type {import('express').Application} */
let app = null;
/** @type {import('supertest').SuperTest} */
let agent = null;

test.before(async () => simpleLogin(agent));

test("unit > user ledgers", async () => {
  const userId = "3";
  const ledgers = await userLedgers(userId);
  assert(Array.isArray(ledgers));
  for (const ledger of ledgers) {
    assert(ledger.adminId == userId || ledger.userIds.includes(userId));
  }
});

test("unit > user invitations", async () => {
  const userId = "3";
  /** @type {InvitationModel[]} */
  const invitations = await userInvitations(userId);
  for (const invitation of invitations) {
    assert.equal(invitation.type, 2);
    assert.notEqual(invitation.fromUserId, userId);
    assert.equal(invitation.toUserId, userId);
  }
});

test("unit > user pointActivity", async () => {
  const userId = "1";
  /** @type {PointActivityModel[]} */
  const pointActivities = await userPointActivities(userId);

  for (const activity of pointActivities) {
    assert(activity.toUserId == userId || activity.fromUserId == userId);
  }
});

test("e2e > user invitations", async () => {
  await agent
    .get("/api/user/invitations")
    .expect(200)
    .then((res) => {
      const invitations = res.body;
      for (const invitation of invitations) {
        assert.equal(invitation.type, 2);
        assert.notEqual(invitation.fromUserId, "1");
        assert.equal(invitation.toUserId, "1");
      }
    });
});

test("e2e > user ledgers", async () => {
  await agent
    .get("/api/user/ledgers")
    .expect(200)
    .then((res) => {
      const ledgers = res.body;
      assert(Array.isArray(ledgers));
      for (const ledger of ledgers) {
        assert(ledger.adminId == "1" || ledger.userIds.includes("1"));
      }
    });
});

test("e2e > user pointActivity", async () => {
  await agent
    .get("/api/user/pointActivities")
    .expect(200)
    .then((res) => {
      const pointActivities = res.body;
      assert(Array.isArray(pointActivities));
      for (const activity of pointActivities) {
        assert(activity.toUserId == "1" || activity.fromUserId == "1");
      }
    });
});

test("e2e > user pointActivity", async () => {
  await agent
    .get("/api/user/profile")
    .expect(200)
    .then((res) => {
      const profile = res.body;
      assert.equal(profile._id, "1");
    });
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
