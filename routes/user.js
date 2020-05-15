// @ts-check
const { fetchNextId, collections } = require("../models/mongo");
const { UserSchema } = require("../models/user.model");
const validatePipe = require("../middleware/validate-pipe");
const loginCheck = require("../middleware/login-check");
const { findWithRelation } = require("../actions");
const {
  userLedgers,
  userInvitations,
  userPointActivities,
} = require("../actions/user.actions");
const router = require("express").Router();

const user_coll = collections.user;

// GET from database
router.get("/", function (req, res) {
  user_coll
    .find(req.query)
    // .sort({ userId: 1 })
    .toArray(function (err, result) {
      if (err) throw err;
      res.status(200).send(result);
    });
});

// 此部份會與其他路徑相沖
// router.get("/:id", function (req, res) {
//   const getData = { _id: parseInt(req.params.id) };

//   user_coll.find(getData).toArray(function (err, result) {
//     if (err) throw err;
//     res.status(200).send(result);
//   });
// });

router.post(
  "/",
  validatePipe("body", UserSchema),
  loginCheck(user_coll),
  async function (req, res) {
    const postData = {
      _id: await fetchNextId(user_coll.collectionName),
      // @ts-ignore
      userId: req.userId,
      ...req.body,
    };

    user_coll.insertOne(postData, function (err, result) {
      if (err) throw err;
      console.log("1 user info inserted.");
      res.status(201).send(result.ops[0]);
    });
  }
);

// router.put("/", validatePipe("body", UserSchema), loginCheck(user_coll),
//  function (req, res) {
//   // @ts-ignore
//   const putFilter = { _id: req.userId };
//   const putData = {
//     $set: {...req.body}
//   }
//   user_coll.findOneAndUpdate(
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

router.patch(
  "/",
  validatePipe("body", UserSchema, { context: { partial: true } }),
  loginCheck(user_coll),
  function (req, res) {
    // @ts-ignore
    const patchFilter = { _id: req.userId };
    const patchData = {
      $set: req.body,
    };
    user_coll.findOneAndUpdate(
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

router.delete("/", loginCheck(user_coll), function (req, res) {
  // @ts-ignore
  const deleteFilter = { _id: req.userId };
  user_coll.deleteOne(deleteFilter, (err, result) => {
    console.log(
      "Delete row: " +
        req.params.id +
        " with filter: " +
        deleteFilter +
        ". Deleted: " +
        result.result.n
    );
    res.status(200).send("Delete from db Successfully!");
  });
});

router.get("/profile", loginCheck(user_coll), function (req, res) {
  // @ts-ignore
  const { password, ...user_rest } = req.user;
  res.status(200).json(user_rest);
});

router.get("/ledgers", loginCheck(user_coll), async function (req, res) {
  // const ledgers = await userLedgers(req.userId);
  const { _one, _many, ...match } = req.query;
  const ledgers = await findWithRelation(
    collections.ledger,
    {
      $or: [
        { ...match, userIds: req.userId },
        { ...match, adminId: req.userId },
      ],
    },
    _one,
    _many
  );
  res.status(200).json(ledgers);
});

router.get("/invitations", loginCheck(user_coll), async function (req, res) {
  // const invitations = await userInvitations(req.userId);
  const { _one, _many } = req.query;
  const invitations = await findWithRelation(
    collections.invitation,
    { toUserId: req.userId, type: 2 },
    _one,
    _many
  );
  res.status(200).json(invitations);
});

router.get("/pointActivities", loginCheck(user_coll), async function (
  req,
  res
) {
  // const activities = await userPointActivities(req.userId);
  const { _one, _many, ...match } = req.query;
  const activities = await findWithRelation(
    collections.pointActivity,
    {
      $or: [
        { ...match, fromUserId: req.userId },
        { ...match, toUserId: req.userId },
      ],
    },
    _one,
    _many
  );
  res.status(200).json(activities);
});

router.get("/relativeUsers", loginCheck(user_coll), async function (req, res) {
  // reference:
  // https://stackoverflow.com/questions/42291965/setunion-to-merge-array-from-multiple-documents-mongodb
  const results = await collections.ledger
    .aggregate([
      { $match: { $or: [{ userIds: req.userId }, { adminId: req.userId }] } },
      {
        $lookup: {
          from: "user",
          foreignField: "_id",
          localField: "userIds",
          as: "users",
        },
      },
      { $group: { _id: 0, user: { $push: "$users" } } },
      {
        $project: {
          users: {
            $reduce: {
              input: "$user",
              initialValue: [],
              in: { $setUnion: ["$$value", "$$this"] },
            },
          },
        },
      },
    ])
    .toArray();
  const users = results[0].users;
  for (let i = 0; i < users.length; i++) {
    if (users[i]._id === req.userId) {
      users.splice(i, 1);
      break;
    }
  }
  /** @type {any[]} */
  res.status(200).json(users);
});

router.get("/categories", loginCheck(user_coll), async (req, res) => {
  const categories = await collections.category
    .find({
      $or: [{ userId: null }, { userId: req.userId }],
    })
    .toArray();
  if (req.user.categoryTags) {
    for (const category of categories) {
      category.hashtags = req.user.categoryTags[category._id];
    }
  }
  res.status(200).json(categories);
});

router.get("/ledgers/records", loginCheck(user_coll), async (req, res) => {
  const ledgersWithRecords = await collections.ledger
    .aggregate([
      { $match: { $or: [{ adminId: "1" }, { userIds: "1" }] } },
      {
        $lookup: {
          from: "record",
          foreignField: "ledgerId",
          localField: "_id",
          as: "records",
        },
      },
      { $unwind: { path: "$records", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "user",
          foreignField: "_id",
          localField: "records.userId",
          as: "records.user",
        },
      },
      { $unwind: { path: "$records.user", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "category",
          foreignField: "_id",
          localField: "records.categoryId",
          as: "records.category",
        },
      },
      {
        $unwind: {
          path: "$records.category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          ledgerName: { $first: "$ledgerName" },
          userIds: { $first: "$userIds" },
          records: { $push: "$records" },
        },
      },
      {
        $lookup: {
          from: "user",
          foreignField: "_id",
          localField: "userIds",
          as: "users",
        },
      },
    ])
    .toArray();
  res.status(200).json(ledgersWithRecords);
});

module.exports = router;
