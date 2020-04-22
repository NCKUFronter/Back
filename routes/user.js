var express = require("express")
var router = express.Router();

var client = require('../models/mongo')
client = client.client

// GET from database 
router.get('/', function (req, res) {
    const collection = client.db("uidd-db").collection("user");
    collection.find().sort({ userId: 1 }).toArray(function (err, result) {
        if (err) throw err;
        res.status(200).send(result);
    })
});

// GET certain data from database
router.get('/:id', function (req, res) {
    var userId = req.params.id;
    const getData = {
        userId: parseInt(userId)
    };
    const collection = client.db("uidd-db").collection("user");
    collection.find(getData).toArray(function (err, result) {
        if (err) throw err;
        res.status(200).send(result);
    })
});

// Post the info
router.post('/', function (req, res) {
    const collection = client.db("uidd-db").collection("user");
    collection.countDocuments(function (err, count) {
        collection.find({}).sort({ userId: 1 }).toArray(function (err, result) {
            var id = 0;
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
                hashtags: req.body.hashtags
            };
            collection.insertOne(postData, function (err, res) {
                if (err) throw err;
                console.log('1 user info inserted.');
            })
            res.status(201).send('Success!');
        })
    })
});

// PUT to update certain row info
router.put('/', function (req, res) {
    var putFilter = {
        userId: req.body.userId
    };
    var putData = {
        $set: {
            email: req.body.email,
            password: req.body.password,
            userName: req.body.userName,
            cardIds: req.body.cardIds,
            payback: req.body.payback,
            hashtags: req.body.hashtags
        }
    };
    const collection = client.db("uidd-db").collection("user");
    collection.updateOne(putFilter, putData, function (err, res) {
        if (err) throw err;
        console.log("1 document updated");
    })
    res.status(201).send('Got a PUT request at /user');
});

// DELETE certain row
router.delete('/:id', function (req, res) {
    var deleteFilter = {
        userId: parseInt(req.params.id)
    };
    const collection = client.db("uidd-db").collection("user");
    collection.deleteOne(deleteFilter, (err, result) => {
        console.log('Delete row: '+ req.params.id+ ' with filter: '+ deleteFilter+ '. Deleted: '+ result.result.n);
    })
    res.status(201).send('Delete row: ' + req.params.id + ' from db Successfully!');
});

module.exports = router;