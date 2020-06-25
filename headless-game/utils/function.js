// @ts-check
const Props = require("../objects/props");
const Weapon = require("../objects/weapon");
const Skill = require("../objects/skill");
const Bag = require('../objects/bag');

const ClassMapping = {
  [Props.name]: Props,
  [Skill.name]: Skill,
  [Weapon.name]: Weapon,
};

/**
 * @template T
 * @param {Bag} bag
 * @param {any} obj
 * @return {T}
 */
function deserializeObject(bag, obj) {
  const classType = ClassMapping[obj.class_type];
  return classType.deserialize(bag, obj);
}

module.exports = {
  ClassMapping,
  deserializeObject,
};
