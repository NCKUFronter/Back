// @ts-check
const router = require("express").Router();
const { AppPassport } = require("../middleware/app-passport");

router.post(
  "/login",
  AppPassport.authenticate("local", {
    session: true,
  }),
  (req, res) => {
    if (req.isAuthenticated()) {
      res.status(200).json("Login Successful!");
    } else {
      res.status(401).json("登入失敗! 帳號或密碼錯誤。");
    }
  }
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

router.post("/logout", function (req, res) {
  req.logout();
  res.status(200).json("Logout Success!");
});

module.exports = router;
