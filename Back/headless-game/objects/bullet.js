"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

// @ts-check
var Role = require("./role");
/**
 * @typedef {'atk' | 'heal' | 'paralysis' | 'poison'} BulletType
 */

/**
 * @typedef BulletConfig
 * @property {string} key
 * @property {BulletType} type
 * @property {number} speed
 * @property {number=} atk
 * @property {number=} poison
 * @property {number=} heal
 * @property {number=} timeout
 */

/**
 * @typedef ImageParams
 * @property {Phaser.Scene} scene
 * @property {number} x
 * @property {number} y
 * @property {string} key
 * @property {BulletType} type
 * @property {number} speed
 * @property {number=} atk
 * @property {number=} heal
 * @property {number=} poison
 */


var defaultHurtFn = {
  /** @type {(this: Bullet, to: Role) => void} */
  atk: function atk(to) {
    to.hp -= this.atk;
    this.destroy();
  },

  /** @type {(this: Bullet, to: Role) => void} */
  heal: function heal(to) {
    to.hp += this.heal;
    this.destroy();
  },

  /** @type {(this: Bullet, to: Role) => void} */
  paralysis: function paralysis(to) {
    if (this.timeout) {
      to.status.paralysis = true;
      setTimeout(function () {
        return to.status.paralysis = false;
      }, this.timeout);
    }

    this.destroy();
  },

  /** @type {(this: Bullet, to: Role) => void} */
  poison: function poison(to) {
    to.hp -= this.poison;
    this.destroy();
  }
};

var Bullet
/* extends Phaser.Physics.Arcade.Image */
= function Bullet() {
  (0, _classCallCheck2["default"])(this, Bullet);
  (0, _defineProperty2["default"])(this, "_id", void 0);
  (0, _defineProperty2["default"])(this, "fromObjectId", void 0);
  (0, _defineProperty2["default"])(this, "from", void 0);
  (0, _defineProperty2["default"])(this, "type", void 0);
  (0, _defineProperty2["default"])(this, "speed", void 0);
  (0, _defineProperty2["default"])(this, "directionX", void 0);
  (0, _defineProperty2["default"])(this, "directionY", void 0);
  (0, _defineProperty2["default"])(this, "atk", void 0);
  (0, _defineProperty2["default"])(this, "heal", void 0);
  (0, _defineProperty2["default"])(this, "poison", void 0);
  (0, _defineProperty2["default"])(this, "timeout", void 0);
  (0, _defineProperty2["default"])(this, "_hurt", void 0);
}
/** @param {ImageParams} params */
// constructor(params) {
//   super(params.scene, params.x, params.y, params.key);
//   this.scene.add.existing(this);
//   this.scene.physics.add.existing(this);
//   this._hurt = defaultHurtFn[params.type];
//   Object.assign(this, params);
//   this.active = false;
// }
// /**
//  * @param {Role} from
//  * @param {-1 | 0 | 1} dx
//  * @param {-1 | 0 | 1} dy
//  */
// setFirePosition(from, dx, dy) {
//   if (!from) return;
//   this.x = from.x + (dx * (from.width + this.width)) / 2;
//   this.y = from.y - (dy * (from.height + this.height)) / 2;
//   this.directionX = dx;
//   this.directionY = dy;
// }
// /** @param {Role} to */
// hurt(to) {
//   // 如果是重新登入被自己子彈攻擊就不管吧
//   if (to == this.from) return;
//   if (this._hurt) {
//     this._hurt(to);
//     this.emit("onhurt$", this, to);
//   }
// }
// /**
//  * @param {Role} from
//  * @param {-1 | 0 | 1} dx
//  * @param {-1 | 0 | 1} dy
//  */
// fire(from, dx, dy) {
//   this.from = from;
//   this.setFirePosition(from, dx, dy);
//   // this.scene.time.delayedCall(20, () => this.justFire());
//   this.justFire();
// }
// // 依照子彈本身設定直接射擊
// justFire() {
//   this.setVelocityX(this.directionX * this.speed);
//   this.setVelocityY(-this.directionY * this.speed);
//   this.setActive(true);
//   this.setVisible(true);
// }
// /**
//  * @param {number} time
//  * @param {number} delta
//  */
// update(time, delta) {
//   if (!this.active) return;
//   if (this.x < 0 || this.x > 1920 || this.y < 0 || this.y > 1920) {
//     this.destroy();
//   }
// }
// info() {
//   return {
//     _id: this._id,
//     time: Date.now(),
//     x: this.x,
//     y: this.y,
//     directionX: this.directionX,
//     directionY: this.directionY,
//   };
// }
// serialize() {
//   return {
//     _id: this._id,
//     fromId: this.from && this.from._id,
//     time: Date.now(),
//     x: this.x,
//     y: this.y,
//     directionX: this.directionX,
//     directionY: this.directionY,
//     type: this.type,
//     speed: this.speed,
//     key: this.texture.key,
//     atk: this.atk,
//     heal: this.heal,
//     poison: this.poison,
//     fromObjectId: this.fromObjectId,
//   };
// }
// /**
//  * @param {Phaser.Scene} scene
//  * @param {any} obj
//  * @return Bullet
//  */
// static deserialize(scene, obj) {
//   obj.scene = scene;
//   return Object.assign(new Bullet(obj), obj);
// }
;

module.exports = Bullet;