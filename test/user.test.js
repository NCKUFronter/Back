// @ts-check
const log = console.log;
const test = require("baretest")("user-test");
const assert = require("assert");
const { userLedgers, userInvitations, userPointActivities } = process.env
  .BABEL_TEST
  ? require("../dist/actions/user.actions")
  : require("../actions/user.actions");
const { collections } = process.env.BABEL_TEST
  ? require("../dist/models/mongo")
  : require("../models/mongo");
const { get_test_agents } = require("./login.test");
const { simpleInsertCategories } = require("./category.test");
const { InvitationModel, PointActivityModel } = process.env.BABEL_TEST
  ? require("../dist/models")
  : require("../models");

/** @type {import('express').Application} */
let app = null;
/** @type {import('./login.test').Agents} */
let agents = null;

test.before(async () => {
  agents = await get_test_agents(app);
});

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
  await agents.father.agent
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
  await agents.father.agent
    .get("/api/user/ledgers")
    .expect(200)
    .then((res) => {
      const ledgers = res.body;
      assert(Array.isArray(ledgers));
      assert.equal(ledgers.length, 2);
      for (const ledger of ledgers) {
        assert(ledger.adminId == "1" || ledger.userIds.includes("1"));
      }
    });
});

test("e2e > user pointActivity", async () => {
  await agents.father.agent
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

test("e2e > user profile", async () => {
  await agents.father.agent
    .get("/api/user/profile")
    .expect(200)
    .then((res) => {
      const profile = res.body;
      assert.equal(profile._id, agents.father.id);
    });
});

test("e2e > user relativeUsers", async () => {
  await agents.father.agent
    .get("/api/user/relativeUsers")
    .expect(200)
    .then((res) => {
      const users = res.body;
      assert(Array.isArray(users));
      for (const user of users) {
        assert.notEqual(user._id, "1");
      }
    });
});

test("e2e > user categories", async () => {
  await simpleInsertCategories("category1", agents.father.agent);
  await simpleInsertCategories("category2", agents.child.agent);

  await agents.father.agent
    .get("/api/user/categories")
    .expect(200)
    .then((res) => {
      const categories = res.body;
      assert(Array.isArray(categories));
      for (const category of categories) {
        assert(category.userId == null || category.userId == "1");
        assert.notEqual(category.name, "category2");
      }
    });
});

module.exports = {
  /** @param {import('express').Application} express_app */
  async run(express_app) {
    console.log = () => {};
    app = express_app;
    await test.run();
    console.log = log;
  },
};
