// @ts-check
const Player = require("./player");
const Props = require("./props");
const Skill = require("./skill");
const Weapon = require("./weapon");
const { deserializeObject } = require("../utils/function");
const ObjectMall = require("../utils/object.mall");

/** @template T */
class SimpleBagGroup {
  /** @param {Player} owner; @param {T[]} items */
  constructor(owner, items) {
    /** @type T[] */
    this.items = [];
    this.owner = owner;
    if (items != null) {
      for (const item of items) this.add(item);
    }
  }

  length() {
    return this.items.length;
  }

  add(obj) {
    obj.owner = this.owner;
    this.items.push(obj);
  }

  size() {
    return this.items.length;
  }

  clean() {
    this.items = [];
  }

  /** @param {number} idx; @return T */
  get(idx) {
    return this.items[idx];
  }

  /** @param {number | T} target; @return T */
  remove(target) {
    let idx;
    if (typeof target === "number") idx = target;
    else idx = this.items.indexOf(target);

    const item = this.items.splice(idx, 1)[0];
    return item;
  }

  /** @para {Player=} player */
  resetOwner(player) {
    // @ts-ignore
    for (const item of this.items) item.owner = player;
  }

  findObjectById(id) {
    // @ts-ignore
    return this.items.find((item) => item._id === id);
  }
}

/** @template T */
class AmountBagGroup extends SimpleBagGroup {
  /** @type Array<T & {amount: number; _id: string}> */ items;

  add(obj) {
    if (obj.amount === 0) return;

    obj.owner = this.owner;
    const bagItem = this.items.find((item) => item._id == obj._id);
    // @ts-ignore amount 可能不存在
    const amount = obj.amount || 1;
    if (bagItem) {
      bagItem.amount += amount;
    } else {
      obj.amount = amount;
      this.items.push(obj);
    }
  }

  size() {
    return this.items.reduce((sum, item) => (sum += item.amount), 0);
  }

  serialize(info = {}) {
    for (const item of this.items) {
      info[item._id] = item.amount;
    }
    return info;
  }
}

class Bag {
  // player: Player;
  // items: Set<Props>;
  /** @type {SimpleBagGroup<Skill>} */ skills;
  /** @type {AmountBagGroup<Weapon>} */ weapons;
  /** @type {AmountBagGroup<Props>} */ props;
  /** @type Phaser.Scene */ scene;
  /** @type Player */ player;

  /** @param {Player} player */
  constructor(player) {
    this.player = player;
    this.skills = new SimpleBagGroup(player, [
      Skill.deserialize(this, ObjectMall["xx1"]),
      Skill.deserialize(this, ObjectMall["xx2"]),
      Skill.deserialize(this, ObjectMall["xx3"]),
      Skill.deserialize(this, ObjectMall["xx4"]),
    ]);
    this.weapons = new AmountBagGroup(player, null);
    this.props = new AmountBagGroup(player, null);
  }

  /** @param {{ [id: string]: number }} objectQuantity */
  syncBag(objectQuantity) {
    if (!objectQuantity) return;

    this.weapons.clean();
    this.props.clean();
    for (const goodsId of Object.keys(objectQuantity)) {
      this._updateBag(goodsId, objectQuantity[goodsId]);
    }
  }

  /** @param {string} goodsId; @param {number} quantity */
  _updateBag(goodsId, quantity) {
    if (!ObjectMall[goodsId] || quantity === 0) return;
    const object_info = Object.assign({}, ObjectMall[goodsId]);
    if (quantity != null) object_info.amount = quantity;

    const object = deserializeObject(this, object_info);
    if (object.class_type === Weapon.name) {
      this.weapons.add(object);
    } else if (object.class_type === Props.name) {
      this.props.add(object);
    } else if (object.class_type === Skill.name) {
      this.skills.add(object);
    } else {
      console.error({ object });
    }
  }

  /** @param {Player=} player */
  resetOwner(player) {
    this.skills.resetOwner(player);
    this.weapons.resetOwner(player);
    this.props.resetOwner(player);
  }

  /** @param {string} goodsId; @param {number=} quantity */
  updateBag(goodsId, quantity) {
    if (!ObjectMall[goodsId]) return;
    this._updateBag(goodsId, quantity);
  }

  serialize() {
    const info = {};
    this.weapons.serialize(info);
    this.props.serialize(info);
    return info;
  }

  findObjectById(id) {
    let obj = this.skills.findObjectById(id);
    if (obj == null) obj = this.weapons.findObjectById(id);
    if (obj == null) obj = this.props.findObjectById(id);
    return obj;
  }
}

module.exports = Bag;
