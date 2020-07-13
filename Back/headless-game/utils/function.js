"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _ClassMapping;

// @ts-check
var Props = require("../objects/props");

var Weapon = require("../objects/weapon");

var Skill = require("../objects/skill");

var Bag = require('../objects/bag');

var ClassMapping = (_ClassMapping = {}, (0, _defineProperty2["default"])(_ClassMapping, Props.name, Props), (0, _defineProperty2["default"])(_ClassMapping, Skill.name, Skill), (0, _defineProperty2["default"])(_ClassMapping, Weapon.name, Weapon), _ClassMapping);
/**
 * @template T
 * @param {Bag} bag
 * @param {any} obj
 * @return {T}
 */

function deserializeObject(bag, obj) {
  var classType = ClassMapping[obj.class_type];
  return classType.deserialize(bag, obj);
}

module.exports = {
  ClassMapping: ClassMapping,
  deserializeObject: deserializeObject
};