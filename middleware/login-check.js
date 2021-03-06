// @ts-check
const { collections, workInTransaction } = require("../models/mongo");

function loginCheck(coll) {
  return async (req, res, next) => {
    if (req.isAuthenticated()) {
      if (Array.isArray(req.user)) req.user = req.user[0];
      req.userId = req.user._id;
      next();
    } else if (coll == collections.record) {
      req.userId = req.cookies["connect.sid"];
      next();
    } else {
      res.status(401).send("User not logged in!");
    }
  };
}

module.exports = loginCheck;
