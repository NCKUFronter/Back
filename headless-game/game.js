// @ts-check
require("@geckos.io/phaser-on-nodejs");
const Phaser = require("phaser");
const MultiplayerScene = require("./multiplayer-scene");
const path = require("path");

// main game configuration
/** @type Phaser.Types.Core.GameConfig */
const config = {
  type: Phaser.HEADLESS,
  width: 1280,
  height: 1280,
  banner: false,
  audio: { noAudio: true },
  physics: { default: "arcade" },
  scene: MultiplayerScene,
  loader: {
    baseURL: path.resolve(process.env.GAME_PREFIX || "../Game/"),
  },
};

class Game extends Phaser.Game {
  constructor() {
    super(config);
  }
}

module.exports = Game;
