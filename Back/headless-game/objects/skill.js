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
 * @typedef SkillParams
 * @property {Phaser.Scene} scene
 * @property {import('./bullet').BulletConfig} bulletCfg
 * @property {Bag} bag
 * @property {number} timeout
 */


var Skill = /*#__PURE__*/function () {
  /** @type string */

  /** @type Player */

  /** @type {import('./bullet').BulletConfig} */

  /** @type number */

  /** @param {SkillParams} params */
  function Skill(params) {
    (0, _classCallCheck2["default"])(this, Skill);
    (0, _defineProperty2["default"])(this, "_id", void 0);
    (0, _defineProperty2["default"])(this, "owner", void 0);
    (0, _defineProperty2["default"])(this, "bulletCfg", void 0);
    (0, _defineProperty2["default"])(this, "timeout", void 0);
    Object.assign(this, params); // 偷懶方式

    this.active = true;
  }

  (0, _createClass2["default"])(Skill, [{
    key: "canUse",
    value: function canUse() {
      // 可能因為冷卻時間，而不能使用技能
      if (this.owner) return this.owner.active && this.active;else return this.active;
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
      if (!this.canUse()) return;
      if (this.owner) this._fire(uuid);
    } // for multiplayer scene

    /** @param {string=} uuid */

  }, {
    key: "_fire",
    value: function _fire(uuid) {
      var _this = this;

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

      if (this.timeout) {
        this.active = false;
        setTimeout(function () {
          return _this.active = true;
        }, this.timeout);
      }
    }
    /**
     * @param {Bag} bag
     * @param {any} obj
     * @return Skill
     */

  }], [{
    key: "deserialize",
    value: function deserialize(bag, obj) {
      var info = Object.assign({}, obj);
      info.bag = bag;
      return Object.assign(new Skill(info), info);
    }
  }]);
  return Skill;
}();

module.exports = Skill;