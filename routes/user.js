// @ts-check
const { fetchNextId, collections } = require("../models/mongo");
const { UserSchema } = require("../models/user.model");
const validatePipe = require("../middleware/validate-pipe");
const loginCheck = require("../middleware/login-check");
const {
  userLedgers,
  userInvitations,
  userPointActivities,
} = require("../actions/user.actions");
const router = require("express").Router();

const user_coll = collections.user;

// GET from database
router.get(
  "/",
  validatePipe("query", UserSchema, { context: { partial: true } }),
  function (req, res) {
    user_coll
      .find(req.query)
      // .sort({ userId: 1 })
      .toArray(function (err, result) {
        if (err) throw err;
        res.status(200).send(result);
      });
  }
);

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
  const ledgers = await userLedgers(req.userId);
  res.status(200).json(ledgers);
});

router.get("/invitations", loginCheck(user_coll), async function (req, res) {
  const invitations = await userInvitations(req.userId);
  res.status(200).json(invitations);
});

router.get("/pointActivities", loginCheck(user_coll), async function (req, res) {
  const activities = await userPointActivities(req.userId);
  res.status(200).json(activities);
});

module.exports = router;
