// @ts-check
const Role = require("./role");
const Bag = require("./bag");

/**
 * @typedef ImageParams
 * @property {Phaser.Scene} scene
 * @property {number} x
 * @property {number} y
 * @property {string} key
 * @property {number} hp
 */

class Player extends Role {
  /** @type {number} */ directionX = 0;
  /** @type {number} */ directionY = -1;
  /** @type {string} */ playerId;
  /** @type {string} */ key;
  /** @type {Bag} */ bag;

  cursors = {
    up: false,
    down: false,
    right: false,
    left: false,
  };

  bulletTypeCount = 0;

  /** @param {ImageParams} params; @param {Bag=} bag */
  constructor(params, bag) {
    super(params.scene, params.x, params.y);
    this.hp = params.hp;
    this.key = params.key;
    if (bag) {
      this.bag = bag;
      bag.resetOwner(this);
    } else this.bag = new Bag(this);
  }

  getScene() {
    return this.scene;
  }

  /** @param {number=} time */
  update(time) {
    if(!this.active) return;
    if (!this.status.paralysis) this.handleMoving();
  }

  base_vel = 160;
  handleMoving() {
    const factorX = Number(this.cursors.right) - Number(this.cursors.left);
    const factorY = Number(this.cursors.up) - Number(this.cursors.down);
    this.setVelocityX(factorX * this.base_vel);
    this.setVelocityY(-factorY * this.base_vel);
    if(factorX != 0 || factorY != 0) {
      this.directionX = factorX;
      this.directionY = factorY;
    }
  }

  info(detail = false) {
    const info = {
      status: this.status,
      active: this.active,
      time: Date.now(),
      hp: this.hp,
      _id: this._id,
      directionX: this.directionX,
      directionY: this.directionY,
      pos: {
        x: this.x,
        y: this.y,
      },
      vel: {
        x: this.body.velocity.x,
        y: this.body.velocity.y,
      },
    };

    if (detail) {
      info.name = this.name;
      info.key = this.key;
    }

    return info;
  }
}

module.exports = Player;
