var express = require("express")
var router = express.Router();

var client = require('../models/mongo')
client = client.client

// GET from database 
router.get('/', function (req, res) {
    if (req.query.recordType) {
        const getData = {
            recordType: req.query.recordType
        };
        const collection = client.db("uidd-db").collection("uidd");
        collection.find(getData).toArray(function (err, result) {
            if (err) throw err;
            res.status(200).send(result);
        })
    }
    else {
        const collection = client.db("uidd-db").collection("uidd");
        collection.find().sort({ recordId: 1 }).toArray(function (err, result) {
            if (err) throw err;
            res.status(200).send(result);
        })
    }
    
});

// GET certain data from database
router.get('/:id', function (req, res) {
    var id = req.params.id;
    const getData = {
        recordId: parseInt(id)
    };
    const collection = client.db("uidd-db").collection("uidd");
    collection.find(getData).toArray(function (err, result) {
        if (err) throw err;
        res.status(200).send(result);
    })
});

// Post the info
router.post('/', function (req, res) {
    const collection = client.db("uidd-db").collection("uidd");
    collection.countDocuments(function (err, count) {
        collection.find({}).sort({ recordId: 1 }).toArray(function (err, result) {
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
                detail: req.body.detail
            };
            collection.insertOne(postData, function (err, res) {
                if (err) throw err;
                console.log('1 document inserted.');
            })
            res.status(201).send('Add Category: ' + postData['category'] + ', money: ' + postData['money'] + ' into db Successfully!');
        })
    })
});

// PUT to update certain row info
router.put('/', function (req, res) {
    var putFilter = {
        recordId: req.body.recordId
    };
    var putData = {
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
            detail: req.body.detail
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
router.delete('/:id', function (req, res) {
    var deleteFilter = {
        recordId: parseInt(req.params.id)
    };
    const collection = client.db("uidd-db").collection("uidd");
    collection.deleteOne(deleteFilter, (err, result) => {
        console.log(req.params.id, deleteFilter, result.result.n);
    })
    res.status(201).send('Delete row: ' + req.params.id + ' from db Successfully!');
});

module.exports = router;