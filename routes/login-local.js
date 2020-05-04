// @ts-check
const router = require("express").Router();
const { AppPassport } = require("../middleware/app-passport");

router.post(
  "/",
  AppPassport.authenticate("local", {
    successRedirect: "/user",
    failureRedirect: "/login-local",
    session: true,
  })
);

router.get("/", function (req, res, next) {
  AppPassport.authenticate("local", function (err, user, info) {
    if (err) return next(err);
    if (!user) return res.redirect("/");
    req.logIn(user, function (err) {
      if (err) return next(err);
      return res.redirect("/user/" + user.email);
    });
  })(req, res, next);
});

module.exports = router;
