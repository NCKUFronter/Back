"use strict";

// @ts-check
var Joi = require("@hapi/joi");

var RoleSettingSchema = Joi.object({
  name: Joi.string().max(15).required(),
  key: Joi.string().required()
});
var PositionSchema = Joi.object({
  x: Joi.number().required(),
  y: Joi.number().required()
});
var CursorsSchema = Joi.object({
  up: Joi["boolean"]().required(),
  down: Joi["boolean"]().required(),
  right: Joi["boolean"]().required(),
  left: Joi["boolean"]().required()
});
var MovingSchema = Joi.object({
  hp: Joi.number().required(),
  pos: PositionSchema,
  vel: PositionSchema
});
var IdSchema = Joi.string().required();
var BulletMovingSchema = Joi.object({
  _id: Joi.string().required(),
  pos: PositionSchema
});
var BulletSchema = Joi.object({
  fromObjectId: Joi.string().required(),
  x: Joi.number().required(),
  y: Joi.number().required(),
  key: Joi.string().required(),
  directionX: Joi.allow(-1).allow(0).allow(1).required(),
  directionY: Joi.allow(-1).allow(0).allow(1).required(),
  type: Joi.string().required(),
  speed: Joi.number().required(),
  atk: Joi.number(),
  heal: Joi.number(),
  poison: Joi.number()
});
var BulletHurtSchema = Joi.object({
  bulletId: IdSchema,
  playerId: IdSchema,
  playerInfo: Joi.object({
    hp: Joi.number()
  })
});
var FnSchema = Joi["function"]().required();
var MaybeFnSchema = Joi["function"]();
module.exports = {
  RoleSettingSchema: RoleSettingSchema,
  PositionSchema: PositionSchema,
  MovingSchema: MovingSchema,
  BulletSchema: BulletSchema,
  BulletMovingSchema: BulletMovingSchema,
  BulletHurtSchema: BulletHurtSchema,
  IdSchema: IdSchema,
  CursorsSchema: CursorsSchema,
  FnSchema: FnSchema,
  MaybeFnSchema: MaybeFnSchema
};
/**
 * @typedef Point
 * @property {number} x
 * @property {number} y
 */

/**
 * @ignore
 * @typedef PlayerInfo
 * @property {string} _id - socketId
 * @property {string} name
 * @property {string} key
 * @property {{[objectId: string]: number}} bag
 * @property {Point=} pos
 * @property {Point=} vel
 */

/**
 * @ignore
 * @typedef ShoppingInfo
 * @property {string} id - goodsId
 * @property {number} quantity
 */

/**
 * @ignore
 * @typedef PlayerMovingEvent
 * @property {number} time
 * @property {number} hp
 * @property {Point} pos
 * @property {Point} vel
 */

/**
 * @ignore
 * @typedef BulletInfo
 * @property {string} _id
 * @property {number} x
 * @property {number} y
 * @property {BulletType} type
 * @property {number} directionX
 * @property {number} directionY
 * @property {number} speed
 * @property {number=} atk
 * @property {number=} heal
 * @property {number=} poison
 */