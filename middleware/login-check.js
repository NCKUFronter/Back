const { collections } = require("../models/mongo");

function loginCheck(coll) {
    return (req, res, next) => {
        if (req.isAuthenticated()) {
            req.userId = req.user[0]._id;
            next()
        }
        else if (coll == collections.record){
            req.userId = req.cookies['connect.sid'];
            next()
        }
        else {
            res.status(404).send("User not logged in!")
        }
    }
}

module.exports = loginCheck;