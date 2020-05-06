// @ts-check
const Joi = require("@hapi/joi");
const { JoiRequireWhen } = require("./utils");

/**
 * @typedef CategoryDto
 * @property {string} name.required
 */
const CategorySchema = Joi.object({
  name: JoiRequireWhen(Joi.string()),
});

/**
 * @typedef Category
 * @property {string} _id.required
 * @property {string} name.required
 */
class CategoryModel {
  /** @type {string} */
  _id;

  /** @type {string} */
  name;
}

module.exports = {
  CategorySchema,
  CategoryModel,
};
