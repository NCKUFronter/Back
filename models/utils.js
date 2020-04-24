// @ts-check
const Joi = require("@hapi/joi");

/**
 * @param {import('@hapi/joi').Schema} schema
 */
function JoiRequireWhen(schema) {
  return schema.when("$partial", {
    is: true,
    otherwise: Joi.required(),
  });
}

module.exports = {
  JoiRequireWhen,
};
