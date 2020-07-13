"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

// @ts-check
var Player = require("./player");

var Bag = require("./bag");
/**
 * @typedef PropsParams
 * @property {Phaser.Scene} scene
 * @property {Bag} bag
 * @property {string=} field
 * @property {number=} value
 */


var Props = /*#__PURE__*/function () {
  /** @type string */

  /** @type Player */

  /** @type string | undefined */

  /** @type number | undefined */

  /** @type number */

  /** @type Bag */

  /** @param {PropsParams} params */
  function Props(params) {
    (0, _classCallCheck2["default"])(this, Props);
    (0, _defineProperty2["default"])(this, "_id", void 0);
    (0, _defineProperty2["default"])(this, "owner", void 0);
    (0, _defineProperty2["default"])(this, "field", void 0);
    (0, _defineProperty2["default"])(this, "value", void 0);
    (0, _defineProperty2["default"])(this, "amount", void 0);
    (0, _defineProperty2["default"])(this, "bag", void 0);
    Object.assign(this, params); // 偷懶方式
  }

  (0, _createClass2["default"])(Props, [{
    key: "canUse",
    value: function canUse() {
      if (this.owner) return this.amount > 0 && this.owner.active;else return this.amount > 0;
    }
    /** @param {string=} uuid */

  }, {
    key: "use",
    value: function use(uuid) {
      if (!this.canUse()) return;
      this.amount--;
      if (this.amount == 0) this.bag.props.remove(this);
      if (this.owner) this._use(uuid);
    } // for multiplayer scene

    /** @param {string=} uuid */

  }, {
    key: "_use",
    value: function _use(uuid) {
      if (this.field) this.owner[this.field] += this.value;
    }
    /**
     * @param {Bag} bag
     * @param {any} obj
     * @return Props
     */

  }], [{
    key: "deserialize",
    value: function deserialize(bag, obj) {
      var info = Object.assign({}, obj);
      info.bag = bag;
      return Object.assign(new Props(info), info);
    }
  }]);
  return Props;
}();

module.exports = Props;