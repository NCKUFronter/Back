// @ts-check
const { collections, fetchNextId } = require("../models/mongo");
const { RecordSchema } = require("../models/record.model");
const validatePipe = require("../middleware/validate-pipe");
const router = require("express").Router();

const record_coll = collections.record;

// GET from database
router.get("/",
  function (req, res) {
    record_coll.aggregate([
      { $lookup: { from: 'category', localField: "categoryId", foreignField: "_id", as: "categoryData" } }
      ]).toArray((err, result) => {
        if (result) {
        }
        console.log(result);
      })
    console.log(req.user);
  }
);

// GET certain data from database
router.get("/:id", function (req, res) {
  
  const getData = {
    // recordId: parseInt(id),
    _id: parseInt(req.params.id, 10),
  };
  
  record_coll.findOne(getData, function (err, result) {
    if (err) throw err;
    res.status(200).send(result);
  });
});

// Post the info
router.post("/", validatePipe("body", RecordSchema), async function (req, res) {
  if (req.isAuthenticated) {
    const postData = {
      _id: await fetchNextId(record_coll.collectionName),
      userId: req.user[0]._id,
      ...req.body,
    }
    record_coll.insertOne(postData, function (err, result) {
      if (err) throw err;
      console.log("1 document inserted.");
      res.status(201).send(result.ops[0]);
    });
  }
  else {
    const postData = {
      _id: await fetchNextId(record_coll.collectionName),
      userId: null,
      ...req.body
    }
    record_coll.insertOne(postData, function (err, result) {
      if (err) throw err;
      console.log("1 document inserted.");
      res.status(201).send(result.ops[0]);
    });
  }
});

// PUT to update certain row info
router.put("/:id", validatePipe("body", RecordSchema), function (req, res) {
  const putFilter = { _id: parseInt(req.params.id, 10) };
  const putData = {
    $set: { ...req.body, reviseDate: new Date().toISOString() },
  };
  record_coll.findOneAndUpdate(
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
  validatePipe("body", RecordSchema, { context: { partial: true } }),
  function (req, res) {
    const patchFilter = { _id: parseInt(req.params.id, 10) };
    const patchData = { $set: req.body };
    record_coll.findOneAndUpdate(
      patchFilter,
      patchData,
      { returnOriginal: false },
      function (err, result) {
        if (err) throw err;
        console.log("1 document updated");
        res.status(200).send(result.value);
    });
  }
);

// DELETE certain row
router.delete("/:id", function (req, res) {
  var deleteFilter = { _id: parseInt(req.params.id, 10) };
  record_coll.deleteOne(deleteFilter, (err, result) => {
    console.log(req.params.id, deleteFilter, result.result.n);
    res
      .status(200)
      .send("Delete row: " + req.params.id + " from db Successfully!");
  });
});

module.exports = router;
