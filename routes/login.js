// @ts-check
const router = require("express").Router();
const { AppPassport } = require("../middleware/app-passport");

router.get(
  "/auth/google",
  AppPassport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  AppPassport.authenticate("google", { failureRedirect: "/" }),
  function (req, res) {
    res.redirect("http://localhost:3000");
  }
);

router.post("/logout", function (req, res) {
  req.logout();
  res.status(200).json("Logout Success!");
});

module.exports = router;
