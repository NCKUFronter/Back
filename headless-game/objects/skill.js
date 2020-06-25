// @ts-check
const Player = require("./player");
const Bullet = require("./bullet");
const Bag = require("./bag");

/**
 * @typedef SkillParams
 * @property {Phaser.Scene} scene
 * @property {import('./bullet').BulletConfig} bulletCfg
 * @property {Bag} bag
 * @property {number} timeout
 */

class Skill {
  /** @type string */ _id;
  /** @type Player */ owner;
  /** @type {import('./bullet').BulletConfig} */ bulletCfg;
  /** @type number */ timeout;

  /** @param {SkillParams} params */
  constructor(params) {
    Object.assign(this, params); // 偷懶方式
    this.active = true;
  }

  canUse() {
    // 可能因為冷卻時間，而不能使用技能
    if (this.owner) return this.owner.active && this.active;
    else return this.active;
  }

  /** @param {string=} uuid */
  use(uuid) {
    return this.fire(uuid);
  }

  /** @param {string=} uuid */
  fire(uuid) {
    if (!this.canUse()) return;
    if (this.owner) this._fire(uuid);
  }

  // for multiplayer scene
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

    if (this.timeout) {
      this.active = false;
      setTimeout(() => (this.active = true), this.timeout);
    }
  }

  /**
   * @param {Bag} bag
   * @param {any} obj
   * @return Skill
   */
  static deserialize(bag, obj) {
    const info = Object.assign({}, obj);
    info.bag = bag;
    return Object.assign(new Skill(info), info);
  }
}

module.exports = Skill;
