"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

// @ts-check
var _require = require("../models/utils"),
    setConvertEntity = _require.setConvertEntity;

function checkParamsIdExists(coll) {
  var paramIdField = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "id";
  return /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res, next) {
      var id, entity;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              id = req.params[paramIdField];

              if (id) {
                _context.next = 3;
                break;
              }

              return _context.abrupt("return", res.status(400).json("Id Not Exist"));

            case 3:
              _context.next = 5;
              return coll.findOne({
                _id: id
              });

            case 5:
              entity = _context.sent;

              if (entity) {
                _context.next = 10;
                break;
              }

              return _context.abrupt("return", res.status(404).json("".concat(coll.collectionName, " has no ").concat(paramIdField, " = ").concat(id)));

            case 10:
              setConvertEntity(req, "params", paramIdField, entity);
              next();

            case 12:
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

module.exports = checkParamsIdExists;