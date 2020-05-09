// @ts-check
const log = console.log;
const test = require("baretest")("other-test");
const assert = require("assert");
const { collections } = require("../models/mongo");
const {
  findWithRelation,
  findOneWithRelation,
} = require("../actions/coll-relation");
const checkParamsIdExists = require("../middleware/check-params-id-exists");
const { notification } = require("../actions/notification.service");
const dateCount = require("../actions/dateCount");

test("invitation > find many records", async () => {
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

test("invitation > find one ledger", async () => {
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
  // @ts-ignore
  event$.subscribe((res) => assert.equal(res, 5));

  notification.send(event);
});

test("dateCount", async () => {
  let nowDate = new Date(2019, 4, 12, 1);
  let lastDate = new Date(2019, 4, 11, 8);
  assert.equal(dateCount(nowDate, lastDate, 0), 1);

  nowDate.setDate(13)
  assert.equal(dateCount(nowDate, lastDate, 0), 1);
});

module.exports = {
  async run() {
    console.log = () => {};
    await test.run();
    console.log = log;
  },
};
