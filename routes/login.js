// @ts-check
const router = require("express").Router();
const { AppPassport } = require("../middleware/app-passport");

router.get(
  "/auth/google",
  AppPassport.authenticate("google", { scope: [
    'profile', 'email'
] })
);

router.get(
  "/auth/google/callback",
  AppPassport.authenticate("google", { failureRedirect: "/" }),
  function (req, res) {
    res.send("Log In Success!");
  }
);

module.exports = router;
