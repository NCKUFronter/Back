"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// @ts-check

/**
 * { Collection: { 欄位: 對應Collection } }
 * from: 對應Collection
 * localField = 欄位 + 'Id'
 * foreignField = '_id'
 * as = 欄位
 */
var relationMap = {
  ledger: {
    admin: {
      coll: "user"
    },
    users: {
      isMany: true,
      coll: "user",
      localField: "userIds",
      foreignField: "_id"
    },
    records: {
      isMany: true,
      coll: "record",
      localField: "_id",
      foreignField: "ledgerId"
    },
    invitees: {
      coll: "user",
      isMany: true,
      // prefix include '.'
      customLookup: function customLookup() {
        var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
        return {
          from: "invitation",
          "let": {
            ledgerId: "$".concat(prefix, "_id")
          },
          pipeline: [{
            $match: {
              $expr: {
                $eq: ["$ledgerId", "$$ledgerId"]
              },
              type: 2
            }
          }, {
            $lookup: {
              from: "user",
              localField: "toUserId",
              foreignField: "_id",
              as: "toUser"
            }
          }, {
            $unwind: "$toUser"
          }, {
            $replaceRoot: {
              newRoot: "$toUser"
            }
          }],
          as: "".concat(prefix, "invitees")
        };
      }
    }
  },
  invitation: {
    fromUser: {
      coll: "user"
    },
    toUser: {
      coll: "user"
    },
    ledger: {
      coll: "ledger"
    }
  },
  record: {
    category: {
      coll: "category"
    },
    ledger: {
      coll: "ledger"
    },
    user: {
      coll: "user"
    }
  },
  "point-activity": {
    fromUser: {
      coll: "user"
    },
    toUser: {
      coll: "user"
    },
    fromRecord: {
      coll: "record"
    },
    toGoods: {
      coll: "goods"
    }
  }
};
/**
 * @param {string} coll_name
 * @param {string} field
 */

function getRelation(coll_name, field) {
  return relationMap[coll_name] && relationMap[coll_name][field];
}
/**
 * @param {array} pipeline
 * @param {string} coll_name
 * @param {string} field
 */


function addRelationPipeline(pipeline, coll_name, field) {
  if (!field) return; // support nest relation (e.g. 'ledger.admin')

  var prefix = "";
  var dotIdx = field.indexOf(".");
  var relation = null;

  if (dotIdx > 0) {
    relation = getRelation(coll_name, field.slice(0, dotIdx));
    coll_name = relation && relation.coll;
    prefix = coll_name + ".";
    field = field.slice(dotIdx + 1);
  }

  relation = getRelation(coll_name, field);
  if (!relation) return;
  if (relation.customLookup) pipeline.push({
    $lookup: relation.customLookup(prefix)
  });else {
    var lookup = {
      from: relation.coll,
      localField: prefix + (relation.localField || field + "Id"),
      foreignField: relation.foreignField || "_id",
      as: prefix + field
    };
    pipeline.push({
      $lookup: lookup
    });
  }

  if (!relation.isMany) {
    pipeline.push({
      $unwind: {
        path: "$" + prefix + field,
        preserveNullAndEmptyArrays: true
      }
    });
  }
}
/**
 * @param {string} coll_name
 * @param {string[] | string} oneToManyFields
 * @param {string[] | string} manyToManyFields
 * @return any[]
 */


function relationPipeline(coll_name, oneToManyFields, manyToManyFields) {
  var pipeline = [];
  if (!Array.isArray(oneToManyFields)) oneToManyFields = [oneToManyFields];
  if (!Array.isArray(manyToManyFields)) manyToManyFields = [manyToManyFields];
  var allFields = [].concat((0, _toConsumableArray2["default"])(oneToManyFields), (0, _toConsumableArray2["default"])(manyToManyFields));

  var _iterator = _createForOfIteratorHelper(allFields),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var field = _step.value;
      addRelationPipeline(pipeline, coll_name, field);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return pipeline;
}
/**
 * @param {import('mongodb').Collection} coll
 * @param {string} id
 * @param {string[] | string} [oneToManyFields]
 * @param {string[] | string} [manyToManyFields]
 * @return Promise<any[]>
 */


function findOneWithRelation(_x, _x2, _x3, _x4) {
  return _findOneWithRelation.apply(this, arguments);
}
/**
 * 對不是array的field進行relation
 * @param {import('mongodb').Collection} coll
 * @param {object} match
 * @param {string[] | string} [oneToManyFields]
 * @param {string[] | string} [manyToManyFields]
 * @return Promise<any[]>
 */


function _findOneWithRelation() {
  _findOneWithRelation = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(coll, id, oneToManyFields, manyToManyFields) {
    var pipeline;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            /** @type {any} */
            pipeline = relationPipeline(coll.collectionName, oneToManyFields, manyToManyFields);
            pipeline.unshift({
              $match: {
                _id: id
              }
            });
            _context.next = 4;
            return coll.aggregate(pipeline).toArray();

          case 4:
            return _context.abrupt("return", _context.sent[0]);

          case 5:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _findOneWithRelation.apply(this, arguments);
}

function findWithRelation(coll, match, oneToManyFields, manyToManyFields) {
  /** @type {any} */
  var pipeline = relationPipeline(coll.collectionName, oneToManyFields, manyToManyFields);

  if (match) {
    pipeline.unshift({
      $match: match
    });
  }

  return coll.aggregate(pipeline).toArray();
}

module.exports = {
  findWithRelation: findWithRelation,
  findOneWithRelation: findOneWithRelation
};