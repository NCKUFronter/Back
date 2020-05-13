/** @typedef { { property: string; schema: AsyncJoiSchema; } } PropAsyncJoiScema */
/** @typedef { { self?: string[], prop?: {[key: string]: ValidateErrorType} } } ValidateErrorType */
/** @typedef { { error?: ValidateErrorType, value?: any, hasError?: boolean } } ValidateResult */
/** @typedef { import('@hapi/joi').ValidationOptions } JoiValidationOptions */
/** @typedef { import('@hapi/joi').Schema } JoiSchema */
// @ts-check
const Joi = require("@hapi/joi");

class AsyncValidationRule {
  /** @type { string } */
  name;

  /** @type { any } */
  args;

  /** @type { (value, args, options) => Promise<{error?: string, value: any}> } */
  validate;
}

/**
 * @param { AwaitPromisesResults<PropAsyncJoiScema, ValidateResult> } prop_results
 * @param { ValidateResult } oldResult
 * @return { ValidateResult }
 */
function mergePropPromisesResult(prop_results, oldResult) {
  if (prop_results.length === 0) return oldResult;

  const value = oldResult.value ? oldResult.value : {};
  const error = Object.assign(emptyError(), oldResult.error);
  let hasError = Boolean(oldResult.hasError);

  for (const prop_result of prop_results) {
    if (prop_result.result.value != null) {
      value[prop_result.item.property] = prop_result.result.value;
    }
    const prop_error = removeEmptyError(prop_result.result).error;
    if (prop_error) {
      error.prop[prop_result.item.property] = prop_error;
      hasError = true; // not sure
    }
    if (prop_result.result.hasError) hasError = true;
  }

  return { value, error, hasError };
}

function emptyError() {
  return { self: [], prop: {} };
}

/* --- for Joi --- */
function JoiErrorMessages(error) {
  if (!error) return [];
  return error.details.reduce((result, item) => {
    result.push(item.message);
    return result;
  }, []);
}

/**
 * @param { JoiSchema } schema
 * @param { ValidateResult } oldResult
 * @param { JoiValidationOptions } options
 */
function mergeJoiValidation(schema, oldResult, options) {
  if (!schema) return oldResult;

  let errors = oldResult.error.self ? oldResult.error.self : [];
  let joiresult = { value: oldResult.value };

  if (schema) joiresult = schema.validate(oldResult.value, options);
  errors.push(...JoiErrorMessages(joiresult.error));

  return {
    error: {
      self: errors,
      prop: oldResult.error.prop,
    },
    value: joiresult.value,
    hasError: oldResult.hasError || errors.length > 0,
  };
}

function isEmpty(obj) {
  return Object.keys(obj).length == 0;
}

/**
 * @param { ValidateResult } result
 * @return { ValidateResult }
 */
function removeEmptyError(result) {
  if (!result.error) return result;
  if (typeof result.error !== "object") return result;
  const error = result.error;

  if (error.self && error.self.length == 0) delete error.self;
  if (error.prop && isEmpty(error.prop)) delete error.prop;
  if (!error.self && !error.prop) delete result.error;

  return result;
}

/**
 * @param { any } data
 * @param { JoiValidationOptions } options
 * @param { AsyncValidationRule } rule
 */
function runRule(data, options, rule) {
  if (data == null) return { value: data };
  let args = rule.args;
  if (typeof rule.args == "function") args = args();
  return rule.validate(data, { ...args, ...options.context }, options);
}

const joiAnySchema = Joi.any();

/**
 * @template T, V
 * @typedef { { item: T; result: V }[] } AwaitPromisesResults<T,V>
 */
/**
 * @template T, V
 * @param { Array<T> } arr
 * @param { (item: T) => Promise<V> } runFn
 * @return { Promise<AwaitPromisesResults<T,V>> }
 */
async function awaitPromises(arr, runFn) {
  /** @type { any[] } */
  const results = arr.map((item) => ({ item, result: runFn(item) }));
  for (const haspromise of results) {
    haspromise.result = await haspromise.result;
  }
  return results;
}

/* --- AsyncJoiSchema --- */
/**
 * First: validate joi in property_schema
 * Second: validate async in property_schema
 * Third: validate joi_schema of all object
 */
class AsyncJoiSchema {
  /** @type { AsyncValidationRule[] } */
  _self_rules = [];
  /** @type { JoiSchema } */
  _self_joi;

  /** @type { PropAsyncJoiScema[] } */
  _prop_async_schemas = [];
  /** @type { { [key: string]: JoiSchema } } */
  _prop_joi_schema = null;

