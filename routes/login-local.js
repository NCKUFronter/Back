// @ts-check
const { collections, fetchNextId } = require("../models/mongo");
const router = require("express").Router();
const { passportLocal } = require("../middleware/passport-local")

router.post('/',
    // 'local' 會自己對應到 ../middleware/passport 的 require("passport-local") 的變數 即LocalStrategy的內容
    passportLocal.authenticate('local', {    
    successRedirect: '/user',           // 符合 uidd-db.user 的資料的話就 print 出來
    failureRedirect: '/login-local',          // 不符合就乖乖一直輸入
    session: false
    })
);

router.get('/', function(req, res, next) {
    passportLocal.authenticate('local', function(err, user, info) {
        if (err) return next(err);
        if (!user) return res.redirect('/');
        req.logIn(user, function(err) {
            if (err) return next(err);
            return res.redirect('/user/'+ user.username);
        });
    })(req, res, next);
})

module.exports = router;