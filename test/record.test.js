// @ts-check
const test = require("baretest")("record-test");
const assert = require("assert");
const supertest = require("supertest");

/** @type {import('express').Application} */
let app = null;
/** @type {import('supertest').SuperTest} */
let agent = null;

const testUrls = {
  insert: "/record",
  get: "/record",
  patch: "/record",
  delete: "/record",
};

test("insert record", async () => {

});

module.exports = {
  /** @param {import('express').Application} express_app */
  run(express_app) {
    app = express_app;
    agent = supertest.agent(app);
    return test.run();
  },
};
