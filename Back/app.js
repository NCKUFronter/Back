"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

// @ts-check
require("dotenv").config();

var express = require("express");

var bodyParser = require("body-parser");

var compression = require("compression");

var fileUpload = require("express-fileupload");

var fs = require("fs");

var https = require("https");

var http = require("http");

var cors = require("cors");

var _require = require("./middleware/app-passport"),
    AppPassport = _require.AppPassport;

var session = require("express-session");

var cookieParser = require("cookie-parser");

var flash = require("connect-flash");

var _require2 = require("./models/mongo"),
    connectDB = _require2.connectDB,
    collections = _require2.collections,
    client = _require2.client;

var swaggerGenerator = require("express-swagger-generator");

var swaggerUi = require("swagger-ui-express");

var path = require("path");

var createFolder = function createFolder(folder) {
  try {
    fs.accessSync(folder);
  } catch (e) {
    fs.mkdirSync(folder);
  }
};

function startup() {
  return _startup.apply(this, arguments);
}

function _startup() {
  _startup = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
    var app, sessionStore, definition, specs, KeyCert, key, cert, port, server;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return connectDB();

          case 2:
            // App init
            app = express();
            app.set("json spaces", 2); // Plugins

            app.use( // @ts-ignore: 型別定義不符合express，但可以work
            cors({
              credentials: true,
              origin: function origin(_origin, cb) {
                return cb(null, true);
              } // 給前端用

            })); // @ts-ignore

            app.use(compression()); // @ts-ignore

            app.use(cookieParser()); // @ts-ignore

            app.use(fileUpload({
              limits: {
                fileSize: 1 * 1024 * 1024
              }
            }));
            if (process.env.SUPPORT_GAME) app.use("/game", express["static"](path.resolve(process.env.GAME_PREFIX || "../Game")));
            app.use(require("./middleware/front-end-hook"));
            app.use("/api/img", express["static"](path.resolve("./img"))); // init ledger photo directory

            createFolder(path.resolve("./img"));
            createFolder(path.resolve("./img/user-ledger")); // Log in

            sessionStore = new session.MemoryStore();
            app.use( // @ts-ignore: 型別定義不符合express，但可以work
            session({
              secret: process.env.SESSION_SECRET || "cats",
              resave: false,
              saveUninitialized: false,
              store: sessionStore
            }));
            app.use(AppPassport.initialize());
            app.use(AppPassport.session()); // @ts-ignore: 型別定義不符合express，但可以work

            app.use(flash());
            app.use(bodyParser.urlencoded({
              extended: false
            }));
            app.use(bodyParser.json()); // Router

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
            app.use("/api/statistic", require("./routes/statistic")); // app.use("/api/game", require("./routes/game"));
            // default error handler

            app.use(function (err, req, res, next) {
              if (err) res.status(500).send(err.message || err);else next();
            }); // swagger setting
            // @ts-ignore

            definition = {
              info: {
                title: "Fronter",
                description: "Backend Api Document",
                version: "0.0.1"
              },
              basePath: "/api",
              securityDefinitions: []
            };
            specs = swaggerGenerator({
              swaggerDefinition: definition,
              basedir: __dirname,
              files: ["./models/*.model.js", "./routes/swagger.api.js"]
            }); // @ts-ignore

            app.use("/api/api-docs", swaggerUi.serve, swaggerUi.setup(specs)); // Run the server

            KeyCert = null;

            try {
              key = fs.readFileSync(process.env.KEY_PEM);
              cert = fs.readFileSync(process.env.CERT_PEM);
              KeyCert = {
                key: key,
                cert: cert
              };
            } catch (err) {}

            console.log("has cert: " + Boolean(KeyCert));
            port = process.env.PORT || 3000;
            server = KeyCert ? https.createServer(KeyCert, app) : http.createServer(app);

            if (process.env.SUPPORT_GAME) {
              require("./middleware/app-socketio")(server, sessionStore);
            }

            _context.next = 43;
            return server.listen(port, function () {
              console.log("App listening on port ".concat(port, "!"));
            });

          case 43:
            return _context.abrupt("return", {
              server: server,
              app: app
            });

          case 44:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _startup.apply(this, arguments);
}

var promise = startup();
module.exports = promise; // for test