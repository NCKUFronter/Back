var express = require("express")
var router = express.Router();
//var db = require('../models/db')

// db init
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./test.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    else
        console.log('Connected to the test database!');
});

router.get('/', (req, res)=>{
    db.serialize(function() {
        db.all("SELECT rowid AS id, name, number FROM table01", [], (err, rows) => {
            // send to index.js
            res.status(200).send(rows);
        });
    });
});

router.post('/', (req, res)=>{
    const postData = [req.body.name, req.body.number]
    db.serialize(function() {
        db.run("CREATE TABLE IF NOT EXISTS table01(name TEXT, number INTEGER)");
        var postSQL = "INSERT INTO table01(name, number) VALUES(?,?)";
        db.run(postSQL, postData);
    });
    res.status(201).send('Add name: ' + postData[0] +', number: '+ postData[1]+ ' into db Successfully!');
});

router.put('/',(req, res)=>{
    db.serialize(function() {
        const putData = [req.body.name, req.body.number, req.body.id]
        console.log(putData);
        db.run("UPDATE table01 SET name = ?, number = ? WHERE rowid = ?", putData);
        db.all("SELECT rowid AS id, name, number FROM table01", [], (err, rows) => {
            console.log(rows);
        });
        res.status(201).send('Got a PUT request at /record');
    });
});

router.delete('/',(req, res)=>{
    db.serialize(function() {
        db.run("DELETE FROM table01 WHERE rowid = ?", req.body.id);
        db.all("SELECT rowid AS id, name, number FROM table01", [], (err, rows) => {
            // console.log(rows);
        });
    });
    res.send('Delete row: ' + req.body.id+ ' from db Successfully!');
});

module.exports = router;