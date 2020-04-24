// @ts-check
const Joi = require("@hapi/joi");
const { JoiRequireWhen } = require("./utils");

const CategorySchema = Joi.object({
  name: JoiRequireWhen(Joi.string()),
});

class CategoryModel {
  /** @type {number} */
  _id;

  /** @type {string} */
  name;
}

module.exports = {
  CategorySchema,
  CategoryModel,
};
