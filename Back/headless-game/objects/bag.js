"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// @ts-check
var Player = require("./player");

var Props = require("./props");

var Skill = require("./skill");

var Weapon = require("./weapon");

var _require = require("../utils/function"),
    deserializeObject = _require.deserializeObject;

var ObjectMall = require("../utils/object.mall");
/** @template T */


var SimpleBagGroup = /*#__PURE__*/function () {
  /** @param {Player} owner; @param {T[]} items */
  function SimpleBagGroup(owner, items) {
    (0, _classCallCheck2["default"])(this, SimpleBagGroup);

    /** @type T[] */
    this.items = [];
    this.owner = owner;

    if (items != null) {
      var _iterator = _createForOfIteratorHelper(items),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var item = _step.value;
          this.add(item);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }

  (0, _createClass2["default"])(SimpleBagGroup, [{
    key: "length",
    value: function length() {
      return this.items.length;
    }
  }, {
    key: "add",
    value: function add(obj) {
      obj.owner = this.owner;
      this.items.push(obj);
    }
  }, {
    key: "size",
    value: function size() {
      return this.items.length;
    }
  }, {
    key: "clean",
    value: function clean() {
      this.items = [];
    }
    /** @param {number} idx; @return T */

  }, {
    key: "get",
    value: function get(idx) {
      return this.items[idx];
    }
    /** @param {number | T} target; @return T */

  }, {
    key: "remove",
    value: function remove(target) {
      var idx;
      if (typeof target === "number") idx = target;else idx = this.items.indexOf(target);
      var item = this.items.splice(idx, 1)[0];
      return item;
    }
    /** @para {Player=} player */

  }, {
    key: "resetOwner",
    value: function resetOwner(player) {
      // @ts-ignore
      var _iterator2 = _createForOfIteratorHelper(this.items),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var item = _step2.value;
          item.owner = player;
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "findObjectById",
    value: function findObjectById(id) {
      // @ts-ignore
      return this.items.find(function (item) {
        return item._id === id;
      });
    }
  }]);
  return SimpleBagGroup;
}();
/** @template T */


var AmountBagGroup = /*#__PURE__*/function (_SimpleBagGroup) {
  (0, _inherits2["default"])(AmountBagGroup, _SimpleBagGroup);

  var _super = _createSuper(AmountBagGroup);

  function AmountBagGroup() {
    var _this;

    (0, _classCallCheck2["default"])(this, AmountBagGroup);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "items", void 0);
    return _this;
  }

  (0, _createClass2["default"])(AmountBagGroup, [{
    key: "add",
    value: function add(obj) {
      if (obj.amount === 0) return;
      obj.owner = this.owner;
      var bagItem = this.items.find(function (item) {
        return item._id == obj._id;
      }); // @ts-ignore amount 可能不存在

      var amount = obj.amount || 1;

      if (bagItem) {
        bagItem.amount += amount;
      } else {
        obj.amount = amount;
        this.items.push(obj);
      }
    }
  }, {
    key: "size",
    value: function size() {
      return this.items.reduce(function (sum, item) {
        return sum += item.amount;
      }, 0);
    }
  }, {
    key: "serialize",
    value: function serialize() {
      var info = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var _iterator3 = _createForOfIteratorHelper(this.items),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var item = _step3.value;
          info[item._id] = item.amount;
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      return info;
    }
  }]);
  return AmountBagGroup;
}(SimpleBagGroup);

var Bag = /*#__PURE__*/function () {
  // player: Player;
  // items: Set<Props>;

  /** @type {SimpleBagGroup<Skill>} */

  /** @type {AmountBagGroup<Weapon>} */

  /** @type {AmountBagGroup<Props>} */

  /** @type Phaser.Scene */

  /** @type Player */

  /** @param {Player} player */
  function Bag(player) {
    (0, _classCallCheck2["default"])(this, Bag);
    (0, _defineProperty2["default"])(this, "skills", void 0);
    (0, _defineProperty2["default"])(this, "weapons", void 0);
    (0, _defineProperty2["default"])(this, "props", void 0);
    (0, _defineProperty2["default"])(this, "scene", void 0);
    (0, _defineProperty2["default"])(this, "player", void 0);
    this.player = player;
    this.skills = new SimpleBagGroup(player, [Skill.deserialize(this, ObjectMall["xx1"]), Skill.deserialize(this, ObjectMall["xx2"]), Skill.deserialize(this, ObjectMall["xx3"]), Skill.deserialize(this, ObjectMall["xx4"])]);
    this.weapons = new AmountBagGroup(player, null);
    this.props = new AmountBagGroup(player, null);
  }
  /** @param {{ [id: string]: number }} objectQuantity */


  (0, _createClass2["default"])(Bag, [{
    key: "syncBag",
    value: function syncBag(objectQuantity) {
      if (!objectQuantity) return;
      this.weapons.clean();
      this.props.clean();

      for (var _i = 0, _Object$keys = Object.keys(objectQuantity); _i < _Object$keys.length; _i++) {
        var goodsId = _Object$keys[_i];

        this._updateBag(goodsId, objectQuantity[goodsId]);
      }
    }
    /** @param {string} goodsId; @param {number} quantity */

  }, {
    key: "_updateBag",
    value: function _updateBag(goodsId, quantity) {
      if (!ObjectMall[goodsId] || quantity === 0) return;
      var object_info = Object.assign({}, ObjectMall[goodsId]);
      if (quantity != null) object_info.amount = quantity;
      var object = deserializeObject(this, object_info);

      if (object.class_type === Weapon.name) {
        this.weapons.add(object);
      } else if (object.class_type === Props.name) {
        this.props.add(object);
      } else if (object.class_type === Skill.name) {
        this.skills.add(object);
      } else {
        console.error({
          object: object
        });
      }
    }
    /** @param {Player=} player */

  }, {
    key: "resetOwner",
    value: function resetOwner(player) {
      this.skills.resetOwner(player);
      this.weapons.resetOwner(player);
      this.props.resetOwner(player);
    }
    /** @param {string} goodsId; @param {number=} quantity */

  }, {
    key: "updateBag",
    value: function updateBag(goodsId, quantity) {
      if (!ObjectMall[goodsId]) return;

      this._updateBag(goodsId, quantity);
    }
  }, {
    key: "serialize",
    value: function serialize() {
      var info = {};
      this.weapons.serialize(info);
      this.props.serialize(info);
      return info;
    }
  }, {
    key: "findObjectById",
    value: function findObjectById(id) {
      var obj = this.skills.findObjectById(id);
      if (obj == null) obj = this.weapons.findObjectById(id);
      if (obj == null) obj = this.props.findObjectById(id);
      return obj;
    }
  }]);
  return Bag;
}();

module.exports = Bag;