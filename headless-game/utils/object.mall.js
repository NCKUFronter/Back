const Skill = require("../objects/skill");
const Weapon = require("../objects/weapon");
const Props = require("../objects/props");

const ObjectMall = {
  xx1: {
    _id: "xx1",
    class_type: Skill.name,
    type: "skill",
    name: "攻擊子彈",
    key: "bullet-white",
    bulletCfg: {
      key: "bullet-white",
      type: "atk",
      speed: 500,
      atk: 1,
    },
    timeout: 300,
  },
  xx2: {
    _id: "xx2",
    class_type: Skill.name,
    type: "skill",
    name: "麻痺子彈",
    key: "bullet-blue",
    bulletCfg: {
      key: "bullet-blue",
      type: "paralysis",
      speed: 500,
      atk: 0,
      timeout: 5000,
    },
    timeout: 1500,
  },
  xx3: {
    _id: "xx3",
    class_type: Skill.name,
    type: "skill",
    name: "療癒子彈",
    key: "bullet-yellow",
    bulletCfg: {
      key: "bullet-yellow",
      type: "heal",
      speed: 500,
      heal: 1,
    },
    timeout: 300,
  },
  xx4: {
    _id: "xx4",
    class_type: Skill.name,
    type: "skill",
    name: "帶毒子彈",
    key: "bullet-green",
    bulletCfg: {
      key: "bullet-green",
      type: "poison",
      speed: 500,
      poison: 5,
    },
    timeout: 1500,
  },
  1: {
    _id: "1",
    class_type: Props.name,
    type: "props",
    name: "竹蜻蜓",
    key: "bambooDragonfly",
    intro: "角色移動速度加成3秒",
    _use() {
      this.owner.base_vel *= 2;
      this.owner.getScene().time.delayedCall(3000, () => {
        this.owner.base_vel /= 2;
      });
    },
  },
  "2": {
    _id: "2",
    class_type: Weapon.name,
    type: "weapon",
    name: "黑洞",
    // intro: "消滅黑洞附近所有敵人",
    key: "blackHole",
    bulletCfg: {
      key: "blackHole",
      type: "atk",
      speed: 1000,
      atk: 100,
    },
  },
  "3": {
    _id: "3",
    class_type: Props.name,
    type: "props",
    name: "蟲洞",
    intro: "隨機移動角色位置",
    key: "wormHole",
    // field: "hp",
    // value: 2,
    _use() {
      let not_avail = true;
      while (not_avail) {
        const x = Math.random() * 1900 + 16;
        const y = Math.random() * 1900 + 16;
        // @ts-ignore
        const map = this.scene.layer3.tilemap;
        if (!map.hasTileAtWorldXY(x, y)) {
          not_avail = false;
          this.owner.setPosition(x, y);
        }
      }
    },
  },
  "4": {
    _id: "4",
    class_type: Props.name,
    type: "props",
    name: "無限手套",
    intro: "畫面閃動特效1秒",
    key: "glove",
    _use() {
      // this.scene.cameras.main.shake(1000);
    },
  },
  "5": {
    _id: "5",
    class_type: Weapon.name,
    type: "weapon",
    name: "靈魂寶石",
    key: "blackGem",
    bulletCfg: {
      key: "blackGem",
      type: "heal",
      speed: 1500,
      heal: 3,
    },
  },
  "6": {
    _id: "6",
    class_type: Weapon.name,
    type: "weapon",
    name: "時間寶石",
    key: "greenGem",
    bulletCfg: {
      key: "greenGem",
      type: "paralysis",
      speed: 1000,
      timeout: 2000,
    },
  },
  "7": {
    _id: "7",
    class_type: Weapon.name,
    type: "weapon",
    name: "空間寶石",
    key: "blueGem",
    bulletCfg: {
      key: "blueGem",
      type: "paralysis",
      speed: 500,
      timeout: 5000,
    },
  },
  "8": {
    _id: "8",
    class_type: Weapon.name,
    type: "weapon",
    name: "心靈寶石",
    key: "yellowGem",
    bulletCfg: {
      key: "yellowGem",
      type: "heal",
      speed: 500,
      heal: 5,
    },
  },
  "9": {
    _id: "9",
    class_type: Weapon.name,
    type: "weapon",
    name: "現實寶石",
    key: "redGem",
    bulletCfg: {
      key: "redGem",
      type: "poison",
      speed: 1000,
      poison: 4,
    },
  },
  "10": {
    _id: "10",
    class_type: Weapon.name,
    type: "weapon",
    name: "力量寶石",
    key: "purpleGem",
    bulletCfg: {
      key: "purpleGem",
      type: "atk",
      speed: 500,
      atk: 8,
    },
  },
  "11": {
    _id: "11",
    class_type: Props.name,
    name: "生命藥水",
    type: "props",
    key: "liftPotion",
    intro: "hp加2",
    _use() {
      this.owner.hp += 2;
    },
  },
};

module.exports = ObjectMall;
