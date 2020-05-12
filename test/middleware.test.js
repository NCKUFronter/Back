// @ts-check
const log = console.log;
const test = require("baretest")("middlware-test");
const assert = require("assert");
const { collections } = require("../models/mongo");
const checkParamsIdExists = require("../middleware/check-params-id-exists");

let result = "";
let myStatus = 0;
let goToNext = false;

function reset() {
  result = "";
  myStatus = 0;
  goToNext = false;
}

let res = {
  status(s) {
    myStatus = s;
    return {
      json: (message) => {
        result = message;
      },
      send: (message) => {
        result = message;
      },
    };
  },
};

let next = () => {
  goToNext = true;
};

test("checkParamsIdExists", async () => {
  let id = "8";
  let req = { params: { id } };

  reset();
  await checkParamsIdExists(collections.goods)(req, res, next);
  assert.equal(myStatus, 0);
  assert.equal(goToNext, true);
  assert(req.convert_from_params);
  assert(req.convert_from_params.id);
  assert.equal(req.convert_from_params.id._id, id);

  reset();
  req = { params: { id } };
  await checkParamsIdExists(collections.ledger)(req, res, next);
  assert.equal(myStatus, 404);
  assert.equal(goToNext, false);
  assert.equal(req.convert_from_params, null);
});

module.exports = test;
