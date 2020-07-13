"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

// @ts-check
var _require = require("../models/mongo"),
    collections = _require.collections,
    fetchNextId = _require.fetchNextId,
    simpleInsertOne = _require.simpleInsertOne,
    workInTransaction = _require.workInTransaction;

var _require2 = require("../models/category.model"),
    CategorySchema = _require2.CategorySchema;

var checkParamsIdExists = require("../middleware/check-params-id-exists");

var validatePipe = require("../middleware/validate-pipe");

var loginCheck = require("../middleware/login-check");

var router = require("express-promise-router")["default"](); // 假設已經 connectDB


var category_coll = collections.category; // GET from database

router.get("/", function (req, res, next) {
  category_coll.find(req.query) // .sort({ categoryId: 1 })
  .toArray(function (err, result) {
    if (err) next(err);else res.status(200).send(result);
  });
}); // GET certain data from database

router.get("/:id", function (req, res, next) {
  var getData = {
    _id: req.params.id
  };
  category_coll.findOne(getData, function (err, result) {
    if (err) next(err);else res.status(200).send(result);
  });
}); // Post the info

router.post("/", validatePipe("body", CategorySchema), loginCheck(category_coll), /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", workInTransaction( /*#__PURE__*/function () {
              var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(session) {
                var _req$body, hashtags, cate_dto, result;

                return _regenerator["default"].wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _req$body = req.body, hashtags = _req$body.hashtags, cate_dto = (0, _objectWithoutProperties2["default"])(_req$body, ["hashtags"]);
                        cate_dto.userId = req.userId;
                        _context.next = 4;
                        return simpleInsertOne(collections.category, cate_dto, session);

                      case 4:
                        result = _context.sent;

                        if (!req.body.hashtags) {
                          _context.next = 8;
                          break;
                        }

                        _context.next = 8;
                        return collections.user.updateOne({
                          _id: req.userId
                        }, {
                          $set: (0, _defineProperty2["default"])({}, "categoryTags.".concat(result.insertedId), req.body.hashtags)
                        });

                      case 8:
                        res.status(201).json(result.ops[0]);

                      case 9:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function (_x3) {
                return _ref2.apply(this, arguments);
              };
            }()));

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}()); // PUT to update certain row info

/*
router.put("/:id", validatePipe("body", CategorySchema), function (req, res) {
  const putFilter = {
    _id: req.params.id,
  };
  const putData = {
    $set: req.body,
  };

  category_coll.findOneAndUpdate(
    putFilter,
    putData,
    { returnOriginal: false },
    function (err, result) {
      if (err) throw err;
      console.log("1 document updated");
      res.status(200).send(result.value);
    }
  );
});
*/
// PATCH to update certain row info

router.patch("/:id", validatePipe("body", CategorySchema, {
  context: {
    partial: true
  }
}), loginCheck(category_coll), checkParamsIdExists(category_coll), function (req, res) {
  var category = req.convert_from_params.id;

  if (category.userId == null && req.body.name != null && req.body.name != category.name) {
    return res.status(403).json("Cannot rename default category");
  }

  if (category.userId != null && category.userId !== req.userId) return res.status(403).json("No access");
  return workInTransaction( /*#__PURE__*/function () {
    var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(session) {
      var _req$body2, hashtags, cate_dto;

      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _req$body2 = req.body, hashtags = _req$body2.hashtags, cate_dto = (0, _objectWithoutProperties2["default"])(_req$body2, ["hashtags"]);

              if (!(Object.keys(cate_dto).length !== 0)) {
                _context3.next = 4;
                break;
              }

              _context3.next = 4;
              return collections.category.updateOne({
                _id: req.params.id
              }, {
                $set: cate_dto
              }, {
                session: session
              });

            case 4:
              if (!req.body.hashtags) {
                _context3.next = 7;
                break;
              }

              _context3.next = 7;
              return collections.user.updateOne({
                _id: req.userId
              }, {
                $set: (0, _defineProperty2["default"])({}, "categoryTags.".concat(req.params.id), hashtags)
              }, {
                session: session
              });

            case 7:
              res.status(200).json("update success");

            case 8:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function (_x4) {
      return _ref3.apply(this, arguments);
    };
  }());
  /*
  const patchFilter = { _id: req.params.id };
  const patchData = {
    $set: req.body,
  };
   category_coll.findOneAndUpdate(
    patchFilter,
    patchData,
    { returnOriginal: false },
    function (err, result) {
      if (err) throw err;
      console.log("1 document updated");
      res.status(200).send(result.value);
    }
  );
  */
}); // DELETE certain row

router["delete"]("/:id", loginCheck(category_coll), checkParamsIdExists(category_coll), /*#__PURE__*/function () {
  var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(req, res) {
    var category;
    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            category = req.convert_from_params.id;

            if (!(category.userId !== req.userId)) {
              _context5.next = 3;
              break;
            }

            return _context5.abrupt("return", res.status(403).json("No access"));

          case 3:
            _context5.next = 5;
            return workInTransaction( /*#__PURE__*/function () {
              var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(session) {
                var cate_prom, user_prom;
                return _regenerator["default"].wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        cate_prom = collections.category.deleteOne({
                          _id: req.params.id
                        }, {
                          session: session
                        });
                        user_prom = collections.user.updateOne({
                          _id: req.userId
                        }, {
                          $unset: (0, _defineProperty2["default"])({}, "categoryTags.".concat(req.params.id), "")
                        }, {
                          session: session
                        });
                        _context4.next = 4;
                        return Promise.all([cate_prom, user_prom]);

                      case 4:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, _callee4);
              }));

              return function (_x7) {
                return _ref5.apply(this, arguments);
              };
            }());

          case 5:
            res.status(200).json("Delete row: " + req.params.id + " from db Successfully!");
            /*
            const deleteFilter = {
              _id: req.params.id,
            };
            category_coll.deleteOne(deleteFilter, (err, result) => {
              console.log(
                `Delete row: ${req.params.id} with filter: ${deleteFilter}. Deleted: ${result.result.n}`
              );
              res
                .status(200)
                .send("Delete row: " + req.params.id + " from db Successfully!");
            });
            */

          case 6:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function (_x5, _x6) {
    return _ref4.apply(this, arguments);
  };
}());
module.exports = router;