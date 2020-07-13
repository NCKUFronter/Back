"use strict";

// @ts-check
var router = require("express-promise-router")["default"]();

var _require = require("../middleware/app-passport"),
    AppPassport = _require.AppPassport;

router.get("/auth/google", // AppPassport.authenticate("google", { scope: ["profile", "email"] })
function (req, res, next) {
  req.body = {
    email: "father@gmail.com",
    password: "0000"
  };
  next();
}, AppPassport.authenticate("local", {
  session: true
}), function (req, res) {
  res.redirect("/login/callback");
});
/*
router.get(
  "/auth/google/callback",
  AppPassport.authenticate("google", { failureRedirect: "/" }),
  function (req, res) {
    res.redirect("/login/callback");
  }
);
*/

router.post("/logout", function (req, res) {
  req.logout();
  res.status(200).json("Logout Success!");
});
module.exports = router;