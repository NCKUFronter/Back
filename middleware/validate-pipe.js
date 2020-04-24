// @ts-check
/**
 * 依照 Joi Schema驗證並轉換body或params或query
 * 會取代原本的值，原本的會放到 req.body_origin, req.params_origin req.query_origin
 *
 * @param {'body' | 'params' | 'query'} position
 * @param {import('@hapi/joi').Schema} schema
 * @param {import('@hapi/joi').ValidationOptions=} options
 */
function validatePipe(position, schema, options) {
  return (req, res, next) => {
    const { error, value } = schema.validate(
      req[position],
      Object.assign({ abortEarly: false }, options)
    );
    if (error) {
      const error_msg = error.details.reduce((
        /** @type {any} */ result,
        item
      ) => {
        result[item.path[0]] = item.message;
        return result;
      }, {});
      res.status(400).send({ [position + "_schema_error"]: error_msg });
    } else {
      req[position + "_origin"] = req.body;
      req[position] = value;
      next();
    }
  };
}

module.exports = validatePipe;
