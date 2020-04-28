// @ts-check

// sqlite3 db init
// const sqlite3 = require('sqlite3').verbose();

// let db = new sqlite3.Database('./test.db', (err) => {
//     if (err) {
//       console.error(err.message);
//     }
//     console.log('Connected to the test database!');
// });

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const https = require("https");
const cors = require("cors");
const { passport } = require('./middleware/passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
var flash = require('connect-flash');

// load static web main page
const path = require("path");
const { connectDB } = require("./models/mongo");

async function startup() {
  await connectDB();

  // app init
  const app = express();

  // Plugins
  // @ts-ignore
  app.use(cors());

  app.use(express.static(__dirname));
  app.get("/", function (req, res) {
    res.send("Main page loading properly!");
  });
  app.use(cookieParser());
  app.use(session({ secret: "cats" }));

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  //LogIn
  
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(flash())

  // Router
  app.use("/record", require("./routes/record"));
  app.use("/user", require("./routes/user")); // /account to record user info
  app.use("/category", require("./routes/category"));
  app.use("/ledger", require("./routes/ledger")); // /account to record user info
  app.use("/login", require("./routes/login"));

  // Run the server
  let KeyCert = null;
  try {
    const key = fs.readFileSync(process.env.KEY_PEM);
    const cert = fs.readFileSync(process.env.CERT_PEM);
    KeyCert = { key, cert };
  } catch (err) {}
  console.log("has cert: " + Boolean(KeyCert));

  const port = process.env.PORT || 3000;
  const server = KeyCert ? https.createServer(KeyCert, app) : app;
  server.listen(port, function () {
    console.log(`App listening on port ${port}!`);
  });
}
startup();

// Close the database
// Code here
