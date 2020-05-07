const collection = require("../models/mongo")

/**
 * @param {Date} nowDate
 * @param {Date} lastDate
 * @return any[]
 */

async function countDays(nowDate, lastDate, conDays) {
    const date = new Date()
    

    var diffTime = nowDate.getTime() - lastDate.getTime()
    var diffDate = diffTime / (1000 * 3600 * 24)
    var diff = (date.getTime() - nowDate.getTime()) / (1000 * 3600 * 24)
    if (diff < 1)
        return ;
    else {
        if (diffDate < 2) {
            console.log("conDays ++")
            conDays = conDays + 1;
        }
        else {
            console.log("n conDays")
            conDays = 1;
        }
    }

    console.log(diffDate);
    console.log(conDays)
}
module.exports = countDays