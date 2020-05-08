// @ts-check
const Joi = require("@hapi/joi");
const { AsyncJoi, AsyncValidationRule } = require("../actions/async-joi");

/**
 * @param {import('@hapi/joi').Schema} schema
 */
function JoiRequireWhen(schema) {
  return schema.when("$partial", {
    is: true,
    otherwise: Joi.required(),
  });
}

function setConvertEntity(req, position, field, entity) {
  if (!req["convert_from_" + position]) req["convert_from_" + position] = {};
  req["convert_from_" + position][field] = entity;
}

/**
 * @param {() => import('mongodb').Collection} collFn
 * @param {string} fieldInColl
 * @return {AsyncValidationRule}
 */
function existInDB(collFn, fieldInColl) {
  return {
    name: "existInDB",
    args: () => {
      return { coll: collFn(), fieldInColl };
    },
    validate: async (value, args, options) => {
      const req = options.req;
      const coll = args.coll;

      const entity = await coll.findOne({ [args.fieldInColl]: value });
      if (entity) {
        setConvertEntity(args.req, args.position, args.property, entity);
        return { value };
      }
      return {
        value,
        error: `${coll.collectionName} has no ${args.fieldInColl} = ${value}`,
      };
    },
  };
}

module.exports = {
  JoiRequireWhen,
  JoiNumberString: Joi.string().regex(/^[0-9]+/),
  existInDB,
  AsyncJoi,
  setConvertEntity,
};
