// @ts-check
const { collections, fetchNextId } = require("../models/mongo");
const { CategorySchema } = require("../models/category.model");
const validatePipe = require("../middleware/validate-pipe");
const router = require("express").Router();

// 假設已經 connectDB
const category_coll = collections.category;

// GET from database
router.get(
  "/",
  function (req, res) {
    console.log({ session: req.session, user: req.user });
    category_coll
      .find(req.query)
      // .sort({ categoryId: 1 })
      .toArray(function (err, result) {
        if (err) throw err;
        res.status(200).send(result);
      });
  }
);

// GET certain data from database
router.get("/:id", function (req, res) {
  const getData = { _id: req.params.id };
  category_coll.findOne(getData, function (err, result) {
    if (err) throw err;
    res.status(200).send(result);
  });
});

// Post the info
router.post("/", validatePipe("body", CategorySchema), async function (
  req,
  res
) {
  const postData = {
    _id: await fetchNextId(category_coll.collectionName),
    ...req.body,
  };
  category_coll.insertOne(postData, function (err, result) {
    if (err) throw err;
    console.log("1 category info inserted.");
    res.status(201).send(result.ops[0]);
  });

  /*
  category_coll.countDocuments(function (err, count) {
    category_coll
      .find({})
      .sort({ categoryId: 1 })
      .toArray(function (err, result) {
        let id = 0;
        if (count != 0) {
          id = result[count - 1].categoryId;
        }
        const postData = {
          categoryId: id + 1,
          categoryName: req.body.categoryName,
        };
      });
  });
  */
});

// PUT to update certain row info
router.put("/:id", validatePipe("body", CategorySchema), function (req, res) {
  const putFilter = {
    _id: req.params.id,
  };
  const putData = {
    $set: req.body,
  };

  category_coll.findOneAndUpdate(
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
  validatePipe("body", CategorySchema, { context: { partial: true } }),
  function (req, res) {
    const patchFilter = { _id: req.params.id };
    const patchData = {
      $set: req.body,
    };

    category_coll.findOneAndUpdate(
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
  const deleteFilter = {
    _id: req.params.id,
  };
  category_coll.deleteOne(deleteFilter, (err, result) => {
    console.log(
      `Delete row: ${req.params.id} with filter: ${deleteFilter}. Deleted: ${result.result.n}`
    );
    res
      .status(200)
      .send("Delete row: " + req.params.id + " from db Successfully!");
  });
});

module.exports = router;
