// @ts-check
const Props = require("../objects/props");
const Weapon = require("../objects/Weapon");
const Skill = require("../objects/skill");

const ClassMapping = {
  [Props.name]: Props,
  [Skill.name]: Skill,
  [Weapon.name]: Weapon,
};

/**
 * @template T
 * @param {any} obj
 * @return {T}
 */
function deserializeObject(obj) {
  const classType = ClassMapping[obj.class_type];
  return classType.deserialize(obj);
}

module.exports = {
  ClassMapping,
  deserializeObject,
};
