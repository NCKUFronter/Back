// sqlite3 db init
// const sqlite3 = require('sqlite3').verbose();

// let db = new sqlite3.Database('./test.db', (err) => {
//     if (err) {
//       console.error(err.message);
//     }
//     console.log('Connected to the test database!');
// });
require("dotenv").config();

// mongoDB init
const { ObjectId, MongoClient } = require("mongodb");

// const MongoClient = require("mongodb").MongoClient;
const uri = "mongodb+srv://uidd:1111@uidd-cluster-8k7z8.mongodb.net/uidd-db?retryWrites=true&w=majority";
const client = MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  if (err) throw err;
  console.log("DB connect successfully");
});

// app init
var express = require("express");
var cors = require("cors");
var app = express();

app.use(cors());

// load static web main page
const path = require("path");

app.use(express.static(path.join(__dirname, "front/spending-tracker")));
app.get("/", function (req, res) {
  res.send("Main page loading properly!");
});

// GET from database
app.get("/record", function (req, res) {
  const collection = client.db("uidd-db").collection("uidd");
  collection
    .find({})
    // .sort({ recordId: 1 })
    .toArray(function (err, result) {
      if (err) throw err;
      res.send(result);
    });
  //     db.serialize(function() {
  //         db.all("SELECT rowid AS id, name, number FROM table01", [], (err, rows) => {
  //             // send to index.js
  //             res.send(rows);
  //         });
  //     });
});

// POST into database
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/record", function (req, res) {
  const collection = client.db("uidd-db").collection("uidd");
  collection.countDocuments(function (err, count) {
    collection
      .find({})
      .sort({ recordId: 1 })
      .toArray(function (err, result) {
        let id = 0;
        if (count != 0) {
          id = result[count - 1].recordId;
        }
        /*
        const postData = {
            recordId: id+ 1,
            name: req.body.name,
            number: req.body.number
        };
        */
        const postData = {
          recordId: id + 1,
          recordType: req.body.recordType,
          money: req.body.money,
          ledger: req.body.ledger,
          categoryId: req.body.categoryId,
          date: req.body.date,
          detail: req.body.detail,
        };
        collection.insertOne(postData, function (err, res) {
          if (err) throw err;
          console.log("1 document inserted.");
        });
        res.send(
          "Add name: " +
            postData["name"] +
            ", number: " +
            postData["number"] +
            " into db Successfully!"
        );
      });
    // db.serialize(function() {
    //     db.run("CREATE TABLE IF NOT EXISTS table01(name TEXT, number INTEGER)");
    //     var postSQL = "INSERT INTO table01(name, number) VALUES(?,?)";
    //     db.run(postSQL, postData);
    // });
  });
});

// PUT to update certain row
app.put("/record/:id", function (req, res) {
  const putFilter = {
    // recordId: req.body.id,
    _id: req.params.id,
  };
  const putData = {
    $set: {
      name: req.body.name,
      number: req.body.number,
    },
  };
  const collection = client.db("uidd-db").collection("uidd");
  collection.updateOne(putFilter, putData, function (err, res) {
    if (err) throw err;
    console.log("1 document updated");
  });
  // db.serialize(function() {
  //     const putData = [req.body.name, req.body.number, req.body.id]
  //     console.log(putData);
  //     db.run("UPDATE table01 SET name = ?, number = ? WHERE rowid = ?", putData);
  //     db.all("SELECT rowid AS id, name, number FROM table01", [], (err, rows) => {
  //         console.log(rows);
  //     });
  // });
  res.send("Got a PUT request at /record");
});

// DELETE certain row
app.delete("/record/:id", function (req, res) {
  const deleteFilter = {
    // recordId: req.body.id,

    // refer:
    // https://stackoverflow.com/questions/4932928/remove-by-id-in-mongodb-console
    _id: ObjectId(req.params.id),
  };
  const collection = client.db("uidd-db").collection("uidd");
  collection.deleteOne(deleteFilter, (err, result) => {
    if (err) res.send(err);

    console.log(req.body.id, deleteFilter, result.result.n);
    res.send("Delete row: " + req.body.id + " from db Successfully!");
  });
  // db.serialize(function() {
  //     db.run("DELETE FROM table01 WHERE rowid = ?", req.body.id);
  //     db.all("SELECT rowid AS id, name, number FROM table01", [], (err, rows) => {
  //         // console.log(rows);
  //     });
  // });
  // res.send('Delete row: ' + req.body.id+ ' from db Successfully!');
});

// Run the server
const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});

// Close the database
// Code here
