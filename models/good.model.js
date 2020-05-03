// @ts-check
const Joi = require("@hapi/joi");
const { JoiRequireWhen } = require("./utils");

const GoodSchema = Joi.object({
  name: JoiRequireWhen(Joi.string().regex(/[a-zA-Z]/)),
  
  point: JoiRequireWhen(Joi.number().min(0)),
}).not({});

class GoodModel {
  /** @type {string} */
  _id;

  /** @type {string} */
  name;

  /** @type {number} */
  point;
}

module.exports = {
  GoodSchema,
  GoodModel,
};
