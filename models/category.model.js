// @ts-check
const Joi = require("@hapi/joi");
const { JoiRequireWhen } = require("./utils");

/**
 * @typedef CategoryDto
 * @property {string} name.required
 * @property {string[]} hashtags
 * @property {string} color.required - 顏色只接受hex 6碼 - example: #aabbcc
 * @property {string} icon.required
 */
const CategorySchema = Joi.object({
  name: JoiRequireWhen(Joi.string()),
  hashtags: Joi.array().items(Joi.string()),
  color: JoiRequireWhen(Joi.string().regex(/^#[0-9A-Fa-f]{6}$/)),
  icon: JoiRequireWhen(Joi.string()),
}).not({});

/**
 * @typedef Category
 * @property {string} _id.required
 * @property {string} name.required
 * @property {string} userId
 * @property {string} color.required - - example: #aabbcc
 * @property {string} icon.required
 */
class CategoryModel {
  /** @type {string} */
  _id;

  /** @type {string} */
  name;

  /** @type {string} */
  userId;

  /** @type {string} */
  color;

  /** @type {string} */
  icon;
}

module.exports = {
  CategorySchema,
  CategoryModel,
};
