"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

// @ts-check
var _require = require("events"),
    EventEmitter = _require.EventEmitter;

var Game = require("./game");

var Bullet = require("./objects/bullet");

var Player = require("./objects/player");
/**
 * @typedef PlayerInfoBundle
 * @property {SocketIO.Socket} socket
 * @property {import('../models/event.model').PlayerInfo} info
 * @property {Player} instance
 */


var events = {
  init: "multi:init",
  sync: "multi:sync",
  join: "multi:join",
  leave: "multi:leave",
  hurt: "multi:hurt",
  bullet: {
    create: "multi:bullet:create",
    destroy: "multi:bullet:destroy"
  }
};

var RoomManager = /*#__PURE__*/function (_EventEmitter) {
  (0, _inherits2["default"])(RoomManager, _EventEmitter);

  var _super = _createSuper(RoomManager);

  /** @type SocketIO.Server */

  /** @type Game */

  /** @type import('./multiplayer-scene') */

  /** @type {{[socketId: string]: PlayerInfoBundle}} */
  // bullets = {};

  /**
   * @param {SocketIO.Server} io
   * @param {string} name
   */
  function RoomManager(io, name) {
    var _this;

    (0, _classCallCheck2["default"])(this, RoomManager);
    _this = _super.call(this);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "io", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "game", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "scene", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "players", {});
    _this.io = io;
    _this.name = name;
    _this.game = new Game();

    _this.game.events.on("sceneCreated$", _this.initPeriodEvent, (0, _assertThisInitialized2["default"])(_this));

    return _this;
  } // ---------- player ----------
  // socketio -> headless-game

  /**
   * @param {SocketIO.Socket} socket
   * @param {import('../models/event.model').PlayerInfo} info
   * @param {import('./objects/bag')} bag
   */


  (0, _createClass2["default"])(RoomManager, [{
    key: "playerJoin",
    value: function playerJoin(socket, info, bag, fn) {
      fn(this.scene.serializePlayers(true), this.scene.serializeBullets());
      socket.emit(events.init, this.scene.serializePlayers(true), this.scene.serializeBullets());
      var instance = this.scene.createPlayer(info, bag);
      instance.on("bullet$", this.bulletCreated, this);
      this.players[socket.id] = {
        socket: socket,
        info: info,
        instance: instance
      };
      socket.to(this.name).broadcast.emit(events.join, instance.info(true));
    }
  }, {
    key: "playerMoving",
    value: function playerMoving(socketId, cursors) {
      var bundle = this.players[socketId];
      if (bundle) bundle.instance.cursors = cursors;
    }
  }, {
    key: "playerLeave",
    value: function playerLeave(
    /** @type string */
    socketId) {
      var bundle = this.players[socketId];

      if (bundle) {
        bundle.instance.bag.resetOwner(null);
        bundle.instance.off("bullet$");
        bundle.instance.destroy();
        bundle.socket.to(this.name).broadcast.emit(events.leave, bundle.info._id);
      }
    } // ---------- period  event ----------

    /** @param {import('./multiplayer-scene')} scene */

  }, {
    key: "initPeriodEvent",
    value: function initPeriodEvent(scene) {
      this.scene = scene;
      this.periodEvent = this.scene.time.addEvent({
        delay: 30,
        callback: this.sendPeriodEvent,
        callbackScope: this,
        loop: true
      });
    }
  }, {
    key: "sendPeriodEvent",
    value: function sendPeriodEvent() {
      var players_info = this.scene.serializePlayers();
      var bullets_info = this.scene.serializeBullets();
      this.io.to(this.name).emit(events.sync, players_info, bullets_info);
    } // ---------- bullet ----------

    /** @param {Bullet} bullet */

  }, {
    key: "bulletCreated",
    value: function bulletCreated(bullet) {
      bullet.on("destroy", this.bulletDestroy, this);
      bullet.on("onhurt$", this.bulletHurt, this); // const bundle = this.players[bullet.from._id];

      this.io.to(this.name).emit(events.bullet.create, bullet.from._id, bullet.serialize());
      /*
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
      */
    }
    /** @param {Bullet} bullet; @param {Player} player */

  }, {
    key: "bulletHurt",
    value: function bulletHurt(bullet, player) {
      this.io.to(this.name).emit(events.bullet.hurt, bullet._id, player._id);
    }
    /** @param {Bullet} bullet */

  }, {
    key: "bulletDestroy",
    value: function bulletDestroy(bullet) {
      bullet.off("onhurt$");
      bullet.off("destroy");
      this.io.to(this.name).emit(events.bullet.destroy, bullet._id);
    }
  }]);
  return RoomManager;
}(EventEmitter);

module.exports = RoomManager;