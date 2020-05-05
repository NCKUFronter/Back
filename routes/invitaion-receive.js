const { collections } = require("../models/mongo");
const validatePipe = require("../middleware/validate-pipe");
const InvitationSchema = require("../models/invitation.model");
const { answerInvitation } = require("../actions/invitation.actions");

router.post(
  "/",
  validatePipe("body", InvitationSchema),
  loginCheck(collections.invitation),
  function (req, res) {
    answerInvitation(collections.invitation, req.body);
    res.status(200).send("");
  }
);