  /**
   * @param { any } prop_schema
   * @param { JoiSchema } joi_schema
   */
  constructor(prop_schema, joi_schema) {
    if (prop_schema && typeof prop_schema !== "object")
      throw "Second parameter of AsyncJoiSchema must be non-empty object";
    if (joi_schema && !Joi.isSchema(joi_schema))
      throw "Second parameter of AsyncJoiSchema must be JoiSchema";

    this._self_joi = joi_schema;
    for (const key in prop_schema) {
      this._addPropertyRule(key, prop_schema[key]);
    }
  }

  /** @param { AsyncValidationRule } rule */
  addRule(rule) {
    this._self_rules.push(rule);
    return this;
  }

  /** @param {string} name
   * @param {any} schema
   */
  _addPropertyRule(name, schema) {
    if (!this._prop_joi_schema) this._prop_joi_schema = {};

    if (Joi.isSchema(schema)) {
      this._prop_joi_schema[name] = schema;
    } else if (schema instanceof AsyncJoiSchema) {
      this._prop_joi_schema[name] = schema._self_joi
        ? schema._self_joi
        : joiAnySchema;
      this._prop_async_schemas.push({ property: name, schema });
    } else throw "property schema must be JoiSchema or AsyncJoiSchema";
  }

  /**
   * @param { any } data
   * @param { JoiValidationOptions= } options
   * @return { Promise<ValidateResult> }
   */
  async validate(data, options) {
    if (!options) options = {};
    if (!options.context) options.context = {};
    options.context.origin = data;

    /** @type { ValidateResult } */
    let result = await this._validate_prop(data, options);
    result = mergeJoiValidation(this._self_joi, result, options);
    result = await this._validate_self(result, options);
    return result;
  }

  /**
   * @param { any } data
   * @param { JoiValidationOptions } options
   * @return { Promise<ValidateResult> }
   */
  async _validate_prop(data, options) {
    if (this._prop_async_schemas.length == 0)
      return { value: data, error: emptyError() };
    let async_results = await awaitPromises(this._prop_async_schemas, (item) =>
      item.schema._validate_prop(data[item.property], options)
    );
    let result = mergePropPromisesResult(async_results, {
      value: data,
      error: emptyError(),
    });

    if (this._prop_joi_schema) {
      result = mergeJoiValidation(
        Joi.object(this._prop_joi_schema),
        result,
        options
      );
    }

    if (result.hasError) return removeEmptyError(result);
    async_results = await awaitPromises(this._prop_async_schemas, (item) => {
      options.context.property = item.property;
      return item.schema._validate_self(
        {
          value: result.value[item.property],
          error: result.error.prop[item.property],
        },
        options
      );
    });
    return mergePropPromisesResult(async_results, result);
  }

  /**
   * @param { ValidateResult } oldResult
   * @param { JoiValidationOptions } options
   * @return { Promise<ValidateResult> }
   */
  async _validate_self(oldResult, options) {
    if (this._self_rules.length == 0) return removeEmptyError(oldResult);

    let errors =
      oldResult.error && oldResult.error.self ? oldResult.error.self : [];
    let value = oldResult.value;
    for (const rule of this._self_rules) {
      const result = await runRule(value, options, rule);
      // @ts-ignore
      if (result.error) errors.push(result.error);
      value = result.value;
    }

    return removeEmptyError({
      value,
      error: { ...oldResult.error, self: errors },
      hasError: oldResult.hasError || errors.length > 0,
    });
  }
}

/**
 * @param { any } prop_schema
 * @param { JoiSchema } joi_schema
 */
const AsyncJoi = {
  /** @param { JoiSchema } joi_schema */
  schema(joi_schema) {
    return new AsyncJoiSchema(null, joi_schema);
  },
  /**
   * @param { any } prop_schema
   * @param { JoiSchema= } joi_schema
   */
  object(prop_schema, joi_schema) {
    return new AsyncJoiSchema(prop_schema, joi_schema);
  },

  empty() {
    return new AsyncJoiSchema(null, null);
  },
};

module.exports = {
  AsyncJoiSchema,
  AsyncValidationRule,
  AsyncJoi,
};
/*
 new AsyncJoiSchema(joi1, {
  a: new AsyncJoiSchema(joi2, {
    b: new AsyncJoiSchema(joi3)
    c: joi4
  },)
 })

 1. {b: joi3, c: joi4}
 2. b: async
 3. { a: joi2 }
 4. a: async
 5. joi1

 // reverse
  await a.propertyschema
*/
