"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

// @ts-check
var Joi = require("@hapi/joi");

var _require = require("../models/utils"),
    AsyncJoiSchema = _require.AsyncJoiSchema;
/**
 * 依照 Joi Schema驗證並轉換body或params或query
 * 會取代原本的值，原本的會放到 req.body_origin, req.params_origin req.query_origin
 *
 * @param {'body' | 'params' | 'query'} position
 * @param {import('@hapi/joi').Schema | AsyncJoiSchema} schema
 * @param {import('@hapi/joi').ValidationOptions=} options
 */


function validatePipe(position, schema, options) {
  return /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
      var _yield$schema$validat, error, value, error_msg;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!options) options = {
                abortEarly: false
              };else options.abortEarly = false;
              if (!options.context) options.context = {};
              options.context.req = req;
              options.context.position = position;
              _context.next = 6;
              return schema.validate(req[position], options);

            case 6:
              _yield$schema$validat = _context.sent;
              error = _yield$schema$validat.error;
              value = _yield$schema$validat.value;

              if (error) {
                error_msg = Joi.isSchema(schema) ? error.details.reduce(function (
                /** @type {any} */
                result, item) {
                  result[item.path[0]] = item.message;
                  return result;
                }, {}) : error;
                res.status(400).json((0, _defineProperty2["default"])({}, position + "_schema_error", error_msg));
              } else {
                req[position + "_origin"] = req.body;
                req[position] = value;
                next();
              }

            case 10:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }();
}

module.exports = validatePipe;