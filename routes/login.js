// @ts-check
const { collections, fetchNextId } = require("../models/mongo");
const router = require("express").Router();
const { passportGoogle } = require("../middleware/passport-google")

router.get('/auth/google',
    passportGoogle.authenticate('google', { scope: ['profile'] }));

router.get('/auth/google/callback', 
  passportGoogle.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    res.send('Log In Success!');
});

module.exports = router;