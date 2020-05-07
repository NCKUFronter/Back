module.exports = {
  ...require("./user.actions"),
  ...require("./point.actions"),
  ...require("./invitation.actions"),
  ...require("./notification.service"),
  ...require("./coll-relation"),
};
