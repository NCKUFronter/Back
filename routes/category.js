var express = require("express")
var router = express.Router();

var client = require('../models/mongo')
client = client.client

// GET from database 
router.get('/', function (req, res) {
    const collection = client.db("uidd-db").collection("category");
    collection.find().sort({ categoryId: 1 }).toArray(function (err, result) {
        if (err) throw err;
        res.status(200).send(result);
    })
});

// GET certain data from database
router.get('/:id', function (req, res) {
    var categoryId = req.params.id;
    const getData = {
        categoryId: parseInt(categoryId)
    };
    const collection = client.db("uidd-db").collection("category");
    collection.find(getData).toArray(function (err, result) {
        if (err) throw err;
        res.status(200).send(result);
    })
});

// Post the info
router.post('/', function (req, res) {
    const collection = client.db("uidd-db").collection("category");
    collection.countDocuments(function (err, count) {
        collection.find({}).sort({ categoryId: 1 }).toArray(function (err, result) {
            var id = 0;
            if (count != 0) {
                id = result[count - 1].categoryId;
            }
            const postData = {
                categoryId: id + 1,
                categoryName: req.body.categoryName
            };
            collection.insertOne(postData, function (err, res) {
                if (err) throw err;
                console.log('1 category info inserted.');
            })
            res.status(201).send('Success!');
        })
    })
});

// PUT to update certain row info
router.put('/', function (req, res) {
    var putFilter = {
        categoryId: req.body.categoryId
    };
    var putData = {
        $set: {
            categoryName: req.body.categoryName
        }
    };
    const collection = client.db("uidd-db").collection("category");
    collection.updateOne(putFilter, putData, function (err, res) {
        if (err) throw err;
        console.log("1 document updated");
    })
    res.status(201).send('Got a PUT request at /category');
});

// DELETE certain row
router.delete('/:id', function (req, res) {
    var deleteFilter = {
        categoryId: parseInt(req.params.id)
    };
    const collection = client.db("uidd-db").collection("category");
    collection.deleteOne(deleteFilter, (err, result) => {
        console.log('Delete row: '+ req.params.id+ ' with filter: '+ deleteFilter+ '. Deleted: '+ result.result.n);
    })
    res.status(201).send('Delete row: ' + req.params.id + ' from db Successfully!');
});

module.exports = router;