// @ts-check

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const https = require("https");
const http = require("http");
const cors = require("cors");
const { AppPassport } = require("./middleware/app-passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const { connectDB, collections, client } = require("./models/mongo");
const swaggerGenerator = require("express-swagger-generator");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const createFolder = function (folder) {
  try {
    fs.accessSync(folder);
  } catch (e) {
    fs.mkdirSync(folder);
  }
};

async function startup() {
  await connectDB();

  // App init
  const app = express();
  app.set("json spaces", 2);

  // Plugins
  app.use(
    // @ts-ignore: 型別定義不符合express，但可以work
    cors({
      credentials: true,
      origin: (_origin, cb) => cb(null, true), // 給前端用
    })
  );

  // @ts-ignore
  app.use(compression());
  // @ts-ignore
  app.use(cookieParser());
  // @ts-ignore
  app.use(fileUpload({ limits: { fileSize: 1 * 1024 * 1024 } }));
  if (process.env.SUPPORT_GAME)
    app.use(
      "/game",
      express.static(path.resolve(process.env.GAME_PREFIX || "../Game"))
    );
  app.use(require("./middleware/front-end-hook"));
  app.use("/api/img", express.static(path.resolve("./img")));

  // init ledger photo directory
  createFolder(path.resolve("./img"));
  createFolder(path.resolve("./img/user-ledger"));

  // Log in
  const sessionStore = new session.MemoryStore();
  app.use(
    // @ts-ignore: 型別定義不符合express，但可以work
    session({
      secret: process.env.SESSION_SECRET || "cats",
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
    })
  );
  app.use(AppPassport.initialize());
  app.use(AppPassport.session());
  // @ts-ignore: 型別定義不符合express，但可以work
  app.use(flash());

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  // Router
  app.use("/api/record", require("./routes/record"));
  app.use("/api/user", require("./routes/user")); // /account to record user info
  app.use("/api/category", require("./routes/category"));
  app.use("/api/ledger", require("./routes/ledger")); // /account to record user info
  app.use("/api/login", require("./routes/login"));
  app.use("/api/user", require("./routes/login-local"));
  app.use("/api/point", require("./routes/point"));
  app.use("/api/goods", require("./routes/goods"));
  app.use("/api/invitation", require("./routes/invitaion"));
  app.use("/api/sse", require("./routes/notification"));
  app.use("/api/statistic", require("./routes/statistic"));
  // app.use("/api/game", require("./routes/game"));

  // default error handler
  app.use((err, req, res, next) => {
    if (err) res.status(500).send(err.message || err);
    else next();
  });

  // swagger setting
  // @ts-ignore
  const definition = {
    info: {
      title: "Fronter",
      description: "Backend Api Document",
      version: "0.0.1",
    },
    basePath: "/api",
    securityDefinitions: [],
  };

  const specs = swaggerGenerator({
    swaggerDefinition: definition,
    basedir: __dirname,
    files: ["./models/*.model.js", "./routes/swagger.api.js"],
  });
  // @ts-ignore
  app.use("/api/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

  // Run the server
  let KeyCert = null;
  try {
    const key = fs.readFileSync(process.env.KEY_PEM);
    const cert = fs.readFileSync(process.env.CERT_PEM);
    KeyCert = { key, cert };
  } catch (err) {}
  console.log("has cert: " + Boolean(KeyCert));

  const port = process.env.PORT || 3000;
  const server = KeyCert
    ? https.createServer(KeyCert, app)
    : http.createServer(app);

  if (process.env.SUPPORT_GAME) {
    require("./middleware/app-socketio")(server, sessionStore);
  }
  await server.listen(port, function () {
    console.log(`App listening on port ${port}!`);
  });

  return { server, app };
}
const promise = startup();
module.exports = promise; // for test
