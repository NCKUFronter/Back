"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/** @typedef { { property: string; schema: AsyncJoiSchema; } } PropAsyncJoiScema */

/** @typedef { { self?: string[], prop?: {[key: string]: ValidateErrorType} } } ValidateErrorType */

/** @typedef { { error?: ValidateErrorType, value?: any, hasError?: boolean } } ValidateResult */

/** @typedef { import('@hapi/joi').ValidationOptions } JoiValidationOptions */

/** @typedef { import('@hapi/joi').Schema } JoiSchema */
// @ts-check
var Joi = require("@hapi/joi");

var AsyncValidationRule = function AsyncValidationRule() {
  (0, _classCallCheck2["default"])(this, AsyncValidationRule);
  (0, _defineProperty2["default"])(this, "name", void 0);
  (0, _defineProperty2["default"])(this, "args", void 0);
  (0, _defineProperty2["default"])(this, "validate", void 0);
};
/**
 * @param { AwaitPromisesResults<PropAsyncJoiScema, ValidateResult> } prop_results
 * @param { ValidateResult } oldResult
 * @return { ValidateResult }
 */


function mergePropPromisesResult(prop_results, oldResult) {
  if (prop_results.length === 0) return oldResult;
  var value = oldResult.value ? oldResult.value : {};
  var error = Object.assign(emptyError(), oldResult.error);
  var hasError = Boolean(oldResult.hasError);

  var _iterator = _createForOfIteratorHelper(prop_results),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var prop_result = _step.value;

      if (prop_result.result.value != null) {
        value[prop_result.item.property] = prop_result.result.value;
      }

      var prop_error = removeEmptyError(prop_result.result).error;

      if (prop_error) {
        error.prop[prop_result.item.property] = prop_error;
        hasError = true; // not sure
      }

      if (prop_result.result.hasError) hasError = true;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return {
    value: value,
    error: error,
    hasError: hasError
  };
}

function emptyError() {
  return {
    self: [],
    prop: {}
  };
}
/* --- for Joi --- */


function JoiErrorMessages(error) {
  if (!error) return [];
  return error.details.reduce(function (result, item) {
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
  var errors = oldResult.error.self ? oldResult.error.self : [];
  var joiresult = {
    value: oldResult.value
  };
  if (schema) joiresult = schema.validate(oldResult.value, options);
  errors.push.apply(errors, (0, _toConsumableArray2["default"])(JoiErrorMessages(joiresult.error)));
  return {
    error: {
      self: errors,
      prop: oldResult.error.prop
    },
    value: joiresult.value,
    hasError: oldResult.hasError || errors.length > 0
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
  if ((0, _typeof2["default"])(result.error) !== "object") return result;
  var error = result.error;
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
  if (data == null) return {
    value: data
  };
  var args = rule.args;
  if (typeof rule.args == "function") args = args();
  return rule.validate(data, _objectSpread(_objectSpread({}, args), options.context), options);
}

var joiAnySchema = Joi.any();
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

function awaitPromises(_x, _x2) {
  return _awaitPromises.apply(this, arguments);
}
/* --- AsyncJoiSchema --- */

/**
 * First: validate joi in property_schema
 * Second: validate async in property_schema
 * Third: validate joi_schema of all object
 */


function _awaitPromises() {
  _awaitPromises = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(arr, runFn) {
    var results, _iterator3, _step3, haspromise;

    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            /** @type { any[] } */
            results = arr.map(function (item) {
              return {
                item: item,
                result: runFn(item)
              };
            });
            _iterator3 = _createForOfIteratorHelper(results);
            _context4.prev = 2;

            _iterator3.s();

          case 4:
            if ((_step3 = _iterator3.n()).done) {
              _context4.next = 11;
              break;
            }

            haspromise = _step3.value;
            _context4.next = 8;
            return haspromise.result;

          case 8:
            haspromise.result = _context4.sent;

          case 9:
            _context4.next = 4;
            break;

          case 11:
            _context4.next = 16;
            break;

          case 13:
            _context4.prev = 13;
            _context4.t0 = _context4["catch"](2);

            _iterator3.e(_context4.t0);

          case 16:
            _context4.prev = 16;

            _iterator3.f();

            return _context4.finish(16);

          case 19:
            return _context4.abrupt("return", results);

          case 20:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[2, 13, 16, 19]]);
  }));
  return _awaitPromises.apply(this, arguments);
}

