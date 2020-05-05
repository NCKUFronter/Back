// @ts-check
const { collections, fetchNextId } = require("../models/mongo");
const { RecordSchema } = require("../models/record.model");
const validatePipe = require("../middleware/validate-pipe");
const loginCheck = require("../middleware/login-check");
const {
  findWithRelation,
  findOneWithRelation,
} = require("../actions/coll-relation");
const router = require("express").Router();

const record_coll = collections.record;

// GET from database
router.get("/", loginCheck(record_coll), async function (req, res) {
  // collRelation(record_coll, 'category', 'categoryId', '_id', 'categoryData');
  console.log(req.query);
  const oneToManyFields = req.query._expand;
  const manyToManyFields = req.query._embed;
  
  const ledgers = await findWithRelation(
    record_coll,
    // @ts-ignore
    oneToManyFields,
    manyToManyFields
  );
  res.status(200).json(ledgers);
});

// GET certain data from database
router.get("/:id", async function (req, res) {
  const oneToManyFields = req.query._expand;
  const manyToManyFields = req.query._embed;
  const ledger = await findOneWithRelation(
    record_coll,
    req.params.id,
    // @ts-ignore
    oneToManyFields,
    manyToManyFields
  );
  res.status(200).json(ledger);
});

// Post the info
router.post(
  "/",
  validatePipe("body", RecordSchema),
  loginCheck(record_coll),
  async function (req, res) {
    const postData = {
      _id: await fetchNextId(record_coll.collectionName),
      // @ts-ignore
      userId: req.userId,
      ...req.body,
    };
    record_coll.insertOne(postData, function (err, result) {
      if (err) throw err;
      console.log("1 document inserted.");
      res.status(201).send(result.ops[0]);
    });
  }
);

// PUT to update certain row info
// router.put("/", validatePipe("body", RecordSchema), loginCheck(record_coll), function (req, res) {
//   // @ts-ignore
//   const putFilter = { _id: req.userId };
//   const putData = {
//     $set: { ...req.body, reviseDate: new Date().toISOString() },
//   };
//   record_coll.findOneAndUpdate(
//     putFilter,
//     putData,
//     { returnOriginal: false },
//     function (err, result) {
//       if (err) throw err;
//       console.log("1 document updated");
//       res.status(200).send(result.value);
//     }
//   );
// });

// PATCH to update certain row info
router.patch(
  "/:id",
  validatePipe("body", RecordSchema, { context: { partial: true } }),
  loginCheck(record_coll),
  function (req, res) {
    // @ts-ignore
    const patchFilter = { _id: req.params.id, userId: req.userId };
    const patchData = { $set: req.body };
    record_coll.findOneAndUpdate(
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
  var deleteFilter = { _id: req.params.id };
  record_coll.deleteOne(deleteFilter, (err, result) => {
    console.log(req.params.id, deleteFilter, result.result.n);
    res
      .status(200)
      .send("Delete row: " + req.params.id + " from db Successfully!");
  });
});

module.exports = router;
