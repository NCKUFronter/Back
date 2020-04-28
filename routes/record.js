// @ts-check
const { collections, fetchNextId } = require("../models/mongo");
const { RecordSchema } = require("../models/record.model");
const validatePipe = require("../middleware/validate-pipe");
const router = require("express").Router();

// 假設已經 connectDB
const record_coll = collections.record;

// GET from database
router.get("/", function (req, res) {
    record_coll.find(req.query).toArray(function (err, result) {
      if (err) throw err;
      res.status(200).send(result);
    });
    /*
    if (req.query.recordType) {
      const getData = {
        recordType: req.query.recordType,
      };

    record_coll.find(getData).toArray(function (err, result) {
      if (err) throw err;
      res.status(200).send(result);
    });
    } else {
    record_coll
      .find()
      .sort({ recordId: 1 })
      .toArray(function (err, result) {
        if (err) throw err;
        res.status(200).send(result);
      });
    }
      */
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
  // res.send({ _id: 0, ...req.body });
  const postData = {
    _id: await fetchNextId(record_coll.collectionName),
    ...req.body,
  };

  record_coll.insertOne(postData, function (err, result) {
    if (err) throw err;
    console.log("1 document inserted.");
    res.status(201).send(result.ops[0]);
  });
  /*
  record_coll.countDocuments(function (err, count) {
    record_coll
      .find({})
      .sort({ recordId: 1 })
      .toArray(function (err, result) {
        var id = 0;
        if (count != 0) {
          id = result[count - 1].recordId;
        }
        const postData = {
          recordId: id + 1,
          recordType: req.body.recordType,
          money: req.body.money,
          ledger: req.body.ledger,
          date: req.body.date,
          reviseDate: req.body.reviseDate,
          hashtag: req.body.hashtag,
          userId: req.body.userId,
          payback: req.body.payback,
          from: req.body.from,
          categoryId: req.body.categoryId,
          detail: req.body.detail,
        };
        record_coll.insertOne(postData, function (err, res) {
          if (err) throw err;
          console.log("1 document inserted.");
        });
        res
          .status(201)
          .send(
            "Add Category: " +
              postData["category"] +
              ", money: " +
              postData["money"] +
              " into db Successfully!"
          );
      });
  });
  */
});

// PUT to update certain row info
router.put("/:id", validatePipe("body", RecordSchema), function (req, res) {
  const putFilter = { _id: parseInt(req.params.id, 10) };
  const putData = {
    $set: { ...req.body, reviseDate: new Date().toISOString() },
  };
  /*
  const putData = {
    $set: {
      recordType: req.body.recordType,
      money: req.body.money,
      ledger: req.body.ledger,
      date: req.body.date,
      reviseDate: req.body.reviseDate,
      hashtag: req.body.hashtag,
      userId: req.body.userId,
      payback: req.body.payback,
      from: req.body.from,
      categoryId: req.body.categoryId,
      detail: req.body.detail,
    },
  };
  */
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
