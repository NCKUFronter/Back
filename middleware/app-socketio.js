// @ts-check
const SocketIO = require("socket.io");
const { notification } = require("../actions/notification.service");
const passportSocketio = require("passport.socketio");
const { workInTransaction, collections } = require("../models/mongo");
const {
  IdSchema,
  BulletMovingSchema,
  PositionSchema,
  MovingSchema,
  BulletSchema,
  BulletHurtSchema,
} = require("../models/event.model");
const uuid = require("uuid");

/**
 * @typedef AppSocketInfo
 * @property {any} player
 * @property {string} playerId
 */
/**
 * @typedef {AppSocketInfo & import('socket.io').Socket} AppSocket
 */

const rooms = {
  multiplayer: "multiplayer",
};

const players = {};
const playerScoketIdMap = {};
const bullets = {};

const events = {
  player: {
    use: "player:use",
    moving: "player:moving",
    info: "player:info",
    shooting: "player:shooting",
    shopping: "player:shopping",
    bag: "player:bag",
  },
  multi: {
    init: "multi:init",
    bullets: "multi:bullets",
    join: "multi:join",
    unjoin: "multi:unjoin",
  },
  bullet: {
    moving: "bullet:moving",
    hurt: "bullet:hurt",
    destroy: "bullet:destroy",
  },
  server: {
    error: "server:error",
  },
};

/**
 * @param {AppSocket} socket
 * @param {import('@hapi/joi').Schema} schema
 * @param {Function} callback
 * @param {string=} room
 */
function SocketValidatePipe(socket, schema, callback, room) {
  return (/** @type any */ data, fn) => {
    if (!schema) return;
    if (room && !socket.rooms[room]) return; // ignore unauthorized error
    const { error, value } = schema.validate(data);
    if (error) socket.emit(events.server.error, { status: 400, error });
    else callback(data, fn);
  };
}

/**
 * @param {import('http').Server} server
 */
function AppSocketIO(server, store) {
  const io = SocketIO(server);
  io.use(
    passportSocketio.authorize({
      secret: process.env.SESSION_SECRET,
      store,
      /** @param {import('http').IncomingMessage} data */
      success: (data, accept) => {
        // @ts-ignore
        if (false && playerScoketIdMap[data.user.gameUserId])
          accept({ status: 400, message: "Duplicate" });
        else accept(null, true);
      },
      /** @param {import('http').IncomingMessage} data */
      fail: (data, message, err, accept) => {
        // if (err) throw new Error(message);
        return accept({ status: 401, message }, false);
      },
    })
  ).use((/** @type {AppSocket} */ socket, next) => {
    const gameUserId = socket.request.user.gameUserId;
    playerScoketIdMap[gameUserId] = socket.id;
    collections.gameUser.findOne({ _id: gameUserId }).then((player) => {
      socket.player = player;
      next();
    });
  });
  io.on("connect", DefaultSocketHandler);
}

function DefaultSocketHandler(/** @type AppSocket */ socket) {
  socket.playerId = socket.player._id;
  socket.player._id = socket.id; // replace _id with socket.id

  // init
  socket.emit(events.player.info, socket.player);
  socket.emit("nothing", { xxx: "xxx" });
  socket.on(events.player.info, () => {
    socket.emit(events.player.info, socket.player);
  });

  socket.on(
    events.player.use,
    SocketValidatePipe(socket, IdSchema, (/** @type string */ goodsId, fn) => {
      if (goodsId.startsWith("xx")) return;
      else if (socket.player.bag && socket.player.bag[goodsId] > 0) {
        fn(true);
        socket.player.hasUseObject = true;
        socket.player.bag[goodsId] -= 1;
        if (socket.player.bag[goodsId] == 0) delete socket.player.bag[goodsId];
      }
    })
  );
  const notices$ = notification
    .listen()
    .filter((e) => e.from._id === socket.request.user._id)
    .filter((e) => e.data.type == "point" && e.data.action == "consume")
    .subscribe(
      (e) => {
        const bag = socket.player.bag;
        if (bag[e.data.goodsId] == null) bag[e.data.goodsId] = 0;
        bag[e.data.goodsId] += e.data.quantity;
        socket.emit(events.player.shopping, {
          id: e.data.goodsId,
          quantity: e.data.quantity,
        });
      },
      console.log,
      console.log
    );

  socket.on("disconnecting", function () {
    if (socket.player.hasUseObject) {
      collections.gameUser
        .updateOne(
          { _id: socket.playerId },
          { $set: { bag: socket.player.bag } }
        )
        .catch(console.log);
    }
    if (socket.rooms[rooms.multiplayer]) {
      socket
        .to(rooms.multiplayer)
        .broadcast.emit(events.multi.unjoin, socket.player);
    }
  });
  socket.on("disconnect", function () {
    delete players[socket.id];
    notices$.dispose();
    console.log("disconnect");
  });

  // ---------- multiplayer game events ----------
  socket.on(
    events.multi.join,
    SocketValidatePipe(socket, PositionSchema, (pos) => {
      socket.player.pos = pos;
      socket.join(rooms.multiplayer, (error) => {
        if (error)
          return socket.emit(events.server.error, { status: 500, error });

        socket.emit(
          events.multi.init,
          Object.values(players),
          Object.values(bullets)
        );
        players[socket.id] = socket.player;
        socket
          .to(rooms.multiplayer)
          .broadcast.emit(events.multi.join, socket.player);
      });
    })
  );

  socket.on(
    events.player.moving,
    SocketValidatePipe(
      socket,
      MovingSchema,
      (event) => {
        socket.player.pos = event.pos;
        socket.player.vel = event.vel;
        socket.player.hp = event.hp;
        event.time = Date.now();
        socket
          .to(rooms.multiplayer)
          .broadcast.emit(events.player.moving, socket.id, event);
      },
      rooms.multiplayer
    )
  );

  // 子彈發射，自身就是取得子彈id，廣播其他人子彈狀態
  socket.on(
    events.player.shooting,
    SocketValidatePipe(
      socket,
      BulletSchema,
      (info, fn) => {
        info._id = uuid.v4();
        bullets[info._id] = { from: socket.id, info };
        socket
          .to(rooms.multiplayer)
          .broadcast.emit(events.player.shooting, socket.id, info);
        fn(info._id);
      },
      rooms.multiplayer
    )
  );

  // 同步子彈位置
  socket.on(
    events.bullet.moving,
    SocketValidatePipe(
      socket,
      BulletMovingSchema,
      (event) => {
        const bullet = bullets[event._id].bullet;
        if (bullet) {
          bullet.x = event.pos.x;
          bullet.y = event.pos.y;
          bullet.updateTime = Date.now();
        }
      },
      rooms.multiplayer
    )
  );

  socket.on(
    events.bullet.hurt,
    SocketValidatePipe(
      socket,
      BulletHurtSchema,
      ({ bulletId, playerId, playerInfo }) => {
        if (bullets[bulletId].hurt) bullets[bulletId].hurt = playerId;
        if (players[playerId].hp) playerInfo.hp;
        socket
          .to(rooms.multiplayer)
          .broadcast.emit(events.bullet.hurt, playerId, playerInfo);
      }
    )
  );

  // 清除子彈，並轉發給其他人
  socket.on(
    events.bullet.destroy,
    SocketValidatePipe(
      socket,
      IdSchema,
      (/** @type string */ bulletId) => {
        if (bullets[bulletId])
          socket.to(rooms.multiplayer).emit(events.bullet.destroy, bulletId);
        delete bullets[bulletId];
      },
      rooms.multiplayer
    )
  );
}

module.exports = AppSocketIO;
