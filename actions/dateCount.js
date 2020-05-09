const collection = require("../models/mongo");

/**
 * @param {Date} nowDate
 * @param {Date} lastDate
 * @return any[]
 */
function countDays(nowDate, lastDate, conDays) {
  let nextLastDate = new Date(lastDate);
  nextLastDate.setDate(lastDate.getDate() + 1);

  if (nowDate.toDateString() === lastDate.toDateString()) {
    return conDays;
  } else if (nextLastDate.toDateString() === nowDate.toDateString()) {
    return conDays + 1;
  }
  return 1;
}

/*
function countDays(nowDate, lastDate, conDays) {
  let date = new Date();
  var diffTime = nowDate.getTime() - lastDate.getTime();
  var diffDate = diffTime / (1000 * 3600 * 24);
  var diff = (date.getTime() - nowDate.getTime()) / (1000 * 3600 * 24);
  if (diff < 1) return;
  else {
    if (diffDate < 2) {
      console.log("conDays ++");
      conDays = conDays + 1;
    } else {
      console.log("n conDays");
      conDays = 1;
    }
  }

  console.log(diffDate);
  console.log(conDays);
}
*/

module.exports = countDays;
