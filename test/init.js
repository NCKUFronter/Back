// @ts-check
const { collections, client } = require("../models/mongo");

async function resetDB() {
  try {
    await dropDB();
  } catch (err) {
    // console.log(err)
  } finally {
    await initDB();
  }
}

async function dropNoError(coll) {
  try {
    await coll.drop();
  } catch (err) {
    // console.log(err)
  }
}

async function dropDB() {
  await dropNoError(collections.user)
  await dropNoError(collections.pointActivity)
  await dropNoError(collections.invitation)
  await dropNoError(collections.category)
  await dropNoError(collections.goods)
  await dropNoError(collections.ledger)
  await dropNoError(collections.record)
  await dropNoError(collections.counter)
}

async function initDB() {
  const db = client.db();
  await db.createCollection("user");
  await db.createCollection("invitation");
  await db.createCollection("point-activity");
  await db.createCollection("category");
  await db.createCollection("goods");
  await db.createCollection("record");
  await db.createCollection("ledger");
  await db.createCollection("counter");
  await initDBData(db);
}

/** @param {import('mongodb').Db} db */
async function initDBData(db) {
  await db.collection("user").insertMany([
    {
      _id: "100000243241",
      name: "小孩",
      email: "child@gmail.com",
      picture: "",
      rewardPoints: 100,
    },
    {
      _id: 1,
      name: "爸爸",
      password: "0000",
      email: "father@gmail.com",
      picture: "",
      rewardPoints: 50,
    },
    {
      _id: 2,
      name: "媽媽",
      password: "0000",
      picture: "",
      email: "mother@gmail.com",
      rewardPoints: 0,
    },
  ]);

  await db.collection("category").insertMany([
    {
      _id: 1,
      name: "食物",
    },
    {
      _id: 2,
      name: "交通",
    },
    {
      _id: 3,
      name: "治裝",
    },
    {
      _id: 4,
      name: "娛樂",
    },
  ]);

  await db.collection("record").insertMany([
    {
      _id: 1,
      categoryId: 1,
      detail: "0421的收入",
      money: 187,
      ledgerId: 1,
      recordType: "income",
      date: "2020-04-21T08:37:30.640Z",
      rewardPoints: 0
    },
    {
      _id: 2,
      categoryId: 2,
      detail: "0421的支出",
      money: 200,
      ledgerId: 1,
      recordType: "expense",
      date: "2020-04-21T11:37:30.640Z",
      rewardPoints: 0
    },
    {
      _id: 3,
      categoryId: 4,
      detail: "0420的收入",
      money: 36,
      ledgerId: 2,
      recordType: "income",
      date: "2020-04-20T11:37:30.640Z",
      rewardPoints: 0
    },
    {
      _id: 4,
      categoryId: 1,
      detail: "0419的收入",
      money: 187,
      ledgerId: 1,
      recordType: "income",
      date: "2020-04-19T11:10:30.640Z",
      rewardPoints: 0
    },
    {
      _id: "5",
      categoryId: 2,
      detail: "0419的支出",
      money: 200,
      ledgerId: 2,
      recordType: "expense",
      date: "2020-04-19T11:37:30.640Z",
      rewardPoints: 0
    },
    {
      _id: 6,
      categoryId: 4,
      detail: "0418的收入",
      money: 36,
      ledgerId: 2,
      recordType: "income",
      date: "2020-04-18T11:37:30.640Z",
      rewardPoints: 0
    },
    {
      recordType: "income",
      money: 100,
      date: "2020-04-28T07:38:00.361Z",
      categoryId: 1,
      ledgerId: 1,
      reviseDate: "2020-04-28T07:40:06.215Z",
      userId: 1,
      _id: 7,
      rewardPoints: 0
    },
    {
      recordType: "income",
      money: 100,
      date: "2020-04-28T07:38:00.361Z",
      categoryId: 1,
      ledgerId: 1,
      reviseDate: "2020-04-29T07:47:23.881Z",
      userId: 1,
      _id: 8,
      rewardPoints: 0
    },
  ]);

  await db.collection("invitation").insertMany([
    {
      _id: 1,
      ledgerId: 1,
      fromUserId: 1,
      toUserId: 2,
      type: 2,
    },
  ]);

  // db.collection('point-activity').insertMany([])

  await db.collection("ledger").insertMany([
    {
      _id: 1,
      name: "Main Account",
      adminId: 1,
      userIds: [1, 2],
    },
    {
      _id: 2,
      name: "Bank SinoPac",
      adminId: 2,
    },
  ]);

  await db.collection("goods").insertMany([
    {
      _id: 1,
      name: "手套",
      point: 4,
    },
    {
      _id: 2,
      name: "手套上的寶石",
      point: 5,
    },
  ]);

  await db.collection("counter").insertMany([
    { _id: "record", nowId: 8 },
    { _id: "goods", nowId: 2 },
    { _id: "invitation", nowId: 1 },
    { _id: "point-activity", nowId: 0 },
    { _id: "ledger", nowId: 2 },
    { _id: "category", nowId: 4 },
    { _id: "user", nowId: 2 },
  ]);
}

// for mongo-mock
function connectDBFn(collections, client) {
  return () => {
    console.log("DB connect success");
    const db = client.db();
    collections.record = db.collection("record");
    collections.category = db.collection("category");
    collections.user = db.collection("user");
    collections.ledger = db.collection("ledger");
    collections.goods = db.collection("goods");
    collections.counter = db.collection("counter");
    collections.pointActivity = db.collection("point-activity");
  };
}

module.exports = {
  initDB,
  initDBData,
  connectDBFn,
  resetDB,
};
