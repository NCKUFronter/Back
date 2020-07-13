"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

// @ts-check
var _require = require("../models/mongo"),
    collections = _require.collections,
    simpleInsertOne = _require.simpleInsertOne;

var validatePipe = require("../middleware/validate-pipe");

var _require2 = require("../models/invitation.model"),
    InvitationModel = _require2.InvitationModel,
    InvitationSchema = _require2.InvitationSchema,
    AnswerInvitationSchema = _require2.AnswerInvitationSchema;

var _require3 = require("../middleware/auth-guard"),
    getLedgerAuthGuard = _require3.getLedgerAuthGuard;

var checkParamsIdExists = require("../middleware/check-params-id-exists");

var _require4 = require("../actions/invitation.actions"),
    answerInvitation = _require4.answerInvitation;

var _require5 = require("../actions/notification.service"),
    notification = _require5.notification;

var loginCheck = require("../middleware/login-check");

var router = require("express-promise-router")["default"]();

router.post("/invite", validatePipe("body", InvitationSchema), loginCheck(collections.invitation), getLedgerAuthGuard(function (req) {
  return req.convert_from_body.ledgerId;
}), /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
    var ledger, fromUser, toUser, checkInvitation, invitation, result;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            ledger = req.convert_from_body.ledgerId; // await collections.ledger.findOne({ _id: req.body.ledgerId });

            fromUser = req.user;
            toUser = req.convert_from_body.email; // await collections.user.findOne({ email: req.body.email });
            // check no duplicate invitation

            _context.next = 5;
            return collections.invitation.findOne({
              ledgerId: ledger._id,
              toUserId: toUser._id,
              type: 2
            });

          case 5:
            checkInvitation = _context.sent;

            if (!(checkInvitation != null)) {
              _context.next = 8;
              break;
            }

            return _context.abrupt("return", res.status(400).json("user has been invited"));

          case 8:
            if (!(ledger.adminId != toUser._id && !ledger.userIds.includes(toUser._id))) {
              _context.next = 17;
              break;
            }

            invitation = new InvitationModel(ledger._id, fromUser._id, toUser._id);
            _context.next = 12;
            return simpleInsertOne(collections.invitation, invitation);

          case 12:
            result = _context.sent;
            // send notification
            notification.send(req, {
              type: "invitation",
              action: "invite",
              to: toUser,
              ledger: ledger
            }, [].concat((0, _toConsumableArray2["default"])(ledger.userIds), [toUser._id])); // @ts-ignore

            return _context.abrupt("return", res.status(200).json(result.ops[0]));

          case 17:
            return _context.abrupt("return", res.status(400).json("User already in ledger, no need to invite."));

          case 18:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
router.put("/:id/answer", validatePipe("body", AnswerInvitationSchema), loginCheck(collections.invitation), checkParamsIdExists(collections.invitation), /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(req, res) {
    var invitation;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            /** @type {InvitationModel} */
            invitation = req.convert_from_params.id;

            if (!(invitation.toUserId != req.userId)) {
              _context2.next = 3;
              break;
            }

            return _context2.abrupt("return", res.status(403).json("No access"));

          case 3:
            _context2.next = 5;
            return answerInvitation(req.convert_from_params.id, req.body.answer);

          case 5:
            // send notification
            notification.sendToLedgerUsers(req, {
              type: "invitation",
              action: "answer",
              invitation: invitation,
              body: req.body
            }, req.convert_from_params.id.ledgerId);
            res.status(200).json("Answer Success");

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
module.exports = router;