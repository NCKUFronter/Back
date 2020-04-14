// app init
var express = require('express');
var app = express();

// load static web main page
app.use(express.static(`${__dirname}`))
app.get('/', function (req, res) {
    res.send('Main page loading properly!');
});

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use("/record",require("./routes/record"));

// Run the server
const port = 3000;
app.listen(port, function () {
    console.log(`Example app listening on port ${port}!`)
})

// Close the database
// Code here
