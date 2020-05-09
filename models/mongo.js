// @ts-check

// mongoDB init
// var config = require('../config');
const { MongoClient } = require("mongodb");
/** @typedef { import('mongodb').Collection } Collection */
/** @typedef {import('mongodb').ClientSession} ClientSession */

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
  pointActivity: null,
  /** @type {Collection} */
  counter: null,
  /** @type {Collection} */
  invitation: null,
};

async function connectDB() {
  await client.connect();
  console.log("DB connection successed");

  // init
  const db = client.db();
  collections.record = db.collection("record");
  collections.category = db.collection("category");
  collections.user = db.collection("user");
  collections.ledger = db.collection("ledger");
  collections.goods = db.collection("goods");
  collections.counter = db.collection("counter");
  collections.pointActivity = db.collection("point-activity");
  collections.invitation = db.collection("invitation");
}

/**
 * 小心這個會直接修改到資料庫數值
 * @param {string} coll_name
 * @param {ClientSession=} session
 * @return {Promise<string>}
 */
async function fetchNextId(coll_name, session) {
  const coll_document = await collections.counter.findOneAndUpdate(
    { _id: coll_name },
    { $inc: { nowId: 1 } },
    { session, returnOriginal: false }
  );
  return String(coll_document.value.nowId);
}

/**
 * @param {string} coll_name
 * @return {Promise<string>}
 */
async function fetchNowId(coll_name) {
  const coll_document = await collections.counter.findOne({ _id: coll_name });
  return String(coll_document.nowId);
}

/**
 * @param {Collection} coll
 * @param {object} value
 * @param {ClientSession=} session
 */
async function simpleInsertOne(coll, value, session) {
  return coll.insertOne(
    { ...value, _id: await fetchNextId(coll.collectionName) },
    { session }
  );
}

/**
 * @param {(session: ClientSession) => Promise<void>} fn
 */
async function workInTransaction(fn) {
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await fn(session);
    });
  } catch (err) {
    console.log(err);
    await session.endSession();
    throw err;
    // return false;
  }
  await session.endSession();
  return true;
}

module.exports = {
  client,
  connectDB,
  collections,
  fetchNextId,
  fetchNowId,
  simpleInsertOne,
  workInTransaction,
};
