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
const { notification } = require("../actions/notification.service");
const router = require("express").Router();
const fs = require("fs");
const path = require("path");

// 假設已經 connectDB
const ledger_coll = collections.ledger;

function makeImagePath(photo) {
  const ext = photo.name.slice(photo.name.lastIndexOf("."));
  return `/img/user-ledger/ledger-${Date.now()}${ext}`;
}

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
    let upPhoto = req.files && req.files.upPhoto;
    if (req.body.photo == null && upPhoto == null)
      return res.status(400).json("Must specify photo!!");

    const postData = {
      _id: await fetchNextId(ledger_coll.collectionName),
      adminId: req.userId,
      userIds: [req.userId],
      ...req.body,
    };

    if (upPhoto) {
      if (Array.isArray(upPhoto)) upPhoto = upPhoto[0];
      const img_path = makeImagePath(upPhoto);
      await upPhoto.mv(path.resolve("." + img_path));
      postData.photo = img_path;
    }

    ledger_coll.insertOne(postData, function (err, result) {
      if (err) throw err;
      console.log("1 document inserted.");

      notification.send(
        req,
        {
          type: "ledger",
          action: "create",
          body: req.body,
        },
        [req.userId]
      );
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
  checkParamsIdExists(collections.ledger),
  getLedgerAuthGuard((req) => req.convert_from_params.id),
  async function (req, res) {
    // @ts-ignore
    const ledger = req.convert_from_params.id;
    const patchFilter = { _id: req.params.id, adminId: req.userId };
    const patchData = req.body;

    let upPhoto = req.files && req.files.upPhoto;
    if (Object.keys(req.body).length == 0 && upPhoto == null)
      return res.status(400).json("Must specify body!!");

    if (req.files && req.files.upPhoto) {
      let photo = req.files.upPhoto;
      if (Array.isArray(photo)) photo = photo[0];
      const img_path = makeImagePath(photo);
      await photo.mv(path.resolve("." + img_path));
      patchData.photo = img_path;
    }

    ledger_coll.findOneAndUpdate(
      patchFilter,
      { $set: patchData },
      { returnOriginal: false },
      function (err, result) {
        if (err) throw err;
        console.log("1 document updated");

        const ledger = req.convert_from_params.id;
        notification.send(
          req,
          {
            type: "ledger",
            action: "update",
            ledger,
          },
          ledger.userIds
        );

        if (ledger.photo && ledger.photo.startsWith("/img/user-ledger")) {
          fs.unlink(path.resolve("." + ledger.photo), function (err) {
            console.log(err);
          });
        }

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

      const ledger = req.convert_from_params.id;
      notification.send(
        req,
        {
          type: "ledger",
          action: "delete",
          ledger: ledger,
        },
        ledger.userIds
      );

      if (ledger.photo && ledger.photo.startsWith("/img/user-ledger")) {
        fs.unlink(path.resolve("." +ledger.photo), function (err) {
          console.log(err);
        });
      }

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

router.post(
  "/:id/leave",
  loginCheck(ledger_coll),
  checkParamsIdExists(collections.ledger),
  getLedgerAuthGuard((req) => req.convert_from_params.id),
  async function (req, res) {
    if (req.convert_from_params.id.adminId === req.userId)
      return res.status(400).json("Admin cannot leave ledger");

    await collections.ledger.updateOne(
      { _id: req.params.id },
      { $pull: { userIds: req.userId } }
    );
    const ledger = req.convert_from_params.id;
    notification.send(
      req,
      {
        type: "ledger",
        action: "leave",
        ledger,
      },
      ledger.userIds
    );
    res.status(200).json("success");
  }
);

router.post(
  "/:id/leave/:userId",
  loginCheck(ledger_coll),
  checkParamsIdExists(collections.ledger),
  checkParamsIdExists(collections.user, "userId"),
  getLedgerAuthGuard((req) => req.convert_from_params.id),
  async function (req, res) {
    if (req.convert_from_params.id.adminId !== req.userId)
      return res.status(403).json("Only admin can make people leave ledger");

    if (req.params.userId === req.userId)
      return res.status(400).json("Admin cannot leave ledger");

    await collections.ledger.updateOne(
      { _id: req.params.id },
      { $pull: { userIds: req.params.userId } }
    );

    const ledger = req.convert_from_params.id;
    notification.send(
      req,
      {
        type: "ledger",
        action: "kickout",
        to: req.convert_from_params.userId,
        ledger,
      },
      ledger.userIds
    );
    res.status(200).json("success");
  }
);

module.exports = router;
