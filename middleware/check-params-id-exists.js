// @ts-check
const { setConvertEntity } = require("../models/utils");

function checkParamsIdExists(coll, paramIdField = "id") {
  return async function (req, res, next) {
    const id = req.params[paramIdField];
    if (!id) return res.status(400).json("Id Not Exist");
    const entity = await coll.findOne({ _id: id });

    if (!entity)
      return res
        .status(404)
        .json(`${coll.collectionName} has no ${paramIdField} = ${id}`);
    else {
      setConvertEntity(req, "params", paramIdField, entity);
      next();
    }
  };
}

module.exports = checkParamsIdExists;
