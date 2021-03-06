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
      .map((/** @type Bullet */ bullet) => bullet.serialize());
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

    // ---------- goods ----------
    // this.load.image("bambooDragonfly", "assets/objects/bamboo dragonfly.png");
    // this.load.image("glove", "assets/objects/glove.png");
    // this.load.image("black-hole", "assets/objects/black hole.png");
    // this.load.image("liftPotion", "assets/objects/LIFE.png");
    // this.load.image("wormHole", "assets/objects/wormhole.png");
    this.load.image("redGem", "assets/objects/reg gem.png");
    this.load.image("greenGem", "assets/objects/green gem.png");
    this.load.image("blueGem", "assets/objects/blue gem.png");
    this.load.image("yellowGem", "assets/objects/yellow gem.png");
    this.load.image("purpleGem", "assets/objects/purple gem.png");
    this.load.image("blackGem", "assets/objects/black diamond.png");

    // ---------- bullets ----------
    this.load.image("bullet-yellow", "assets/objects/yellow-bullet.png");
    this.load.image("bullet-green", "assets/objects/green-bullet.png");
    this.load.image("bullet-white", "assets/objects/white-bullet.png");
    this.load.image("bullet-blue", "assets/objects/blue-bullet.png");

    /*
    this.load.image("tile", "assets/tilesheet.png");
    this.load.image("tile2", "assets/transparent-bg-tiles.png");
    this.load.image("weitile", "assets/Spacepack 5.png");
    this.load.image("weitile2", "assets/Spacepack Floor 1.png");
    this.load.image("weitile3", "assets/Spacepack Floor 2.png");
    this.load.image("weitile4", "assets/outside.png");
    this.load.image("weitile5", "assets/trees_plants.png");
    this.load.tilemapTiledJSON("map", "assets/map2.json");
    this.load.tilemapTiledJSON("darkForest", "assets/darkForest.json");
    */

    this.load.image("spatile4", "assets/mapSpace/asteroid.png");
    this.load.image("spatile1", "assets/mapSpace/Nebula Aqua-Pink.png");
    this.load.image("spatile2", "assets/mapSpace/Spacepack 2.png");
    this.load.image("spatile3", "assets/mapSpace/Spacepack 4.png");
    this.load.tilemapTiledJSON("warSpace", "assets/mapSpace/warSpace.json");
    console.log("game preload success!");
  }

  create() {
    this.players = this.add.group({ runChildUpdate: true });
    this.bullets = this.add.group({ runChildUpdate: true });
    this.createBackground3();

    this.physics.world.setBounds(0, 0, 1920, 1920, true, true, true, true);
    this.physics.add.overlap(
      this.players,
      this.bullets,
      /** @param {Player} player; @param {Bullet} bullet */
      (player, bullet) => bullet.hurt(player)
    );
    this.game.events.emit("sceneCreated$", this);
  }

  createBackground3() {
    const map = this.make.tilemap({ key: "warSpace" });
    const tileset = map.addTilesetImage("Nebula Aqua-Pink", "spatile1");
    const tileset2 = map.addTilesetImage("Spacepack 2", "spatile2");
    const tileset3 = map.addTilesetImage("Spacepack 4", "spatile3");
    const tileset4 = map.addTilesetImage("asteroid", "spatile4");
    this.layer1 = map.createStaticLayer("background", tileset, 0, 0);
    this.layer2 = map.createStaticLayer("BASE", tileset2, 0, 0);
    this.layer3 = map.createStaticLayer("BASE2", tileset3, 0, 0);
    this.layer4 = map.createStaticLayer("asteroid", tileset4, 0, 0);
    this.layer1.setScale(1.5);
    this.layer2.setScale(1.5);
    this.layer3.setScale(1.5);
    this.layer4.setScale(1.5);
    this.layer2.setCollisionByExclusion([-1], true);
    this.layer3.setCollisionByExclusion([-1], true);
    this.layer4.setCollisionByExclusion([-1], true);
    this.physics.add.collider(this.layer4, this.players);
    this.physics.add.collider(this.layer2, this.players);
    this.physics.add.collider(this.layer3, this.players);
  }

  /*
  createBackground2() {
    const map = this.make.tilemap({ key: "darkForest" });
    const tileset = map.addTilesetImage("Spacepack 5", "weitile");
    this.layer3 = map.createStaticLayer("ship", tileset, 0, 0);
    this.layer3.setScale(1.5);
    this.layer3.setCollisionByExclusion([-1], true);
    this.physics.add.collider(this.layer3, this.players);
  }

  createBackground1() {
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("tilesheet", "tile");
    this.layer3 = map.createStaticLayer("collision", tileset, 0, 0);
    this.layer3.setScale(1.5);
    this.layer3.setCollisionByExclusion([-1], true);
    this.physics.add.collider(this.layer3, this.players);
  }
  */

  update() {
    for (const bullet of this.bullets.getChildren()) {
      // @ts-ignore
      if (this.layer3.tilemap.hasTileAtWorldXY(bullet.x, bullet.y)) bullet.destroy();
    }
  }
}

module.exports = MultiplayerScene;
