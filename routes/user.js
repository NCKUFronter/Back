// @ts-check
const { fetchNextId, collections } = require("../models/mongo");
const { UserSchema } = require("../models/user.model");
const validatePipe = require("../middleware/validate-pipe");
const router = require("express").Router();

// 假設已經 connectDB
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

// GET certain data from database
router.get("/:id", function (req, res) {
  const getData = { _id: parseInt(req.params.id) };

  user_coll.find(getData).toArray(function (err, result) {
    if (err) throw err;
    res.status(200).send(result);
  });
});

// Post the info
router.post("/", validatePipe("body", UserSchema), async function (req, res) {
  const postData = {
    _id: await fetchNextId(user_coll.collectionName),
    ...req.body,
  };

  user_coll.insertOne(postData, function (err, result) {
    if (err) throw err;
    console.log("1 user info inserted.");
    res.status(201).send(result.ops[0]);
  });
  /*
  user_coll.countDocuments(function (err, count) {
    user_coll
      .find({})
      .sort({ userId: 1 })
      .toArray(function (err, result) {
        let id = 0;
        if (count != 0) {
          id = result[count - 1].userId;
        }
        const postData = {
          userId: id + 1,
          email: req.body.email,
          password: req.body.password,
          userName: req.body.userName,
          cardIds: req.body.cardIds,
          payback: req.body.payback,
          hashtags: req.body.hashtags,
        };
        user_coll.insertOne(postData, function (err, res) {
          if (err) throw err;
          console.log("1 user info inserted.");
        });
        res.status(201).send("Success!");
      });
  });
  */
});

// PUT to update certain row info
router.put("/:id", validatePipe("body", UserSchema), function (req, res) {
  const putFilter = { _id: parseInt(req.params.id) };
  const putData = {
    $set: {
      ...req.body,
      /*
      email: req.body.email,
      password: req.body.password,
      userName: req.body.userName,
      cardIds: req.body.cardIds,
      payback: req.body.payback,
      hashtags: req.body.hashtags,
      */
    },
  };

  user_coll.findOneAndUpdate(
    putFilter,
    putData,
    { returnOriginal: false },
    function (err, result) {
      if (err) throw err;
      console.log("1 document updated");
      res.status(200).send(result.value);
    }
  );
});

// PATCH to update certain row info
router.patch(
  "/:id",
  validatePipe("body", UserSchema, { context: { partial: true } }),
  function (req, res) {
    const patchFilter = { _id: parseInt(req.params.id, 10) };
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

// DELETE certain row
router.delete("/:id", function (req, res) {
  const deleteFilter = { _id: parseInt(req.params.id) };
  user_coll.deleteOne(deleteFilter, (err, result) => {
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