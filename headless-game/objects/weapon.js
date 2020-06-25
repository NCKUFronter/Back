// @ts-check
const Player = require("./player");
const Bullet = require("./bullet");
const Bag = require("./bag");

/**
 * @typedef WeaponParams
 * @property {Phaser.Scene} scene
 * @property {import('./bullet').BulletConfig} bulletCfg
 * @property {Bag} bag
 */

class Weapon {
  /** @type string */ _id;
  /** @type Player */ owner;
  /** @type {import('./bullet').BulletConfig} */ bulletCfg;
  /** @type number */ amount = 1;
  /** @type Bag */ bag;

  /** @param {WeaponParams} params */
  constructor(params) {
    Object.assign(this, params); // 偷懶方式
  }

  canUse() {
    if (this.owner) return this.amount > 0 && this.owner.active;
    else return this.amount > 0;
  }

  /** @param {string=} uuid */
  use(uuid) {
    return this.fire(uuid);
  }

  /** @param {string=} uuid */
  fire(uuid) {
    if (!this.canUse()) return null;
    this.amount--;

    if (this.amount == 0) this.bag.weapons.remove(this);
    if (this.owner) this._fire(uuid);
  }

  /** @param {string=} uuid */
  _fire(uuid) {
    const from = this.owner;
    const bullet = new Bullet(
      Object.assign(
        { scene: this.owner.getScene(), x: 0, y: 0 },
        this.bulletCfg
      )
    );
    bullet._id = uuid;
    bullet.type = this.bulletCfg.type;
    bullet.fromObjectId = this._id;
    // @ts-ignore
    bullet.fire(from, from.directionX, from.directionY);
    from.emit("bullet$", bullet);
  }

  /**
   * @param {Bag} bag
   * @param {any} obj
   * @return Weapon
   */
  static deserialize(bag, obj) {
    const info = Object.assign({}, obj);
    info.bag = bag;
    return Object.assign(new Weapon(info), info);
  }
}

module.exports = Weapon;
