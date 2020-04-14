// app init
var express = require('express');
var app = express();

// load static web main page
app.use(express.static(`${__dirname}`))
app.get('/', function (req, res) {
    res.send('Main page loading properly!');
});

// // GET from database 
// app.get('/record', function (req, res) {
//     db.serialize(function() {
//         db.all("SELECT rowid AS id, name, number FROM table01", [], (err, rows) => {
//             // send to index.js
//             res.send(rows);
//         });
//     });
// });

// POST into database
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use("/record",require("./routes/record"));

// app.post('/record', function (req, res) {
//     const postData = [req.body.name, req.body.number]
//     db.serialize(function() {
//         db.run("CREATE TABLE IF NOT EXISTS table01(name TEXT, number INTEGER)");
//         var postSQL = "INSERT INTO table01(name, number) VALUES(?,?)";
//         db.run(postSQL, postData);
//     });
//     res.send('Add name: ' + postData[0] +', number: '+ postData[1]+ ' into db Successfully!');
// });

// PUT to update certain row
// app.put('/record', function (req, res) {
//     db.serialize(function() {
//         const putData = [req.body.name, req.body.number, req.body.id]
//         console.log(putData);
//         db.run("UPDATE table01 SET name = ?, number = ? WHERE rowid = ?", putData);
//         db.all("SELECT rowid AS id, name, number FROM table01", [], (err, rows) => {
//             console.log(rows);
//         });
//         res.send('Got a PUT request at /record');
//     });
// });

// DELETE certain row
// app.delete('/record', function (req, res) {
//     db.serialize(function() {
//         db.run("DELETE FROM table01 WHERE rowid = ?", req.body.id);
//         db.all("SELECT rowid AS id, name, number FROM table01", [], (err, rows) => {
//             // console.log(rows);
//         });
//     });
//     res.send('Delete row: ' + req.body.id+ ' from db Successfully!');
// });

// Run the server
const port = 3000;
app.listen(port, function () {
    console.log(`Example app listening on port ${port}!`)
})

// Close the database
// Code here
