"use strict";

// @ts-check
var SocketIO = require("socket.io");

var _require = require("../actions/notification.service"),
    notification = _require.notification;

var passportSocketio = require("passport.socketio");

var _require2 = require("../models/mongo"),
    workInTransaction = _require2.workInTransaction,
    collections = _require2.collections;

var _require3 = require("../models/event.model"),
    RoleSettingSchema = _require3.RoleSettingSchema,
    IdSchema = _require3.IdSchema,
    CursorsSchema = _require3.CursorsSchema,
    FnSchema = _require3.FnSchema,
    MaybeFnSchema = _require3.MaybeFnSchema;

var uuid = require("uuid"); // const RoomManager = require("../headless-game/room-manager");


var Bag = require("../headless-game/objects/bag");
/**
 * @typedef AppSocketInfo
 * @property {boolean} isLogin
 * @property {any} player
 * @property {string} playerId
 * @property {Bag} bag
 * @property {{[id: string]: number}} bagUse
 */

/**
 * @typedef {AppSocketInfo & import('socket.io').Socket} AppSocket
 */


var playerScoketIdMap = {};
var events = {
  player: {
    setting: "player:setting",
    save: "player:save",
    use: "player:use",
    // client -> server
    info: "player:info",
    // client <-> server
    shopping: "player:shopping",
    // server -> client
    join: "player:join",
    // client -> server
    leave: "player:leave",
    // client -> server
    moving: "player:moving"
  },
  server: {
    error: "server:error"
  }
}; ///** @type RoomManager */ let room;

/**
 * @param {AppSocket} socket
 * @param {import('@hapi/joi').Schema} schema
 * @param {Function} callback
 * @param {string=} room_name
 */

function SocketValidatePipe(socket, schema, callback, room_name) {
  return function (
  /** @type any */
  data, fn) {
    if (!schema) return;
    if (room_name && !socket.rooms[room_name]) return; // ignore unauthorized error

    var _schema$validate = schema.validate(data, {
      abortEarly: false
    }),
        error = _schema$validate.error,
        value = _schema$validate.value;

    var error2 = MaybeFnSchema.validate(fn).error;

    if (error) {
      socket.emit(events.server.error, {
        status: 400,
        error: error,
        data: data
      });
    } else if (error2) {
      socket.emit(events.server.error, {
        status: 400,
        error: "only accept one parameter"
      });
    } else {
      try {
        callback(data, fn);
      } catch (error) {
        console.error(error);
        socket.emit(events.server.error, {
          status: 500,
          error: error,
          data: data
        });
      }
    }
  };
}
/** @param {AppSocket} socket */


function personInfo(socket) {
  return Object.assign(socket.player, {
    bag: socket.bag.serialize()
  });
}
/** @param {AppSocket} socket */


function loginCheck(socket, next) {
  socket.isLogin = socket.request.user.logged_in;
  socket.bagUse = {}; // 未登入可以玩，多頁面登入當作未登入

  if (!socket.isLogin) socket.emit(events.server.error, {
    status: 401,
    error: "No session found"
  });else if (playerScoketIdMap[socket.request.user.gameUserId]) {
    socket.isLogin = false;
    socket.emit(events.server.error, {
      status: 403,
      error: "Duplicate"
    });
  } // 放入玩家資訊

  if (socket.isLogin) {
    var gameUserId = socket.request.user.gameUserId;
    playerScoketIdMap[gameUserId] = socket.id;
    collections.gameUser.findOne({
      _id: gameUserId
    }).then(function (player) {
      socket.player = player;
      next();
    });
  } else {
    socket.player = {
      _id: socket.id,
      name: "訪客" + socket.id.slice(0, 5),
      bag: {}
    };
    next();
  }
}
/**
 * @param {import('http').Server} server
 */


function AppSocketIO(server, store) {
  var io = SocketIO(server); // room = new RoomManager(io, "multiplayer");

  io.use(passportSocketio.authorize({
    secret: process.env.SESSION_SECRET,
    store: store,

    /** @param {import('http').IncomingMessage} data */
    success: function success(data, accept) {
      // @ts-ignore
      // if (false && playerScoketIdMap[data.user.gameUserId])
      // accept({ status: 400, message: "Duplicate" });
      // else accept(null, true);
      accept(null, true);
    },

    /** @param {import('http').IncomingMessage} data */
    fail: function fail(data, message, err, accept) {
      // if (err) throw new Error(message);
      // return accept({ status: 401, message }, false);
      accept(null, true);
    }
  }));
  io.use(loginCheck);
  io.on("connect", DefaultSocketHandler);
}

