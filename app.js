// sqlite3 db init
// const sqlite3 = require('sqlite3').verbose();

// let db = new sqlite3.Database('./test.db', (err) => {
//     if (err) {
//       console.error(err.message);
//     }
//     console.log('Connected to the test database!');
// });


// app init
var express = require('express');
var app = express();

// load static web main page
const path = require('path');

app.use(express.static(__dirname))
app.get('/', function (req, res) {
    res.send('Main page loading properly!');
});

// POST into database
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/record',require('./routes/record'));

// Run the server
const port = 3000;
app.listen(port, function () {
    console.log(`Example app listening on port ${port}!`)
})

// Close the database
// Code here
