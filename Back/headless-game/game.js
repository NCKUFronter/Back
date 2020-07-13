"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

// @ts-check
require("@geckos.io/phaser-on-nodejs");

var Phaser = require("phaser");

var MultiplayerScene = require("./multiplayer-scene");

var path = require("path"); // main game configuration

/** @type Phaser.Types.Core.GameConfig */


var config = {
  type: Phaser.HEADLESS,
  width: 1280,
  height: 1280,
  banner: false,
  audio: {
    noAudio: true
  },
  physics: {
    "default": "arcade"
  },
  scene: MultiplayerScene,
  loader: {
    baseURL: path.resolve(process.env.GAME_PREFIX || "../Game/")
  }
};

var Game = /*#__PURE__*/function (_Phaser$Game) {
  (0, _inherits2["default"])(Game, _Phaser$Game);

  var _super = _createSuper(Game);

  function Game() {
    (0, _classCallCheck2["default"])(this, Game);
    return _super.call(this, config);
  }

  return Game;
}(Phaser.Game);

module.exports = Game;