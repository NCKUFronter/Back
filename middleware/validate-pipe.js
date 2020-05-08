// @ts-check
const Joi = require("@hapi/joi");
const { AsyncJoiSchema } = require("../models/utils");
/**
 * 依照 Joi Schema驗證並轉換body或params或query
 * 會取代原本的值，原本的會放到 req.body_origin, req.params_origin req.query_origin
 *
 * @param {'body' | 'params' | 'query'} position
 * @param {import('@hapi/joi').Schema | AsyncJoiSchema} schema
 * @param {import('@hapi/joi').ValidationOptions=} options
 */
function validatePipe(position, schema, options) {
  return async (req, res, next) => {
    if (!options) options = { abortEarly: false };
    else options.abortEarly = false;

    if (!options.context) options.context = {};
    options.context.req = req;
    options.context.position = position;

    const { error, value } = await schema.validate(req[position], options);
    if (error) {
      const error_msg = Joi.isSchema(schema)
        ? error.details.reduce((/** @type {any} */ result, item) => {
            result[item.path[0]] = item.message;
            return result;
          }, {})
        : error;
      res.status(400).json({ [position + "_schema_error"]: error_msg });
    } else {
      req[position + "_origin"] = req.body;
      req[position] = value;
      next();
    }
  };
}

module.exports = validatePipe;