var AsyncJoiSchema = /*#__PURE__*/function () {
  /** @type { AsyncValidationRule[] } */

  /** @type { JoiSchema } */

  /** @type { PropAsyncJoiScema[] } */

  /** @type { { [key: string]: JoiSchema } } */

  /**
   * @param { any } prop_schema
   * @param { JoiSchema } joi_schema
   */
  function AsyncJoiSchema(prop_schema, joi_schema) {
    (0, _classCallCheck2["default"])(this, AsyncJoiSchema);
    (0, _defineProperty2["default"])(this, "_self_rules", []);
    (0, _defineProperty2["default"])(this, "_self_joi", void 0);
    (0, _defineProperty2["default"])(this, "_prop_async_schemas", []);
    (0, _defineProperty2["default"])(this, "_prop_joi_schema", null);
    if (prop_schema && (0, _typeof2["default"])(prop_schema) !== "object") throw "Second parameter of AsyncJoiSchema must be non-empty object";
    if (joi_schema && !Joi.isSchema(joi_schema)) throw "Second parameter of AsyncJoiSchema must be JoiSchema";
    this._self_joi = joi_schema;

    for (var key in prop_schema) {
      this._addPropertyRule(key, prop_schema[key]);
    }
  }
  /** @param { AsyncValidationRule } rule */


  (0, _createClass2["default"])(AsyncJoiSchema, [{
    key: "addRule",
    value: function addRule(rule) {
      this._self_rules.push(rule);

      return this;
    }
    /** @param {string} name
     * @param {any} schema
     */

  }, {
    key: "_addPropertyRule",
    value: function _addPropertyRule(name, schema) {
      if (!this._prop_joi_schema) this._prop_joi_schema = {};

      if (Joi.isSchema(schema)) {
        this._prop_joi_schema[name] = schema;
      } else if (schema instanceof AsyncJoiSchema) {
        this._prop_joi_schema[name] = schema._self_joi ? schema._self_joi : joiAnySchema;

        this._prop_async_schemas.push({
          property: name,
          schema: schema
        });
      } else throw "property schema must be JoiSchema or AsyncJoiSchema";
    }
    /**
     * @param { any } data
     * @param { JoiValidationOptions= } options
     * @return { Promise<ValidateResult> }
     */

  }, {
    key: "validate",
    value: function () {
      var _validate = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(data, options) {
        var result;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!options) options = {};
                if (!options.context) options.context = {};
                options.context.origin = data;
                /** @type { ValidateResult } */

                _context.next = 5;
                return this._validate_prop(data, options);

              case 5:
                result = _context.sent;
                result = mergeJoiValidation(this._self_joi, result, options);
                _context.next = 9;
                return this._validate_self(result, options);

              case 9:
                result = _context.sent;
                return _context.abrupt("return", result);

              case 11:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function validate(_x3, _x4) {
        return _validate.apply(this, arguments);
      }

      return validate;
    }()
    /**
     * @param { any } data
     * @param { JoiValidationOptions } options
     * @return { Promise<ValidateResult> }
     */

  }, {
    key: "_validate_prop",
    value: function () {
      var _validate_prop2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(data, options) {
        var async_results, result;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(this._prop_async_schemas.length == 0)) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt("return", {
                  value: data,
                  error: emptyError()
                });

              case 2:
                _context2.next = 4;
                return awaitPromises(this._prop_async_schemas, function (item) {
                  return item.schema._validate_prop(data[item.property], options);
                });

              case 4:
                async_results = _context2.sent;
                result = mergePropPromisesResult(async_results, {
                  value: data,
                  error: emptyError()
                });

                if (this._prop_joi_schema) {
                  result = mergeJoiValidation(Joi.object(this._prop_joi_schema), result, options);
                }

                if (!result.hasError) {
                  _context2.next = 9;
                  break;
                }

                return _context2.abrupt("return", removeEmptyError(result));

              case 9:
                _context2.next = 11;
                return awaitPromises(this._prop_async_schemas, function (item) {
                  options.context.property = item.property;
                  return item.schema._validate_self({
                    value: result.value[item.property],
                    error: result.error.prop[item.property]
                  }, options);
                });

              case 11:
                async_results = _context2.sent;
                return _context2.abrupt("return", mergePropPromisesResult(async_results, result));

              case 13:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _validate_prop(_x5, _x6) {
        return _validate_prop2.apply(this, arguments);
      }

      return _validate_prop;
    }()
    /**
     * @param { ValidateResult } oldResult
     * @param { JoiValidationOptions } options
     * @return { Promise<ValidateResult> }
     */

  }, {
    key: "_validate_self",
    value: function () {
      var _validate_self2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(oldResult, options) {
        var errors, value, _iterator2, _step2, rule, result;

        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!(this._self_rules.length == 0)) {
                  _context3.next = 2;
                  break;
                }

                return _context3.abrupt("return", removeEmptyError(oldResult));

              case 2:
                errors = oldResult.error && oldResult.error.self ? oldResult.error.self : [];
                value = oldResult.value;
                _iterator2 = _createForOfIteratorHelper(this._self_rules);
                _context3.prev = 5;

                _iterator2.s();

              case 7:
                if ((_step2 = _iterator2.n()).done) {
                  _context3.next = 16;
                  break;
                }

                rule = _step2.value;
                _context3.next = 11;
                return runRule(value, options, rule);

              case 11:
                result = _context3.sent;
                // @ts-ignore
                if (result.error) errors.push(result.error);
                value = result.value;

              case 14:
                _context3.next = 7;
                break;

              case 16:
                _context3.next = 21;
                break;

              case 18:
                _context3.prev = 18;
                _context3.t0 = _context3["catch"](5);

                _iterator2.e(_context3.t0);

              case 21:
                _context3.prev = 21;

                _iterator2.f();

                return _context3.finish(21);

              case 24:
                return _context3.abrupt("return", removeEmptyError({
                  value: value,
                  error: _objectSpread(_objectSpread({}, oldResult.error), {}, {
                    self: errors
                  }),
                  hasError: oldResult.hasError || errors.length > 0
                }));

              case 25:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[5, 18, 21, 24]]);
      }));

      function _validate_self(_x7, _x8) {
        return _validate_self2.apply(this, arguments);
      }

      return _validate_self;
    }()
  }]);
  return AsyncJoiSchema;
}();
/**
 * @param { any } prop_schema
 * @param { JoiSchema } joi_schema
 */


var AsyncJoi = {
  /** @param { JoiSchema } joi_schema */
  schema: function schema(joi_schema) {
    return new AsyncJoiSchema(null, joi_schema);
  },

  /**
   * @param { any } prop_schema
   * @param { JoiSchema= } joi_schema
   */
  object: function object(prop_schema, joi_schema) {
    return new AsyncJoiSchema(prop_schema, joi_schema);
  },
  empty: function empty() {
    return new AsyncJoiSchema(null, null);
  }
};
module.exports = {
  AsyncJoiSchema: AsyncJoiSchema,
  AsyncValidationRule: AsyncValidationRule,
  AsyncJoi: AsyncJoi
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