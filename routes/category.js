// @ts-check
const {
  collections,
  fetchNextId,
  simpleInsertOne,
  workInTransaction,
} = require("../models/mongo");
const { CategorySchema } = require("../models/category.model");
const checkParamsIdExists = require("../middleware/check-params-id-exists");
const validatePipe = require("../middleware/validate-pipe");
const loginCheck = require("../middleware/login-check");
const router = require("express").Router();

// 假設已經 connectDB
const category_coll = collections.category;

// GET from database
router.get("/", function (req, res) {
  category_coll
    .find(req.query)
    // .sort({ categoryId: 1 })
    .toArray(function (err, result) {
      if (err) throw err;
      res.status(200).send(result);
    });
});

// GET certain data from database
router.get("/:id", function (req, res) {
  const getData = { _id: req.params.id };
  category_coll.findOne(getData, function (err, result) {
    if (err) throw err;
    res.status(200).send(result);
  });
});

// Post the info
router.post(
  "/",
  validatePipe("body", CategorySchema),
  loginCheck(category_coll),
  async function (req, res) {
    /*
    const postData = {
      _id: await fetchNextId(category_coll.collectionName),
      ...req.body,
    };

    category_coll.insertOne(postData, function (err, result) {
      if (err) throw err;
      console.log("1 category info inserted.");
      res.status(201).send(result.ops[0]);
    });
    */
    workInTransaction(async (session) => {
      const { hashtags, ...cate_dto } = req.body;
      cate_dto.userId = req.userId;
      const result = await simpleInsertOne(
        collections.category,
        cate_dto,
        session
      );

      if (req.body.hashtags) {
        await collections.user.updateOne(
          { _id: req.userId },
          { $set: { [`categoryTags.${result.insertedId}`]: req.body.hashtags } }
        );
      }
      res.status(201).json(result.ops[0]);
    });
  }
);

// PUT to update certain row info
/*
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
*/

// PATCH to update certain row info
router.patch(
  "/:id",
  validatePipe("body", CategorySchema, { context: { partial: true } }),
  loginCheck(category_coll),
  checkParamsIdExists(category_coll),
  function (req, res) {
    const category = req.convert_from_params.id;
    if (
      category.userId == null &&
      req.body.name != null &&
      req.body.name != category.name
    ) {
      return res.status(403).json("Cannot rename default category");
    }

    if (category.userId != null && category.userId !== req.userId)
      return res.status(403).json("No access");

    workInTransaction(async (session) => {
      const { hashtags, ...cate_dto } = req.body;
      if (Object.keys(cate_dto).length !== 0) {
        await collections.category.updateOne(
          { _id: req.params.id },
          { $set: cate_dto },
          { session }
        );
      }

      if (req.body.hashtags) {
        await collections.user.updateOne(
          { _id: req.userId },
          { $set: { [`categoryTags.${req.params.id}`]: hashtags } },
          { session }
        );
      }

      res.status(200).json("update success");
    });

    /*
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
    */
  }
);

// DELETE certain row
router.delete(
  "/:id",
  loginCheck(category_coll),
  checkParamsIdExists(category_coll),
  async function (req, res) {
    const category = req.convert_from_params.id;
    if (category.userId !== req.userId)
      return res.status(403).json("No access");

    await workInTransaction(async (session) => {
      const cate_prom = collections.category.deleteOne(
        { _id: req.params.id },
        { session }
      );
      const user_prom = collections.user.updateOne(
        { _id: req.userId },
        { $unset: { [`categoryTags.${req.params.id}`]: "" } },
        { session }
      );
      await Promise.all([cate_prom, user_prom]);
    });
    res
      .status(200)
      .json("Delete row: " + req.params.id + " from db Successfully!");

    /*
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
    */
  }
);

module.exports = router;
