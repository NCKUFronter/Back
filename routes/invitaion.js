// @ts-check
const { collections, simpleInsertOne } = require("../models/mongo");
const validatePipe = require("../middleware/validate-pipe");
const {
  InvitationModel,
  InvitationSchema,
  AnswerInvitationSchema,
} = require("../models/invitation.model");
const { getLedgerAuthGuard } = require("../middleware/auth-guard");
const checkParamsIdExists = require("../middleware/check-params-id-exists");
const { answerInvitation } = require("../actions/invitation.actions");
const { notification } = require("../actions/notification.service");
const loginCheck = require("../middleware/login-check");
const router = require("express-promise-router").default();

router.post(
  "/invite",
  validatePipe("body", InvitationSchema),
  loginCheck(collections.invitation),
  getLedgerAuthGuard((req) => req.convert_from_body.ledgerId),
  async function (req, res) {
    const ledger = req.convert_from_body.ledgerId; // await collections.ledger.findOne({ _id: req.body.ledgerId });
    const fromUser = req.user;
    const toUser = req.convert_from_body.email; // await collections.user.findOne({ email: req.body.email });

    // check no duplicate invitation
    const checkInvitation = await collections.invitation.findOne({
      ledgerId: ledger._id,
      toUserId: toUser._id,
      type: 2,
    });
    if (checkInvitation != null)
      return res.status(400).json("user has been invited");

    // check if user is already in ledger or not
    if (ledger.adminId != toUser._id && !ledger.userIds.includes(toUser._id)) {
      let invitation = new InvitationModel(
        ledger._id,
        fromUser._id,
        toUser._id
      );
      const result = await simpleInsertOne(collections.invitation, invitation);

      // send notification
      notification.send(
        req,
        { type: "invitation", action: "invite", to: toUser, ledger },
        [...ledger.userIds, toUser._id]
      );

      // @ts-ignore
      return res.status(200).json(result.ops[0]);
    } else {
      return res.status(400).json("User already in ledger, no need to invite.");
    }
  }
);

router.put(
  "/:id/answer",
  validatePipe("body", AnswerInvitationSchema),
  loginCheck(collections.invitation),
  checkParamsIdExists(collections.invitation),
  async function (req, res) {
    /** @type {InvitationModel} */
    const invitation = req.convert_from_params.id;

    if (invitation.toUserId != req.userId)
      return res.status(403).json("No access");

    await answerInvitation(req.convert_from_params.id, req.body.answer);

    // send notification
    notification.sendToLedgerUsers(
      req,
      {
        type: "invitation",
        action: "answer",
        invitation,
        body: req.body,
      },
      req.convert_from_params.id.ledgerId
    );

    res.status(200).json("Answer Success");
  }
);

module.exports = router;
