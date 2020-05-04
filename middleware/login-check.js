const { collections } = require("../models/mongo");

function loginCheck(coll) {
    return (req, res, next) => {
        if (req.isAuthenticated()) {
            const userId = req.user[0]._id;
            return userId;
        }
        else if (coll == collections.record){
            const userId = req.cookies['connect.sid'];
            return userId;
        }
        else {
            res.status(404).send("User not logged in!")
        }
    }
    
}

module.exports = loginCheck;