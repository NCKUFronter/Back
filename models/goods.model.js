// @ts-check
const Joi = require("@hapi/joi");
const { JoiRequireWhen } = require("./utils");

const GoodsSchema = Joi.object({
  name: JoiRequireWhen(Joi.string().regex(/[a-zA-Z]/)),
  
  point: JoiRequireWhen(Joi.number().min(0)),
}).not({});

/**
 * "swagger model"
 * @typedef Goods
 * @property {string} _id
 * @property {string} name
 * @property {number} point
 */
class GoodsModel {
  /** @type {string} */
  _id;

  /** @type {string} */
  name;

  /** @type {number} */
  point;
}

module.exports = {
  GoodsSchema,
  GoodsModel,
};
