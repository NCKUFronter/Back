"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

// @ts-check
var Player = require("./player");

var Bullet = require("./bullet");

var Bag = require("./bag");
/**
 * @typedef WeaponParams
 * @property {Phaser.Scene} scene
 * @property {import('./bullet').BulletConfig} bulletCfg
 * @property {Bag} bag
 */


var Weapon = /*#__PURE__*/function () {
  /** @type string */

  /** @type Player */

  /** @type {import('./bullet').BulletConfig} */

  /** @type number */

  /** @type Bag */

  /** @param {WeaponParams} params */
  function Weapon(params) {
    (0, _classCallCheck2["default"])(this, Weapon);
    (0, _defineProperty2["default"])(this, "_id", void 0);
    (0, _defineProperty2["default"])(this, "owner", void 0);
    (0, _defineProperty2["default"])(this, "bulletCfg", void 0);
    (0, _defineProperty2["default"])(this, "amount", 1);
    (0, _defineProperty2["default"])(this, "bag", void 0);
    Object.assign(this, params); // 偷懶方式
  }

  (0, _createClass2["default"])(Weapon, [{
    key: "canUse",
    value: function canUse() {
      if (this.owner) return this.amount > 0 && this.owner.active;else return this.amount > 0;
    }
    /** @param {string=} uuid */

  }, {
    key: "use",
    value: function use(uuid) {
      return this.fire(uuid);
    }
    /** @param {string=} uuid */

  }, {
    key: "fire",
    value: function fire(uuid) {
      if (!this.canUse()) return null;
      this.amount--;
      if (this.amount == 0) this.bag.weapons.remove(this);
      if (this.owner) this._fire(uuid);
    }
    /** @param {string=} uuid */

  }, {
    key: "_fire",
    value: function _fire(uuid) {
      var from = this.owner;
      var bullet = new Bullet(Object.assign({
        scene: this.owner.getScene(),
        x: 0,
        y: 0
      }, this.bulletCfg));
      bullet._id = uuid;
      bullet.type = this.bulletCfg.type;
      bullet.fromObjectId = this._id; // @ts-ignore

      bullet.fire(from, from.directionX, from.directionY);
      from.emit("bullet$", bullet);
    }
    /**
     * @param {Bag} bag
     * @param {any} obj
     * @return Weapon
     */

  }], [{
    key: "deserialize",
    value: function deserialize(bag, obj) {
      var info = Object.assign({}, obj);
      info.bag = bag;
      return Object.assign(new Weapon(info), info);
    }
  }]);
  return Weapon;
}();

module.exports = Weapon;