// @ts-check
const Player = require("./player");
const Bag = require("./bag");

/**
 * @typedef PropsParams
 * @property {Phaser.Scene} scene
 * @property {Bag} bag
 * @property {string=} field
 * @property {number=} value
 */

class Props {
  /** @type string */ _id;
  /** @type Player */ owner;

  /** @type string | undefined */ field;
  /** @type number | undefined */ value;
  /** @type number */ amount;
  /** @type Bag */ bag;

  /** @param {PropsParams} params */
  constructor(params) {
    Object.assign(this, params); // 偷懶方式
  }

  canUse() {
    if (this.owner) return this.amount > 0 && this.owner.active;
    else return this.amount > 0;
  }

  /** @param {string=} uuid */
  use(uuid) {
    if (!this.canUse()) return;
    this.amount--;

    if (this.amount == 0) this.bag.props.remove(this);
    if (this.owner) this._use(uuid);
  }

  // for multiplayer scene
  /** @param {string=} uuid */
  _use(uuid) {
    if (this.field) this.owner[this.field] += this.value;
  }

  /**
   * @param {Bag} bag
   * @param {any} obj
   * @return Props
   */
  static deserialize(bag, obj) {
    const info = Object.assign({}, obj);
    info.bag = bag;
    return Object.assign(new Props(info), info);
  }
}

module.exports = Props;