function DefaultSocketHandler(
/** @type AppSocket */
socket) {
  // console.log(socket.id + " connect");
  // init data
  socket.playerId = socket.player._id;
  socket.player._id = socket.id; // replace _id with socket.id

  socket.bag = new Bag(null);
  socket.bag.syncBag(socket.player.bag); // init

  socket.emit(events.player.info, personInfo(socket));
  socket.emit("nothing", {
    xxx: "xxx"
  });
  socket.on(events.player.info, SocketValidatePipe(socket, MaybeFnSchema, function (fn) {
    if (fn) fn(personInfo(socket));
    socket.emit(events.player.info, personInfo(socket));
  }));
  socket.on(events.player.save, SocketValidatePipe(socket, IdSchema, function (sceneId) {
    if (socket.player.progress > sceneId) return;
    socket.player.progress = sceneId;

    if (socket.isLogin) {
      collections.gameUser.updateOne({
        _id: socket.playerId
      }, {
        $set: {
          progress: sceneId
        }
      })["catch"](console.error);
    }
  }));
  socket.on(events.player.setting, SocketValidatePipe(socket, RoleSettingSchema, function (setting, fn) {
    if (socket.player.name === setting.name && socket.player.key === setting.key) return fn(true);
    socket.player.name = setting.name;
    socket.player.key = setting.key;
    socket.emit(events.player.info, personInfo(socket));

    if (socket.isLogin) {
      collections.gameUser.update({
        _id: socket.playerId
      }, {
        $set: {
          name: socket.player.name,
          key: socket.player.key
        }
      }).then(function () {
        return fn(true);
      })["catch"](console.error);
    } else fn(true);
  }));
  socket.on(events.player.use, SocketValidatePipe(socket, IdSchema, function (
  /** @type string */
  goodsId, fn) {
    // if use
    var obj = socket.bag.findObjectById(goodsId);

    if (obj && obj.canUse()) {
      // if safe to use
      var id = uuid.v4();
      fn(id);
      obj.use(id);

      if (obj["amount"] != null) {
        if (socket.bagUse[goodsId] == null) socket.bagUse[goodsId] = -1;else socket.bagUse[goodsId] -= 1;
      }
    } else fn(false);
  }));
  var notices$ = null;

  if (socket.isLogin) {
    notices$ = notification.listen().filter(function (e) {
      return e.from._id === socket.request.user._id;
    }).filter(function (e) {
      return e.data.type == "point" && e.data.action == "consume";
    }).subscribe(function (e) {
      try {
        socket.bag.updateBag(e.data.goodsId, e.data.quantity);
        socket.emit(events.player.shopping, {
          id: e.data.goodsId,
          quantity: e.data.quantity
        });
      } catch (err) {
        console.error(err);
      }
    }, null, null);
  }

  socket.on("disconnecting", function () {
    if (socket.isLogin && Object.keys(socket.bagUse).length > 0) {
      var updateInc = {};

      for (var goodsId in socket.bagUse) {
        updateInc["bag." + goodsId] = socket.bagUse[goodsId];
      }

      collections.gameUser.updateOne({
        _id: socket.playerId
      }, {
        $inc: updateInc
      })["catch"](console.error);
    } // if (socket.rooms[room.name]) room.playerLeave(socket.id);


    if (notices$) notices$.dispose();
    if (socket.isLogin) delete playerScoketIdMap[socket.request.user._id];
  });
  socket.on("disconnect", function () {// console.log(socket.id + " disconnect");
  }); // ---------- multiplayer game events ----------

  /*
  socket.on(
    events.player.join,
    SocketValidatePipe(socket, FnSchema, (fn) => {
      socket.join(room.name);
      room.playerJoin(socket, socket.player, socket.bag, fn);
    })
  );
    socket.on(
    events.player.moving,
    SocketValidatePipe(
      socket,
      CursorsSchema,
      (cursors) => room.playerMoving(socket.id, cursors),
      room.name
    )
  );
    socket.on(
    events.player.leave,
    SocketValidatePipe(
      socket,
      FnSchema,
      () => room.playerLeave(socket.id),
      room.name
    )
  );
  */
}

module.exports = AppSocketIO;