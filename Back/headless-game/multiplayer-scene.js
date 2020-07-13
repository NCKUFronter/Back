"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

// @ts-check
var Phaser = require("phaser");

var Player = require("./objects/player");

var Bullet = require("./objects/bullet");

var MultiplayerScene = /*#__PURE__*/function (_Phaser$Scene) {
  (0, _inherits2["default"])(MultiplayerScene, _Phaser$Scene);

  var _super = _createSuper(MultiplayerScene);

  /** @type Phaser.GameObjects.Group */

  /** @type Phaser.GameObjects.Group */
  function MultiplayerScene() {
    var _this;

    (0, _classCallCheck2["default"])(this, MultiplayerScene);
    _this = _super.call(this, {
      key: "multiplayer",
      active: false,
      cameras: null
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "bullets", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "players", void 0);
    return _this;
  }

  (0, _createClass2["default"])(MultiplayerScene, [{
    key: "serializePlayers",
    value: function serializePlayers() {
      var detail = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      return this.players.getChildren().map(function (
      /** @type Player */
      player) {
        return player.info(detail);
      });
    }
  }, {
    key: "serializeBullets",
    value: function serializeBullets() {
      return this.bullets.getChildren().map(function (
      /** @type Bullet */
      bullet) {
        return bullet.serialize();
      });
    }
    /**
     * @param {import('../models/event.model').PlayerInfo} info
     * @param {import('./objects/bag')} bag
     * @return Player
     */

  }, {
    key: "createPlayer",
    value: function createPlayer(info, bag) {
      var new_player = new Player({
        scene: this,
        x: 900,
        y: 600,
        key: info.key,
        hp: 100
      }, bag);
      new_player._id = info._id;
      new_player.name = info.name;
      new_player.setCollideWorldBounds(true, 0, 0);
      new_player.on("bullet$", this.bulletCreated, this);
      this.physics.add.collider(new_player, this.players);
      this.players.add(new_player);
      return new_player;
    }
    /** @param {Bullet} bullet */

  }, {
    key: "bulletCreated",
    value: function bulletCreated(bullet) {
      this.bullets.add(bullet);
    }
  }, {
    key: "preload",
    value: function preload() {
      // 子彈圖片(因為大小不統一)與地圖圖片必要
      this.load.image("sky", "assets/sky.png");
      this.load.image("bullet", "assets/bullet.png");
      this.load.image("blackHole", "assets/blackHole.png");
      this.load.image("bomb", "assets/bomb.png");
      this.load.image("star", "assets/star.png"); // ---------- goods ----------
      // this.load.image("bambooDragonfly", "assets/objects/bamboo dragonfly.png");
      // this.load.image("glove", "assets/objects/glove.png");
      // this.load.image("black-hole", "assets/objects/black hole.png");
      // this.load.image("liftPotion", "assets/objects/LIFE.png");
      // this.load.image("wormHole", "assets/objects/wormhole.png");

      this.load.image("redGem", "assets/objects/reg gem.png");
      this.load.image("greenGem", "assets/objects/green gem.png");
      this.load.image("blueGem", "assets/objects/blue gem.png");
      this.load.image("yellowGem", "assets/objects/yellow gem.png");
      this.load.image("purpleGem", "assets/objects/purple gem.png");
      this.load.image("blackGem", "assets/objects/black diamond.png"); // ---------- bullets ----------

      this.load.image("bullet-yellow", "assets/objects/yellow-bullet.png");
      this.load.image("bullet-green", "assets/objects/green-bullet.png");
      this.load.image("bullet-white", "assets/objects/white-bullet.png");
      this.load.image("bullet-blue", "assets/objects/blue-bullet.png");
      /*
      this.load.image("tile", "assets/tilesheet.png");
      this.load.image("tile2", "assets/transparent-bg-tiles.png");
      this.load.image("weitile", "assets/Spacepack 5.png");
      this.load.image("weitile2", "assets/Spacepack Floor 1.png");
      this.load.image("weitile3", "assets/Spacepack Floor 2.png");
      this.load.image("weitile4", "assets/outside.png");
      this.load.image("weitile5", "assets/trees_plants.png");
      this.load.tilemapTiledJSON("map", "assets/map2.json");
      this.load.tilemapTiledJSON("darkForest", "assets/darkForest.json");
      */

      this.load.image("spatile4", "assets/mapSpace/asteroid.png");
      this.load.image("spatile1", "assets/mapSpace/Nebula Aqua-Pink.png");
      this.load.image("spatile2", "assets/mapSpace/Spacepack 2.png");
      this.load.image("spatile3", "assets/mapSpace/Spacepack 4.png");
      this.load.tilemapTiledJSON("warSpace", "assets/mapSpace/warSpace.json");
      console.log("game preload success!");
    }
  }, {
    key: "create",
    value: function create() {
      this.players = this.add.group({
        runChildUpdate: true
      });
      this.bullets = this.add.group({
        runChildUpdate: true
      });
      this.createBackground3();
      this.physics.world.setBounds(0, 0, 1920, 1920, true, true, true, true);
      this.physics.add.overlap(this.players, this.bullets,
      /** @param {Player} player; @param {Bullet} bullet */
      function (player, bullet) {
        return bullet.hurt(player);
      });
      this.game.events.emit("sceneCreated$", this);
    }
  }, {
    key: "createBackground3",
    value: function createBackground3() {
      var map = this.make.tilemap({
        key: "warSpace"
      });
      var tileset = map.addTilesetImage("Nebula Aqua-Pink", "spatile1");
      var tileset2 = map.addTilesetImage("Spacepack 2", "spatile2");
      var tileset3 = map.addTilesetImage("Spacepack 4", "spatile3");
      var tileset4 = map.addTilesetImage("asteroid", "spatile4");
      this.layer1 = map.createStaticLayer("background", tileset, 0, 0);
      this.layer2 = map.createStaticLayer("BASE", tileset2, 0, 0);
      this.layer3 = map.createStaticLayer("BASE2", tileset3, 0, 0);
      this.layer4 = map.createStaticLayer("asteroid", tileset4, 0, 0);
      this.layer1.setScale(1.5);
      this.layer2.setScale(1.5);
      this.layer3.setScale(1.5);
      this.layer4.setScale(1.5);
      this.layer2.setCollisionByExclusion([-1], true);
      this.layer3.setCollisionByExclusion([-1], true);
      this.layer4.setCollisionByExclusion([-1], true);
      this.physics.add.collider(this.layer4, this.players);
      this.physics.add.collider(this.layer2, this.players);
      this.physics.add.collider(this.layer3, this.players);
    }
    /*
    createBackground2() {
      const map = this.make.tilemap({ key: "darkForest" });
      const tileset = map.addTilesetImage("Spacepack 5", "weitile");
      this.layer3 = map.createStaticLayer("ship", tileset, 0, 0);
      this.layer3.setScale(1.5);
      this.layer3.setCollisionByExclusion([-1], true);
      this.physics.add.collider(this.layer3, this.players);
    }
      createBackground1() {
      const map = this.make.tilemap({ key: "map" });
      const tileset = map.addTilesetImage("tilesheet", "tile");
      this.layer3 = map.createStaticLayer("collision", tileset, 0, 0);
      this.layer3.setScale(1.5);
      this.layer3.setCollisionByExclusion([-1], true);
      this.physics.add.collider(this.layer3, this.players);
    }
    */

  }, {
    key: "update",
    value: function update() {
      var _iterator = _createForOfIteratorHelper(this.bullets.getChildren()),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var bullet = _step.value;
          // @ts-ignore
          if (this.layer3.tilemap.hasTileAtWorldXY(bullet.x, bullet.y)) bullet.destroy();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }]);
  return MultiplayerScene;
}(Phaser.Scene);

module.exports = MultiplayerScene;