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
  event$.subscribe((res) => assert.equal(res, 5));

  notification.send(event);
});

test("middleware > checkParamsIdExists", async () => {
  let myStatus = 0;
  let result = "";
  let id = "8";
  let req = { params: { id } };
  const res = {
    status(s) {
      myStatus = s;
      return {
        json: (message) => {
          result = message;
        },
      };
    },
  };
  const next = () => {
    result = "next";
  };

  await checkParamsIdExists(collections.goods)(req, res, next);
  assert.equal(myStatus, 0);
  assert.equal(result, "next");
  assert(req.convert_from_params);
  assert(req.convert_from_params.id);
  assert.equal(req.convert_from_params.id._id, id);

  req = { params: { id } };
  await checkParamsIdExists(collections.ledger)(req, res, next);
  assert.equal(myStatus, 404);
  assert.notEqual(result, "next");
  assert.equal(req.convert_from_params, null);
});

module.exports = {
  async run() {
    console.log = () => {};
    await test.run();
    console.log = log;
  },
};
