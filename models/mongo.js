var config = require('../config');

// mongoDB init
const MongoClient = require('mongodb').MongoClient;
const uri = config.db.uri;
const client = MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
var connection;
client.connect(err => {
    if (err) throw err;
});

exports.client = client;