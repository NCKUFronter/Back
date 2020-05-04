// @ts-check
const test = require("baretest")("relation-test");
const assert = require("assert");
const { collections } = require("../models/mongo");
const {
  findWithRelation,
  findOneWithRelation,
} = require("../actions/coll-relation");

test("fine many", async () => {
  const records = await findWithRelation(collections.record, [
    "category",
    "ledger",
  ]);
  assert(Array.isArray(records));
  for (const record of records) {
    assert(record.category != null);
    assert(record.ledger != null);
  }
});

test("find one", async () => {
  const recordId = "1";
  const record = await findOneWithRelation(collections.record, recordId, [
    "category",
    "ledger",
  ]);
  assert(!Array.isArray(record));
  assert(record.category != null);
  assert(record.ledger != null);
});

module.exports = test;
