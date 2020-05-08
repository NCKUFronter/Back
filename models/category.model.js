// @ts-check
const Joi = require("@hapi/joi");
const { JoiRequireWhen } = require("./utils");

/**
 * @typedef CategoryDto
 * @property {string} name.required
 * @property {string[]} hashtags
 */
const CategorySchema = Joi.object({
  name: JoiRequireWhen(Joi.string()),
  hashtags: Joi.array().items(Joi.string()),
}).not({});

/**
 * @typedef Category
 * @property {string} _id.required
 * @property {string} name.required
 * @property {string} userId
 */
class CategoryModel {
  /** @type {string} */
  _id;

  /** @type {string} */
  name;

  /** @type {string} */
  userId;
}

module.exports = {
  CategorySchema,
  CategoryModel,
};
