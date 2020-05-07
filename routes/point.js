const router = require("express").Router();
const {collections} = require("../models/mongo");
const loginCheck = require("../middleware/login-check")
const pointAction = require("../actions/point.actions")
const countDays = require("../actions/dateCount")

router.post("/transfer",loginCheck(collections.pointActivity),async function(req,res){

    const from = await collections.user.findOne({_id: '3'})
    const to = await collections.user.findOne({email: 'father@gmail.com'})

    pointAction.transferPoints('',100,from,to);
    
    console.log("transfer success")
    res.status(200);

});

router.post("/consume",loginCheck(collections.pointActivity),async function(req,res){
    const user = await collections.user.findOne({_id: '1'})
    const good = await collections.goods.findOne({_id: '2'})

    console.log(user,good);
    
    pointAction.consumePoints('',user,good);

    console.log("consume success");
    res.status(200);

})

router.post("/event", loginCheck(collections.pointActivity), async function (req, res) {
    
    const user = await collections.user.findOne({ _id: '1' });
    //console.log(user,user.logInDate, user.lastLogIn, user.conDays)
    const nowDate = user.logInDate
    const lastDate = user.lastLogIn
    //const nowday = user.logInDate.getTime();
    const conDays = user.conDays;
    console.log(user.conDays)
    const date = new Date()
    var diffTime = nowDate.getTime() - lastDate.getTime()
    var diffDate = diffTime / (1000 * 3600 * 24)
    var diff = (date.getTime() - nowDate.getTime()) / (1000 * 3600 * 24)
    console.log(diff)
    if (diff < 1)
        console.log("kkkkkkkkkkk")
    else {
        if (diffDate < 2) {
            console.log("conDays ++")
            user.conDays = user.conDays + 1;
        }
        else {
            console.log("n conDays")
            user.conDays = 1;
        }
    }
    if(user.conDays % 7 === 0){
        pointAction.pointsFromEvent('連續', 10, user)
    }

    collections.user.findOneAndUpdate({_id: '1'},{
        $set: 
        {
                conDays: conDays,
        }
    },function (err, result) {
        console.log("ok")
    })

    console.log(user.conDays)
    //const ;
    //countDays(user.logInDate, user.lastDate, user.conDays)

    pointAction.pointsFromEvent('每日', 10, user)
    console.log("Info: API point/event success")
    res.status(200)

})



module.exports = router;