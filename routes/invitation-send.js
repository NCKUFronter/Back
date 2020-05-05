const { collections } = require("../models/mongo");
const validatePipe = require("../middleware/validate-pipe");
const InvitationSchema = require("../models/invitation.model");
const { invite } = require("../actions/invitation.actions");

router.post("/",
  validatePipe("body", InvitationSchema),
  loginCheck(collections.invitation),
  function (req, res) {
    const ledger = await collections.ledger.findOne({ _id: req.body.ledgerId });
    const toUser = await collections.user.findOne({ email: req.body.email });
    invite(ledger, req.user, toUser);
  }
);