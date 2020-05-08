// @ts-check
const { fetchNextId, collections } = require("../models/mongo");
const { LedgerSchema } = require("../models/ledger.model");
const validatePipe = require("../middleware/validate-pipe");
const loginCheck = require("../middleware/login-check");
const { getLedgerAuthGuard } = require("../middleware/auth-guard");
const checkParamsIdExists = require("../middleware/check-params-id-exists");
const {
  findWithRelation,
  findOneWithRelation,
} = require("../actions/coll-relation");
const router = require("express").Router();

// 假設已經 connectDB
const ledger_coll = collections.ledger;
// GET from database
router.get(
  "/",
  // validatePipe("query", LedgerSchema, { context: { partial: true } }),
  async function (req, res) {
    console.log(req.query);
    const { _one, _many, ...match } = req.query;
    const oneToManyFields = req.query._one;
    const manyToManyFields = req.query._many;
    const ledgers = await findWithRelation(
      ledger_coll,
      match,
      // @ts-ignore
      oneToManyFields,
      manyToManyFields
    );
    res.status(200).json(ledgers);
  }
);

// GET certain data from database
router.get(
  "/:id",
  loginCheck(ledger_coll),
  getLedgerAuthGuard((req) => req.params.id),
  async function (req, res) {
    const oneToManyFields = req.query._one;
    const manyToManyFields = req.query._many;
    const ledger = await findOneWithRelation(
      ledger_coll,
      req.params.id,
      // @ts-ignore
      oneToManyFields,
      manyToManyFields
    );
    res.status(200).json(ledger);
  }
);

router.post(
  "/",
  validatePipe("body", LedgerSchema),
  loginCheck(ledger_coll),
  async function (req, res) {
    const postData = {
      _id: await fetchNextId(ledger_coll.collectionName),
      adminId: req.userId,
      userIds: [],
      ...req.body,
    };
    ledger_coll.insertOne(postData, function (err, result) {
      if (err) throw err;
      console.log("1 document inserted.");
      res.status(201).send(result.ops[0]);
    });
  }
);

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
  getLedgerAuthGuard((req) => req.params.id),
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

router.delete(
  "/:id",
  loginCheck(ledger_coll),
  checkParamsIdExists(collections.ledger),
  function (req, res) {
    if (req.userId !== req.convert_from_params.id.adminId)
      return res.status(403).json("No access");

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
  }
);

router.get(
  "/:id/records",
  loginCheck(ledger_coll),
  getLedgerAuthGuard((req) => req.params.id),
  async function (req, res) {
    const { _one, _many } = req.query;
    const records = await findWithRelation(
      collections.record,
      { ledgerId: req.params.id },
      _one,
      _many
    );
    res.status(200).json(records);
  }
);

router.get(
  "/:id/invitations",
  loginCheck(ledger_coll),
  getLedgerAuthGuard((req) => req.params.id),
  async function (req, res) {
    const { _one, _many } = req.query;
    const invitations = await findWithRelation(
      collections.invitation,
      { ledgerId: req.params.id },
      _one,
      _many
    );
    res.status(200).json(invitations);
  }
);

module.exports = router;
