// db init
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./test.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    else
        console.log('Connected to the test database!');
});

exports.db = db;