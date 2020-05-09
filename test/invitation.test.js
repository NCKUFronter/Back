// @ts-check
const log = console.log;
const test = require("baretest")("invitation-test");
const assert = require("assert");
const supertest = require("supertest");
const { invite, answerInvitation } = require("../actions/invitation.actions");
const { collections } = require("../models/mongo");
const { InvitationModel } = require("../models");
const { findLast } = require("./init");
const { simpleLogin, get_child_agent } = require("./login.test");

/** @type {import('express').Application} */
let app = null;
/** @type {import('supertest').SuperTest} */
let agent = null;
let child_agent = null;

const testUrls = {
  invite: "/api/invitation/invite",
  answer: (id) => `/api/invitation/${id}/answer`,
};
let id = null;

test.before(async () => {
  simpleLogin(agent);
  child_agent = await get_child_agent(app);
});

async function doInviteTest(ledgerId, fromUserId, toUserId) {
  const ledger = await collections.ledger.findOne({ _id: ledgerId });
  const fromUser = await collections.user.findOne({ _id: fromUserId });
  const toUser = await collections.user.findOne({ _id: toUserId });

  await invite(ledger, fromUser, toUser);

  /** @type {InvitationModel} */
  const invitation = await findLast(collections.invitation);
  id = invitation._id;
  assert.equal(invitation.ledgerId, ledger._id);
  assert.equal(invitation.fromUserId, fromUser._id);
  assert.equal(invitation.toUserId, toUser._id);
  assert.equal(invitation.type, 2);
}

test("unit > invite", async () => {
  const ledgerId = "1";
  const fromUserId = "2";
  const toUserId = "3";
  await doInviteTest(ledgerId, fromUserId, toUserId);
});

test("unit > accept invitation", async () => {
  await doInviteTest("2", "2", "3");

  /** @type {InvitationModel} */
  let invitation = await findLast(collections.invitation);
  await answerInvitation(invitation, true);

  invitation = await findLast(collections.invitation);
  assert.equal(invitation.type, 1);

  const ledger = await collections.ledger.findOne({ _id: invitation.ledgerId });
  assert.equal(ledger.userIds.length, new Set(ledger.userIds).size);
  assert(ledger.userIds.includes("3"));
});

test("unit > reject invitation", async () => {
  await doInviteTest("1", "1", "3");

  /** @type {InvitationModel} */
  let invitation = await findLast(collections.invitation);
  await answerInvitation(invitation, false);

  invitation = await findLast(collections.invitation);
  assert.equal(invitation.type, 0);
  assert.notEqual(invitation.answerTime, null);

  const ledger = await collections.ledger.findOne({ _id: invitation.ledgerId });
  assert.equal(new Set(ledger.userIds).size, ledger.userIds.length);
  assert.ok(!ledger.userIds.includes("3"));
});

test("e2e > invite > return 403", async () => {
  let dto = { ledgerId: "1", email: "child@gmail.com" };
  await child_agent.post(testUrls.invite).send(dto).expect(403);
});

test("e2e > invite > return 400", async () => {
  let dto = { ledgerId: "2", email: "xxxx@gmail.com" };
  await agent.post(testUrls.invite).send(dto).expect(400);

  dto.email = "father@gmail.com";
  await agent.post(testUrls.invite).send(dto).expect(400);
});

test("e2e > invite > return 200", async () => {
  let dto = { ledgerId: "1", email: "child@gmail.com" };
  await agent
    .post(testUrls.invite)
    .send(dto)
    .expect(200)
    .then((res) => {
      /** @type {InvitationModel} */
      const invitation = res.body;
      id = invitation._id;
      assert.equal(invitation.ledgerId, dto.ledgerId);
      assert.equal(invitation.fromUserId, "1");
      assert.equal(invitation.toUserId, "3");
      assert.equal(invitation.type, 2);
    });
});

test("e2e > answer invitation > return 403", async () => {
  await agent.put(testUrls.answer(id)).send({ answer: true }).expect(403);
});

test("e2e > answer invitation > return 400", async () => {
  await agent.put(testUrls.answer(id)).send({ anwser: 1 }).expect(400);
});

test("e2e > reject invitation > return 200", async () => {
  await child_agent
    .put(testUrls.answer(id))
    .send({ answer: false })
    .expect(200);

  const invitation = await collections.invitation.findOne({ _id: id });
  assert.equal(invitation.type, 0);

  const ledger = await collections.ledger.findOne({ _id: invitation.ledgerId });
  assert.equal(ledger.userIds.length, new Set(ledger.userIds).size);
  assert(!ledger.userIds.includes("3"));
});

test("e2e > accept invitation > return 200", async () => {
  await doInviteTest("1", "1", "3");
  await child_agent.put(testUrls.answer(id)).send({ answer: true }).expect(200);

  const invitation = await collections.invitation.findOne({ _id: id });
  assert.equal(invitation.type, 1);

  const ledger = await collections.ledger.findOne({ _id: invitation.ledgerId });
  assert.equal(ledger.userIds.length, new Set(ledger.userIds).size);
  assert(ledger.userIds.includes("3"));
});

test("e2e > leave ledger > return 200", async () => {
  await child_agent.post('/api/ledger/1/leave').expect(200);

  const ledger = await collections.ledger.findOne({ _id: "1" });
  assert.equal(ledger.userIds.length, new Set(ledger.userIds).size);
  assert.equal(ledger.userIds.includes("3"), false);
});

test("e2e > make somebody leave ledger > return 200", async () => {
  await agent.post('/api/ledger/1/leave/2').expect(200);

  const ledger = await collections.ledger.findOne({ _id: "1" });
  assert.equal(ledger.userIds.length, new Set(ledger.userIds).size);
  assert.equal(ledger.userIds.includes("2"), false);
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
