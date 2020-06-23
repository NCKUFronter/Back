// @ts-check
const Joi = require("@hapi/joi");

const PositionSchema = Joi.object({
  x: Joi.number().required(),
  y: Joi.number().required(),
});

const MovingSchema = Joi.object({
  hp: Joi.number().required(),
  pos: PositionSchema,
  vel: PositionSchema,
});

const IdSchema = Joi.string().required();

const BulletMovingSchema = Joi.object({
  _id: Joi.string().required(),
  pos: PositionSchema,
});

const BulletSchema = Joi.object({
  x: Joi.number().required(),
  y: Joi.number().required(),
  key: Joi.string().required(),
  directionX: Joi.number().required(),
  directionY: Joi.number().required(),
  type: Joi.string().required(),
  speed: Joi.number().required(),
  atk: Joi.number(),
  heal: Joi.number(),
  poison: Joi.number(),
});

const BulletHurtSchema = Joi.object({
  bulletId: IdSchema,
  playerId: IdSchema,
  playerInfo: Joi.object({
    hp: Joi.number(),
  }),
});

module.exports = {
  PositionSchema,
  MovingSchema,
  BulletSchema,
  BulletMovingSchema,
  BulletHurtSchema,
  IdSchema,
};
