// @ts-check

// mongoDB init
// var config = require('../config');
const { MongoClient } = require("mongodb");
/** @typedef { import('mongodb').Collection } Collection */

const uri = process.env.DB_URI; // config.mongo.uri;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const collections = {
  /** @type {Collection} */
  record: null,
  /** @type {Collection} */
  user: null,
  /** @type {Collection} */
  ledger: null,
  /** @type {Collection} */
  category: null,
  /** @type {Collection} */
  goods: null,
  /** @type {Collection} */
  counter: null,
};

async function connectDB() {
  await client.connect();
  console.log("DB connection successed");

  // init
  const db = client.db("uidd-db");
  collections.record = db.collection("record");
  collections.category = db.collection("category");
  collections.user = db.collection("user");
  collections.ledger = db.collection("ledger");
  collections.goods = db.collection("goods");
  collections.counter = db.collection("counter");
}

/** @param {string} coll_name */
// 小心這個會直接修改到資料庫數值
async function fetchNextId(coll_name) {
  const coll_document = await collections.counter.findOneAndUpdate(
    { _id: coll_name },
    { $inc: { nowId: 1 } },
    { returnOriginal: false }
  );
  return coll_document.value.nowId;
}

async function fetchNowId(coll_name) {
  const coll_document = await collections.counter.findOne({ _id: coll_name });
  return coll_document.value.nowId;
}

module.exports = {
  client,
  connectDB,
  collections,
  fetchNextId,
  fetchNowId,
};
