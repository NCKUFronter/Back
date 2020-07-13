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
var Role = require("./role");

var Bag = require("./bag");
/**
 * @typedef ImageParams
 * @property {Phaser.Scene} scene
 * @property {number} x
 * @property {number} y
 * @property {string} key
 * @property {number} hp
 */


var Player = /*#__PURE__*/function (_Role) {
  (0, _inherits2["default"])(Player, _Role);

  var _super = _createSuper(Player);

  /** @type {number} */

  /** @type {number} */

  /** @type {string} */

  /** @type {string} */

  /** @type {Bag} */

  /** @param {ImageParams} params; @param {Bag=} bag */
  function Player(params, bag) {
    var _this;

    (0, _classCallCheck2["default"])(this, Player);
    _this = _super.call(this, params.scene, params.x, params.y);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "directionX", 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "directionY", -1);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "playerId", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "key", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "bag", void 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "cursors", {
      up: false,
      down: false,
      right: false,
      left: false
    });
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "bulletTypeCount", 0);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "base_vel", 160);
    _this.hp = params.hp;
    _this.key = params.key;

    if (bag) {
      _this.bag = bag;
      bag.resetOwner((0, _assertThisInitialized2["default"])(_this));
    } else _this.bag = new Bag((0, _assertThisInitialized2["default"])(_this));

    return _this;
  }

  (0, _createClass2["default"])(Player, [{
    key: "getScene",
    value: function getScene() {
      return this.scene;
    }
    /** @param {number=} time */

  }, {
    key: "update",
    value: function update(time) {
      if (!this.active) return;
      if (!this.status.paralysis) this.handleMoving();
    }
  }, {
    key: "handleMoving",
    value: function handleMoving() {
      var factorX = Number(this.cursors.right) - Number(this.cursors.left);
      var factorY = Number(this.cursors.up) - Number(this.cursors.down);
      this.setVelocityX(factorX * this.base_vel);
      this.setVelocityY(-factorY * 160);

      if (factorX != 0 || factorY != 0) {
        this.directionX = factorX;
        this.directionY = factorY;
      }
    }
  }, {
    key: "info",
    value: function info() {
      var detail = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var info = {
        status: this.status,
        active: this.active,
        time: Date.now(),
        hp: this.hp,
        _id: this._id,
        directionX: this.directionX,
        directionY: this.directionY,
        pos: {
          x: this.x,
          y: this.y
        },
        vel: {
          x: this.body.velocity.x,
          y: this.body.velocity.y
        }
      };

      if (detail) {
        info.name = this.name;
        info.key = this.key;
      }

      return info;
    }
  }]);
  return Player;
}(Role);

module.exports = Player;