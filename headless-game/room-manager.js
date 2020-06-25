// @ts-check
const { EventEmitter } = require("events");
const Game = require("./game");
const Bullet = require("./objects/bullet");
const Player = require("./objects/player");

/**
 * @typedef PlayerInfoBundle
 * @property {SocketIO.Socket} socket
 * @property {import('../models/event.model').PlayerInfo} info
 * @property {Player} instance
 */

const events = {
  init: "multi:init",
  sync: "multi:sync",
  join: "multi:join",
  leave: "multi:leave",
  hurt: "multi:hurt",
  bullet: {
    create: "multi:bullet:create",
    destroy: "multi:bullet:destroy",
  },
};

class RoomManager extends EventEmitter {
  /** @type SocketIO.Server */ io;
  /** @type Game */ game;
  /** @type import('./multiplayer-scene') */ scene;
  /** @type {{[socketId: string]: PlayerInfoBundle}} */ players = {};
  // bullets = {};

  /**
   * @param {SocketIO.Server} io
   * @param {string} name
   */
  constructor(io, name) {
    super();
    this.io = io;
    this.name = name;
    this.game = new Game();
    this.game.events.on("sceneCreated$", this.initPeriodEvent, this);
  }

  // ---------- player ----------
  // socketio -> headless-game
  /**
   * @param {SocketIO.Socket} socket
   * @param {import('../models/event.model').PlayerInfo} info
   * @param {import('./objects/bag')} bag
   */
  playerJoin(socket, info, bag) {
    socket.emit(
      events.init,
      this.scene.serializePlayers(true),
      this.scene.serializeBullets()
    );
    const instance = this.scene.createPlayer(info, bag);
    instance.on("bullet$", this.bulletCreated, this);
    this.players[socket.id] = { socket, info, instance };
    socket.to(this.name).broadcast.emit(events.join, instance.info(true));
  }

  playerMoving(socketId, cursors) {
    const bundle = this.players[socketId];
    if (bundle) bundle.instance.cursors = cursors;
  }

  playerLeave(/** @type string */ socketId) {
    const bundle = this.players[socketId];
    if (bundle) {
      bundle.instance.bag.resetOwner(null);
      bundle.instance.off("bullet$");
      bundle.instance.destroy();
      bundle.socket.to(this.name).broadcast.emit(events.leave, bundle.info._id);
    }
  }

  // ---------- period  event ----------
  /** @param {import('./multiplayer-scene')} scene */
  initPeriodEvent(scene) {
    this.scene = scene;
    this.periodEvent = this.scene.time.addEvent({
      delay: 30,
      callback: this.sendPeriodEvent,
      callbackScope: this,
      loop: true,
    });
  }

  sendPeriodEvent() {
    const players_info = this.scene.serializePlayers();
    const bullets_info = this.scene.serializeBullets();
    this.io.to(this.name).emit(events.sync, players_info, bullets_info);
  }

  // ---------- bullet ----------
  /** @param {Bullet} bullet */
  bulletCreated(bullet) {
    bullet.on("destroy", this.bulletDestroy, this);
    bullet.on("onhurt$", this.bulletHurt, this);
    const bundle = this.players[bullet.from._id];
    if (bundle) {
      bundle.socket
        .to(this.name)
        .broadcast.emit(
          events.bullet.create,
          bullet.from._id,
          bullet.serialize()
        );
    } else {
      this.io
        .to(this.name)
        .emit(events.bullet.create, bullet.from._id, bullet.serialize());
    }
  }

  /** @param {Bullet} bullet; @param {Player} player */
  bulletHurt(bullet, player) {
    this.io.to(this.name).emit(events.bullet.hurt, bullet._id, player._id);
  }

  /** @param {Bullet} bullet */
  bulletDestroy(bullet) {
    bullet.off("onhurt$");
    bullet.off("destroy");
    this.io.to(this.name).emit(events.bullet.destroy, bullet._id);
  }
}

module.exports = RoomManager;
