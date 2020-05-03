// @ts-check
const { fetchNextId, collections } = require("../models/mongo");
const { UserSchema } = require("../models/user.model");
const validatePipe = require("../middleware/validate-pipe");
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

// router.post("/", validatePipe("body", UserSchema), async function (req, res) {
//   const postData = {
//     _id: await fetchNextId(user_coll.collectionName),
//     ...req.body,
//   };

//   user_coll.insertOne(postData, function (err, result) {
//     if (err) throw err;
//     console.log("1 user info inserted.");
//     res.status(201).send(result.ops[0]);
//   });
// });

// PUT to update certain row info
router.put("/", validatePipe("body", UserSchema), function (req, res) {
  if (req.isAuthenticated) {
    const putFilter = { _id: req.user[0]._id };
    const putData = {
      ...req.body,
    }
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
  }
  else {
    const putFilter = { _id: parseInt(req.params.id) };
    const putData = {
      ...req.body
    }
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
  }
});

// router.patch(
//   "/:id",
//   validatePipe("body", UserSchema, { context: { partial: true } }),
//   function (req, res) {
//     const patchFilter = { _id: parseInt(req.params.id, 10) };
//     const patchData = {
//       $set: req.body,
//     };
//     user_coll.findOneAndUpdate(
//       patchFilter,
//       patchData,
//       { returnOriginal: false },
//       function (err, result) {
//         if (err) throw err;
//         console.log("1 document updated");
//         res.status(200).send(result.value);
//       }
//     );
//   }
// );

router.delete("/", function (req, res) {
  if (req.isAuthenticated) {
    const deleteFilter = { _id: parseInt(req.user[0]._id) };
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
  }
});

module.exports = router;
