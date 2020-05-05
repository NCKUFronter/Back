const router = require("express").Router();
const {collections} = require("../models/mongo");
const loginCheck = require("../middleware/login-check")
const pointAction = require("../actions/point.actions")

router.get("/transfer",loginCheck(collections.pointActivity),async function(req,res){

    const from = await collections.user.findOne({_id: '3'})
    const to = await collections.user.findOne({email: 'father@gmail.com'})

    pointAction.transferPoints('',100,from,to);
    
    console.log("transfer success")
    res.status(200);

});

router.get("/consume",loginCheck(collections.pointActivity),async function(req,res){
    const user = await collections.user.findOne({_id: '1'})
    const good = await collections.goods.findOne({_id: '2'})

    console.log(user,good);
    
    pointAction.consumePoints('',user,good);

    console.log("consume success");
    res.status(200);

})

router.get("/event", loginCheck(collections.pointActivity), async function (req, res) {
    
    const user = await collections.user.findOne({ _id: '1' });
    //const ;

    pointAction.pointsFromEvent('每日', 100, user)
    res.status(200)

})



module.exports = router;