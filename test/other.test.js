// @ts-check
const log = console.log;
const test = require("baretest")("other-test");
const assert = require("assert");
const { collections } = process.env.BABEL_TEST
  ? require("../dist/models/mongo")
  : require("../models/mongo");
const { findWithRelation, findOneWithRelation } = process.env.BABEL_TEST
  ? require("../dist/actions/coll-relation")
  : require("../actions/coll-relation");
const checkParamsIdExists = process.env.BABEL_TEST
  ? require("../dist/middleware/check-params-id-exists")
  : require("../middleware/check-params-id-exists");
const { notification } = process.env.BABEL_TEST
  ? require("../dist/actions/notification.service")
  : require("../actions/notification.service");
const dateCount = process.env.BABEL_TEST
  ? require("../dist/actions/dateCount")
  : require("../actions/dateCount");
const { get_test_agents } = require("./login.test");
const router = require("express-promise-router").default();

/** @type {import('express').Application} */
let app = null;
/** @type {import('./login.test').Agents} */
let agents = null;

test.before(async () => {
  agents = await get_test_agents(app);
  // api test error
  router.get("/api/error", (req, res) => {
    throw "throw Error";
  });
  router.get("/api/error/callback", (req, res, next) => {
    return collections.category.find().toArray(function (err, result) {
      next("get error");
    });
  });
  router.get("/api/error/promise", (req, res) => {
    return Promise.reject("primse error");
  });
  router.get("/api/error/async", async (req, res) => {
    await Promise.reject("async Error");
  });
  app.use(router);
  app.use((err, req, res, next) => {
    if (err) res.status(500).send(err.message || err);
    else next();
  });
});

test("unit > invitation > find many records", async () => {
  const records = await findWithRelation(collections.record, null, [
    "category",
    "ledger",
  ]);
  assert(Array.isArray(records));
  for (const record of records) {
    assert(typeof record.category == "object");
    assert(typeof record.ledger == "object");
  }
});

test("unit > relation > ledger with admin, users", async () => {
  const ledgerId = "1";
  const ledger = await findOneWithRelation(
    collections.ledger,
    ledgerId,
    ["admin"],
    ["users"]
  );
  assert(!Array.isArray(ledger));
  assert(ledger.admin != null);
  assert(Array.isArray(ledger.users));
});

test("unit > nested relation > invitation with ledger, ledger.users", async () => {
  const invitationId = "1";
  const invitation = await findOneWithRelation(
    collections.invitation,
    invitationId,
    ["ledger", "ledger.users"],
    []
  );
  assert(!Array.isArray(invitation));
  assert(invitation.ledger != null);
  assert(Array.isArray(invitation.ledger.users));
});

/*
test("unit > notification", async () => {
  const event = 5;
  const event$ = notification.listen();
  // @ts-ignore
  event$.subscribe((res) => assert.equal(res, 5));

  notification.send(event);
});
*/

test("unit > dateCount", async () => {
  let nowDate = new Date(2019, 4, 12, 1);
  let lastDate = new Date(2019, 4, 11, 8);
  assert.equal(dateCount(nowDate, lastDate, 0), 1);

  nowDate.setDate(13);
  assert.equal(dateCount(nowDate, lastDate, 0), 1);
});

test("e2e > throw error > return 500", async () => {
  await agents.notLogin.agent.get("/api/error").expect(500);
  await agents.notLogin.agent.get("/api/error/callback").expect(500);
  await agents.notLogin.agent.get("/api/error/promise").expect(500);
  await agents.notLogin.agent.get("/api/error/async").expect(500);
});

module.exports = {
  /** @param {import('express').Application} express_app*/
  async run(express_app) {
    console.log = () => {};
    app = express_app;
    await test.run();
    console.log = log;
  },
};
