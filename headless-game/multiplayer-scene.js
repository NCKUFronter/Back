// @ts-check
const Phaser = require("phaser");
const Player = require("./objects/player");
const Bullet = require("./objects/bullet");

class MultiplayerScene extends Phaser.Scene {
  /** @type Phaser.GameObjects.Group */ bullets;
  /** @type Phaser.GameObjects.Group */ players;

  constructor() {
    super({
      key: "multiplayer",
      active: false,
      cameras: null,
    });
  }

  serializePlayers(detail = false) {
    return this.players
      .getChildren()
      .map((/** @type Player */ player) => player.info(detail));
  }

  serializeBullets() {
    return this.bullets
      .getChildren()
      .map((/** @type Bullet */ bullet) => bullet.info());
  }

  /**
   * @param {import('../models/event.model').PlayerInfo} info
   * @param {import('./objects/bag')} bag
   * @return Player
   */
  createPlayer(info, bag) {
    const new_player = new Player(
      { scene: this, x: 900, y: 600, key: info.key, hp: 100 },
      bag
    );
    new_player._id = info._id;
    new_player.name = info.name;
    new_player.setCollideWorldBounds(true, 0, 0);
    new_player.on("bullet$", this.bulletCreated, this);
    this.physics.add.collider(new_player, this.players);
    this.players.add(new_player);

    return new_player;
  }

  /** @param {Bullet} bullet */
  bulletCreated(bullet) {
    this.bullets.add(bullet);
  }

  preload() {
    // 子彈圖片(因為大小不統一)與地圖圖片必要
    this.load.image("sky", "assets/sky.png");
    this.load.image("bullet", "assets/bullet.png");
    this.load.image("blackHole", "assets/blackHole.png");
    this.load.image("bomb", "assets/bomb.png");
    this.load.image("star", "assets/star.png");
    this.load.image("tile", "assets/tilesheet.png");
    this.load.image("tile2", "assets/transparent-bg-tiles.png");
    this.load.image("weitile", "assets/Spacepack 5.png");
    this.load.image("weitile2", "assets/Spacepack Floor 1.png");
    this.load.image("weitile3", "assets/Spacepack Floor 2.png");
    this.load.image("weitile4", "assets/outside.png");
    this.load.image("weitile5", "assets/trees_plants.png");
    this.load.tilemapTiledJSON("map", "assets/map2.json");
    this.load.tilemapTiledJSON("darkForest", "assets/darkForest.json");
    console.log("game preload success!");
  }

  create() {
    this.createBackground1();
    this.players = this.add.group({ runChildUpdate: true });
    this.bullets = this.add.group({ runChildUpdate: true });

    this.physics.world.setBounds(0, 0, 1920, 1920, true, true, true, true);
    this.physics.add.collider(this.layer3, this.players);
    this.physics.add.overlap(
      this.players,
      this.bullets,
      /** @param {Player} player; @param {Bullet} bullet */
      (player, bullet) => bullet.hurt(player)
    );
    this.game.events.emit("sceneCreated$", this);
  }

  createBackground2() {
    const map = this.make.tilemap({ key: "darkForest" });
    const tileset = map.addTilesetImage("Spacepack 5", "weitile");
    this.layer3 = map.createStaticLayer("ship", tileset, 0, 0);
    this.layer3.setScale(1.5);
    this.layer3.setCollisionByExclusion([-1], true);
  }

  createBackground1() {
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("tilesheet", "tile");
    this.layer3 = map.createStaticLayer("collision", tileset, 0, 0);
    this.layer3.setScale(1.5);
    this.layer3.setCollisionByExclusion([-1], true);
  }

  update() {
    for (const bullet of this.bullets.getChildren()) {
      // @ts-ignore
      if (this.layer3.hasTileAtWorldXY(bullet.x, bullet.y)) bullet.destroy();
    }
  }
}

module.exports = MultiplayerScene;
