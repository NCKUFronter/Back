// @ts-check
const router = require("express-promise-router").default();
const { collections } = require("../models/mongo");
const { AppPassport } = require("../middleware/app-passport");
const loginCheck = require("../middleware/login-check");
const { pointsFromEvent } = require("../actions/point.actions");

router.post(
  "/login",
  AppPassport.authenticate("local", {
    session: true,
  }),
  async (req, res) => {
    if (req.isAuthenticated()) {
      res.status(200).json("Login Successful!");
    } else {
      res.status(401).json("登入失敗! 帳號或密碼錯誤。");
    }
  }
);

router.post("/pointCheck", loginCheck(collections.user), async (req, res) => {
  const result = {};
  const userUpdate = { $set: { lastLogin: new Date() } };

  if (req.user.lastLogin != null) {
    const lastLogin = new Date(req.user.lastLogin);
    const now = userUpdate.$set.lastLogin;
    let nextLastDate = new Date(lastLogin);
    nextLastDate.setDate(lastLogin.getDate() + 1);

    if (now.toDateString() === lastLogin.toDateString()) {
      // do nothing
    } else if (nextLastDate.toDateString() === now.toDateString()) {
      // every day login
      await pointsFromEvent("perLogin", 10, req.user);
      result.perLogin = 10;
      userUpdate.$inc = { conDays: 1 };

      if (req.user.conDays % 7 === 6) {
        await pointsFromEvent("continueLogin", 10, req.user);
        result.continueLogin = 10;
      }
    } else {
      // every day login
      await pointsFromEvent("perLogin", 10, req.user);
      result.perLogin = 10;
      userUpdate.$set.conDays = 1;
    }
  } else {
    // every day login
    await pointsFromEvent("perLogin", 10, req.user);
    result.perLogin = 10;
    userUpdate.$set.conDays = 1;
  }

  await collections.user.updateOne({ _id: req.userId }, userUpdate);

  res.status(200).json(result);
});

/*
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
*/

router.post("/logout", function (req, res) {
  req.logout();
  res.status(200).json("Logout Success!");
});

module.exports = router;
