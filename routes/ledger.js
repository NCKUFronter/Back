// @ts-check
const { fetchNextId, collections } = require("../models/mongo");
const { LedgerSchema } = require("../models/ledger.model");
const validatePipe = require("../middleware/validate-pipe");
const loginCheck = require("../middleware/login-check");
const collRelation = require("../middleware/coll-relation");
const router = require("express").Router();

// 假設已經 connectDB
const ledger_coll = collections.ledger;
// GET from database
router.get(
  "/",
  validatePipe("query", LedgerSchema, { context: { partial: true } }),
  function (req, res) {
    collRelation(ledger_coll, 'recrod', '_id', 'ledgerId', 'recordData');
  }
);

// GET certain data from database
router.get("/:id", loginCheck(ledger_coll), function (req, res) {
  const getData = { _id: req.params.id };
  ledger_coll.find(getData).toArray(function (err, result) {
    if (err) throw err;
    res.status(200).send(result);
  });
});

router.post("/", validatePipe("body", LedgerSchema), loginCheck(ledger_coll), async function (req, res) {
    const postData = {
      _id: await fetchNextId(ledger_coll.collectionName),
      // @ts-ignore
      admin: req.userId,
      // @ts-ignore
      userId: [req.userId],
      ...req.body,
    }
    ledger_coll.insertOne(postData, function (err, result) {
      if (err) throw err;
      console.log("1 document inserted.");
      res.status(201).send(result.ops[0]);
    });
});

// router.put(
//   "/:id",
//   validatePipe("body", LedgerSchema, { context: { partial: true } }),
//   function (req, res) {
//     const putFilter = { _id: req.params.id };
//     const putData = {
//       $set: {
//         ...req.body
//       }
//     };
//     ledger_coll.findOneAndUpdate(
//       putFilter,
//       putData,
//       { returnOriginal: false },
//       function (err, result) {
//         if (err) throw err;
//         console.log("1 document updated");
//         res.status(200).send(result.value);
//       }
//     );
//   }
// );

router.patch(
  "/:id",
  validatePipe("body", LedgerSchema, { context: { partial: true } }),
  loginCheck(ledger_coll),
  function (req, res) {
    // @ts-ignore
    const patchFilter = { _id: req.params.id, adminId: req.userId };
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

router.delete("/:id", loginCheck(ledger_coll), function (req, res) {
  // @ts-ignore
  const deleteFilter = { _id: req.params.id, adminId: req.userId };
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
