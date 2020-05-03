// @ts-check

require("dotenv").config();
const express = require("express");
// const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const https = require("https");
const cors = require("cors");
const { AppPassport } = require("./middleware/app-passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const { connectDB, collections, client } = require("./models/mongo");

async function startup() {
  await connectDB();

  // App init
  const app = express();

  // Plugins
  app.use(
    // @ts-ignore
    cors({
      credentials: true,
      origin: (_origin, cb) => cb(null, true), // 給前端用
    })
  );

  app.use(express.static(__dirname));
  app.get("/", function (req, res) {
    res.send("Main page loading properly!");
  });
  // Log in
  app.use(cookieParser());
  app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
  app.use(AppPassport.initialize());
  app.use(AppPassport.session());
  app.use(flash());

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  // Router
  app.use("/record", require("./routes/record"));
  app.use("/user", require("./routes/user")); // /account to record user info
  app.use("/category", require("./routes/category"));
  app.use("/ledger", require("./routes/ledger")); // /account to record user info
  app.use("/login", require("./routes/login"));
  app.use("/login-local", require("./routes/login-local"));

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
