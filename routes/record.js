var express = require("express")
var router = express.Router();
//var db = require('./models/db')
var client = require('../models/mongo')
client = client.client



// GET from database 
router.get('/', function (req, res) {
    const collection = client.db("uidd-db").collection("uidd");
    collection.find({}).sort({ recordId: 1 }).toArray(function (err, result) {
        if (err) throw err;
        res.status(200).send(result);
    })
});

// Post the info
router.post('/', function (req, res) {
    const collection = client.db("uidd-db").collection("uidd");
    collection.countDocuments(function (err, count) {
        collection.find({}).sort({ recordId: 1 }).toArray(function (err, result) {
            const id = 0;
            if (count != 0) {
                id = result[count - 1].recordId;
            }
            const postData = {
                recordId: id + 1,
                name: req.body.name,
                number: req.body.number
            };
            collection.insertOne(postData, function (err, res) {
                if (err) throw err;
                console.log('1 document inserted.');
            })
            res.status(201).send('Add name: ' + postData['name'] + ', number: ' + postData['number'] + ' into db Successfully!');
        })
    })
});

// PUT to update certain row update info
router.put('/', function (req, res) {
    var putFilter = {
        recordId: req.body.id
    };
    var putData = {
        $set: {
            name: req.body.name,
            number: req.body.number
        }
    };
    const collection = client.db("uidd-db").collection("uidd");
    collection.updateOne(putFilter, putData, function (err, res) {
        if (err) throw err;
        console.log("1 document updated");
    })

    res.status(201).send('Got a PUT request at /record');
});

// DELETE certain row
router.delete('/', function (req, res) {
    var deleteFilter = {
        recordId: req.body.id
    };
    const collection = client.db("uidd-db").collection("uidd");
    collection.deleteOne(deleteFilter, (err, result) => {
        console.log(req.body.id, deleteFilter, result.result.n);
    })
    res.status(201).send('Delete row: ' + req.body.id + ' from db Successfully!');
});

module.exports = router;