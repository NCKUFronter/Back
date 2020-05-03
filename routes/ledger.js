// @ts-check
const { fetchNextId, collections } = require("../models/mongo");
const { LedgerSchema } = require("../models/ledger.model");
const validatePipe = require("../middleware/validate-pipe");
const router = require("express").Router();

// 假設已經 connectDB
const ledger_coll = collections.ledger;
// GET from database
router.get(
  "/",
  validatePipe("query", LedgerSchema, { context: { partial: true } }),
  async function (req, res) {
    ledger_coll.aggregate([
      { $lookup: { from: 'record', localField: "_id", foreignField: "ledgerId", as: "recordData" } }
    ]).toArray((err, result) => {
      console.log(result);
    })
    ledger_coll
      .find()
      // .sort({ ledgerId: 1 })
      .toArray(function (err, result) {
        if (err) throw err;
        res.status(200).send(result);
      });
  }
);

// GET certain data from database
router.get("/:id", function (req, res) {
  const getData = { _id: parseInt(req.params.id, 10) };

  ledger_coll.find(getData).toArray(function (err, result) {
    if (err) throw err;
    res.status(200).send(result);
  });
});

// Post the info
router.post("/", validatePipe("body", LedgerSchema), async function (req, res) {
  if (req.isAuthenticated) {
    const postData = {
      _id: await fetchNextId(ledger_coll.collectionName),
      admin: req.user[0]._id,
      userId: [req.user[0]._id],
      ...req.body,
    }
    ledger_coll.insertOne(postData, function (err, result) {
      if (err) throw err;
      console.log("1 document inserted.");
      res.status(201).send(result.ops[0]);
    });
  }
  else {
    const postData = {
      _id: await fetchNextId(ledger_coll.collectionName),
      admin: null,
      userId: [null],
      ...req.body
    }
    ledger_coll.insertOne(postData, function (err, result) {
      if (err) throw err;
      console.log("1 document inserted.");
      res.status(201).send(result.ops[0]);
    });
  }
  /*
  ledger_coll.countDocuments(function (err, count) {
    ledger_coll
      .find({})
      .sort({ ledgerId: 1 })
      .toArray(function (err, result) {
        let id = 0;
        if (count != 0) {
          id = result[count - 1].ledgerId;
        }
        const postData = {
          ledgerId: id + 1,
          userIds: req.body.userIds,
          ledgerName: req.body.ledgerName,
          admin: req.body.admin,
        };
        ledger_coll.insertOne(postData, function (err, res) {
          if (err) throw err;
          console.log("1 ledger info inserted.");
        });
        res.status(201).send("Success!");
      });
  });
      */
});

router.put(
  "/:id",
  validatePipe("body", LedgerSchema, { context: { partial: true } }),
  function (req, res) {
    const putFilter = { _id: parseInt(req.params.id, 10) };
    const putData = {
      $set: {
        ...req.body
      }
    };
    
    ledger_coll.findOneAndUpdate(
      putFilter,
      putData,
      { returnOriginal: false },
      function (err, result) {
        if (err) throw err;
        console.log("1 document updated");
        res.status(200).send(result.value);
      }
    );
  }
);

// PATCH to update certain row info
router.patch(
  "/:id",
  validatePipe("body", LedgerSchema, { context: { partial: true } }),
  function (req, res) {
    const patchFilter = { _id: parseInt(req.params.id, 10) };
    const patchData = {
      $set: req.body,
    };
    ledger_coll.findOneAndUpdate(
      patchFilter,
      patchData,
      { returnOriginal: false },
      function (err, result) {
        if (err) throw err;
        console.log("1 document updated");
        res.status(200).send(result.value);
      }
    );
  }
);

// DELETE certain row
router.delete("/:id", function (req, res) {
  const deleteFilter = { _id: parseInt(req.params.id, 10) };
  ledger_coll.deleteOne(deleteFilter, (err, result) => {
    console.log(
      "Delete row: " +
        req.params.id +
        " with filter: " +
        deleteFilter +
        ". Deleted: " +
        result.result.n
    );
    res
      .status(200)
      .send("Delete row: " + req.params.id + " from db Successfully!");
  });
});

module.exports = router;
