// @ts-check
const Phaser = require("phaser");

class Role extends Phaser.Physics.Arcade.Sprite {
  /** @type string */ _id;
  /** @type number */ _hp = 100;
  /** @type {{[status: string]: boolean}} */ status = {};
  /** @type Phaser.Physics.Arcade.Collider */ collider = null;

  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    super(scene, x, y, null);
    this.setDisplaySize(32, 32);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // modify body
    this.setSize(16, 8).setOffset(8, 24);
  }

  /** @param {number} val */
  set hp(val) {
    if (val > 100) this._hp = 100;
    else if (val < 0) {
      this._hp = 0;
      this.dead();
    } else this._hp = val;
  }

  get hp() {
    return this._hp;
  }

  /** @param {any} event */
  animMovingTo(event) {
    this.x = event.pos.x;
    this.y = event.pos.y;
    this.setVelocityX(event.vel.x).setVelocityY(event.vel.y);
  }

  dead() {
    this.disableBody(true);
  }
}

module.exports = Role;
