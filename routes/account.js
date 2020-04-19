var express = require("express")
var router = express.Router();
//var db = require('./models/db')
var client = require('../models/mongo')
client = client.client

router.get('/', function (req, res) {
    const collection = client.db("uidd-db").collection("account");
    collection.find({}).sort({ accountId: 1 }).toArray(function (err, result) {
        if (err) throw err;
        console.log('Success!')
        res.status(200).send(result);
    })
});

// GET certain data from database
router.get('/:id', function (req, res) {
    var id = req.params.id;
    const getData = {
        accountId: parseInt(id)
    };
    const collection = client.db("uidd-db").collection("account");
    collection.find(getData).toArray(function (err, result) {
        console.log(result);
        if (err) throw err;
        res.status(200).send(result);
    })
});

// Post the info
router.post('/', function (req, res) {
    const collection = client.db("uidd-db").collection("account");
    collection.countDocuments(function (err, count) {
        collection.find({}).sort({ accountId: 1 }).toArray(function (err, result) {
            const id = 0;
            if (count != 0) {
                id = result[count - 1].accountId;
            }
            const postData = {
                accountId: id + 1,              // sort
                account: req.body.account,
                password: req.body.password,
                username: req.body.username,
                family: req.body.family         // if user has no family?
            };
            collection.insertOne(postData, function (err, res) {
                if (err) throw err;
                console.log('1 document inserted.');
            })
            res.status(201).send('Add name: ' + postData['name'] + ', price: ' + postData['price'] + ' into db Successfully!');
        })
    })
});

// PUT to update certain row update info
router.put('/', function (req, res) {
    var putFilter = {
        accountId: req.body.id
    };
    var putData = {
        $set: {
            account: req.body.account,
            password: req.body.password,
            username: req.body.username,
            family: req.body.family
        }
    };
    const collection = client.db("uidd-db").collection("account");
    collection.updateOne(putFilter, putData, function (err, res) {
        if (err) throw err;
        console.log("1 document updated");
    })

    res.status(201).send('Got a PUT request at /account');
});

// DELETE certain row
router.delete('/:id', function (req, res) {
    var deleteFilter = {
        accountId: parseInt(req.params.id)
    };
    const collection = client.db("uidd-db").collection("account");
    collection.deleteOne(deleteFilter, (err, result) => {
        console.log(req.body.id, deleteFilter, result.result.n);
    })
    res.status(201).send('Delete row: ' + req.params.id + ' from db Successfully!');
});

module.exports = router;