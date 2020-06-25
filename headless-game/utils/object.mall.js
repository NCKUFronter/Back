const Skill = require("../objects/skill");
const Weapon = require("../objects/weapon");
const Props = require("../objects/props");

const ObjectMall = {
  xx1: {
    _id: "xx1",
    class_type: Skill.name,
    type: "skill",
    name: "攻擊子彈",
    key: "bullet",
    bulletCfg: {
      key: "bullet",
      type: "atk",
      speed: 500,
      atk: 1,
    },
    timeout: 0,
  },
  xx2: {
    _id: "xx2",
    class_type: Skill.name,
    type: "skill",
    name: "麻痺子彈",
    key: "paralysis",
    bulletCfg: {
      key: "",
      type: "paralysis",
      speed: 500,
      atk: 0,
      timeout: 5000,
    },
    timeout: 0,
  },
  xx3: {
    _id: "xx3",
    class_type: Skill.name,
    type: "skill",
    name: "療癒子彈",
    key: "heal",
    bulletCfg: {
      key: "star",
      type: "heal",
      speed: 500,
      heal: 1,
    },
    timeout: 0,
  },
  xx4: {
    _id: "xx4",
    class_type: Skill.name,
    type: "skill",
    name: "帶毒子彈",
    key: "bullet",
    bulletCfg: {
      key: "bomb",
      type: "poison",
      speed: 500,
      poison: 5,
    },
    timeout: 0,
  },
  1: {
    _id: "1",
    class_type: Props.name,
    type: "props",
    name: "竹蜻蜓",
    key: "",
    intro: "角色移動速度加成30秒",
    /** @type {(this:Props) => void} */
    _use() {
      console.log("custom use");
    },
  },
  "2": {
    _id: "2",
    class_type: Weapon.name,
    type: "weapon",
    name: "黑洞",
    intro: "消滅黑洞附近所有敵人",
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
    intro: "切換場景",
    key: "",
    /** @type {(this:Props) => void} */
    _use() {
      console.log("custom use goods3");
    },
  },
  "4": {
    _id: "4",
    class_type: Props.name,
    type: "props",
    name: "無限手套",
    intro: "畫面閃動特效3秒",
    key: "",
    /** @type {(this:Props) => void} */
    _use() {
      console.log("custom use goods4");
    },
  },
  "5": {
    _id: "5",
    class_type: Weapon.name,
    type: "weapon",
    name: "靈魂寶石",
    key: "",
    bulletCfg: {
      key: "",
      type: "atk",
      speed: 1000,
      atk: 100,
    },
  },
  "6": {
    _id: "6",
    class_type: Weapon.name,
    type: "weapon",
    name: "時間寶石",
    key: "",
    bulletCfg: {
      key: "",
      type: "poison",
      speed: 1000,
      atk: 5,
    },
  },
  "7": {
    _id: "7",
    class_type: Weapon.name,
    type: "weapon",
    name: "空間寶石",
    key: "",
    bulletCfg: {
      key: "",
      type: "paralysis",
      speed: 1000,
      atk: 0,
    },
  },
  "8": {
    _id: "8",
    class_type: Weapon.name,
    type: "weapon",
    name: "心靈寶石",
    key: "",
    bulletCfg: {
      key: "",
      type: "atk",
      speed: 1000,
      atk: 100,
    },
  },
  "9": {
    _id: "9",
    class_type: Weapon.name,
    type: "weapon",
    name: "現實寶石",
    key: "",
    bulletCfg: {
      key: "",
      type: "atk",
      speed: 1000,
      atk: 100,
    },
  },
  "10": {
    _id: "10",
    class_type: Weapon.name,
    type: "weapon",
    name: "力量寶石",
    key: "",
    bulletCfg: {
      key: "",
      type: "atk",
      speed: 1000,
      atk: 100,
    },
  },
  "11": {
    _id: "11",
    class_type: Props.name,
    name: "生命藥水",
    type: "props",
    key: "dude",
    field: "hp",
    value: "2",
    amount: 50,
    intro: "hp加2",
  },
};

module.exports = ObjectMall;
