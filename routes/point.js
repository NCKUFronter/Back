const router = require("express").Router();
const {collections} = require("../models/mongo");
const loginCheck = require("../middleware/login-check")



router.get("/transfer",loginCheck(collections.pointActivity),function(req,res){
    console.log(req.userId)
    res.status(200);
});


module.exports = router;