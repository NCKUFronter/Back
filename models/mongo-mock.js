// @ts-check
const log = console.log;
const assert = require("assert");
const mongodb = require("../../../mongo-mock");
mongodb.max_delay = 0;
const MongoClient = mongodb.MongoClient;
const dbfile = "fronter.db";
const uri = "mongodb://localhost/uidd";

function getFronterClient() {
  /** @type { import('mongodb').MongoClient } */
  let client = null;

  return {
    db: () => {
      return client.db("uidd");
    },
    connect: async () => {
      try {
        await MongoClient.load(dbfile);
      } catch (err) {
        console.log(err)
      }
      // @ts-ignore
      MongoClient.persist = dbfile;
      client = await MongoClient.connect(uri);
    },
    close: () => {
      return client.close();
    },
  };
}

module.exports = getFronterClient;
