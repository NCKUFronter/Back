// @ts-check
const test = require("baretest")("other-test");
const assert = require("assert");
const { collections } = require("../models/mongo");
const {
  findWithRelation,
  findOneWithRelation,
} = require("../actions/coll-relation");
const { notification } = require("../actions/notification.service");

test("invitation-fine many records", async () => {
  const records = await findWithRelation(collections.record, [
    "category",
    "ledger",
  ]);
  assert(Array.isArray(records));
  for (const record of records) {
    assert(typeof record.category == "object");
    assert(typeof record.ledger == "object");
  }
});

test("invitation-find one ledger", async () => {
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

test("notification", async () => {
  const event = 5;
  const event$ = notification.listen();
  event$.subscribe((res) => assert.equal(res, 5));

  notification.send(event);
});

module.exports = test;
