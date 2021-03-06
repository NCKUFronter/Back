// @ts-check
const { collections, workInTransaction } = require("../models/mongo");
const { RecordSchema } = require("../models/record.model");
const validatePipe = require("../middleware/validate-pipe");
const loginCheck = require("../middleware/login-check");
const { getLedgerAuthGuard } = require("../middleware/auth-guard");
const { notification } = require("../actions");
const checkParamsIdExists = require("../middleware/check-params-id-exists");
const { findWithRelation, findOneWithRelation } = require("../actions");
const pointAction = require("../actions/point.actions");
const { removeRecord, updateRecord } = require("../actions/record.actions");
const router = require("express-promise-router").default();

const record_coll = collections.record;

// record 要考慮 pointActivity
// pointActivity 要考慮 user

// GET from database
router.get("/", async function (req, res) {
  // collRelation(record_coll, 'category', 'categoryId', '_id', 'categoryData');
  console.log(req.query);
  const { _one, _many, ...match } = req.query;
  const oneToManyFields = req.query._one;
  const manyToManyFields = req.query._many;

  const records = await findWithRelation(
    record_coll,
    match,
    // @ts-ignore
    oneToManyFields,
    manyToManyFields
  );
  res.status(200).json(records);
});

// GET certain data from database
router.get("/:id", loginCheck(record_coll), async function (req, res) {
  const oneToManyFields = req.query._one;
  const manyToManyFields = req.query._many;
  const record = await findOneWithRelation(
    record_coll,
    req.params.id,
    // @ts-ignore
    oneToManyFields,
    manyToManyFields
  );
  res.status(200).json(record);
});

// Post the info
router.post(
  "/",
  validatePipe("body", RecordSchema),
  loginCheck(record_coll),
  getLedgerAuthGuard((req) => req.convert_from_body.ledgerId),
  async function (req, res) {
    const postData = {
      // _id: await fetchNextId(record_coll.collectionName), // not need
      // @ts-ignore
      ...req.body,
      userId: req.userId,
      createDate: new Date()
    };
    const user = await collections.user.findOne({ _id: req.userId });
    const amount = Math.round(req.body.money / 100);

    await pointAction.pointsFromRecord("record", amount, postData, user);
    console.log("1 document inserted.");
    const ledger = req.convert_from_body.ledgerId;
    notification.send(
      req,
      {
        type: "record",
        action: "create",
        ledger,
      },
      ledger.userIds
    );
    res.status(201).json({ message: "Insert Success", rewardPoints: amount });
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
  checkParamsIdExists(collections.record),
  async function (req, res) {
    const record = req.convert_from_params.id;
    if (record.userId !== req.userId) return res.status(403).json("No access");

    await updateRecord(record, req.body);
    notification.sendToLedgerUsers(
      req,
      {
        type: "record",
        action: "update",
      },
      req.convert_from_params.id.ledgerId
    );
    res.status(200).json("success");
    // @ts-ignore
    /*
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
    */
  }
);

// DELETE certain row
router.delete(
  "/:id",
  loginCheck(record_coll),
  checkParamsIdExists(collections.record),
  async function (req, res) {
    const record = req.convert_from_params.id;
    if (record.userId !== req.userId) return res.status(403).json("No access");

    await removeRecord(record, req.userId);
    notification.sendToLedgerUsers(
      req,
      {
        type: "record",
        action: "delete",
      },
      req.convert_from_params.id.ledgerId
    );
    res.status(200).json("delete successs");
    /*
  var deleteFilter = { _id: req.params.id };
  record_coll.deleteOne(deleteFilter, (err, result) => {
    console.log(req.params.id, deleteFilter, result.result.n);
    res
      .status(200)
      .send("Delete row: " + req.params.id + " from db Successfully!");
  });
  */
  }
);

module.exports = router;
