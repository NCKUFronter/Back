// @ts-check
const { collections, fetchNextId } = require("../models/mongo");
const router = require("express").Router();
const { passport } = require("../middleware/passport")

router.post('/',
    // 'local' 會自己對應到 ../middleware/passport 的 require("passport-local") 的變數 即LocalStrategy的內容
    passport.authenticate('local', {    
    successRedirect: '/user',           // 符合 uidd-db.user 的資料的話就 print 出來
    successFlash: 'Welcome!',
    failureRedirect: '/login',          // 不符合就乖乖一直輸入
    failureFlash: 'Invalid username or password.',
    session: false
    })
);

// router.get('/',
//     passport.authenticate('basic', {
//         session: false
//     }), function(req, res) {
//         res.json({ id: req.user.id, username: req.user.username });
// });

router.get('/', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) return next(err);
        if (!user) return res.redirect('/');
        req.logIn(user, function(err) {
            if (err) return next(err);
            return res.redirect('/user/'+ user.username);
        });
    })(req, res, next);
})

module.exports = router;