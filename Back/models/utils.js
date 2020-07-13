"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

// @ts-check
var Joi = require("@hapi/joi");

var _require = require("../actions/async-joi"),
    AsyncJoi = _require.AsyncJoi,
    AsyncValidationRule = _require.AsyncValidationRule;
/**
 * @param {import('@hapi/joi').Schema} schema
 */


function JoiRequireWhen(schema) {
  return schema.when("$partial", {
    is: true,
    otherwise: Joi.required()
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
    args: function args() {
      return {
        coll: collFn(),
        fieldInColl: fieldInColl
      };
    },
    validate: function () {
      var _validate = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(value, args, options) {
        var req, coll, entity;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                req = options.req;
                coll = args.coll;
                _context.next = 4;
                return coll.findOne((0, _defineProperty2["default"])({}, args.fieldInColl, value));

              case 4:
                entity = _context.sent;

                if (!entity) {
                  _context.next = 8;
                  break;
                }

                setConvertEntity(args.req, args.position, args.property, entity);
                return _context.abrupt("return", {
                  value: value
                });

              case 8:
                return _context.abrupt("return", {
                  value: value,
                  error: "".concat(coll.collectionName, " has no ").concat(args.fieldInColl, " = ").concat(value)
                });

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function validate(_x, _x2, _x3) {
        return _validate.apply(this, arguments);
      }

      return validate;
    }()
  };
}

module.exports = {
  JoiRequireWhen: JoiRequireWhen,
  JoiNumberString: Joi.string().regex(/^[0-9]+/),
  existInDB: existInDB,
  AsyncJoi: AsyncJoi,
  setConvertEntity: setConvertEntity
};