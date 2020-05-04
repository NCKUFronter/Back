function collRelation (currentColl, fromColl, localField, foreignField, asField) {
    currentColl.aggregate([
        { $lookup: { from: fromColl, localField: localField, foreignField: foreignField, as: asField } }
    ]).toArray((err, result) => {
       res.status(200).send(result);
    })
}

module.exports = collRelation;