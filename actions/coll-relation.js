// @ts-check

/**
 * { Collection: { 欄位: 對應Collection } }
 * from: 對應Collection
 * localField = 欄位 + 'Id'
 * foreignField = '_id'
 * as = 欄位
 */
const relationMap = {
  ledger: {
    admin: { coll: "user" },
    users: {
      isMany: true,
      coll: "user",
      localField: "userIds",
      foreignField: "_id",
    },
    records: {
      isMany: true,
      coll: "record",
      localField: "_id",
      foreignField: "ledgerId",
    },
    invitees: {
      coll: "user",
      isMany: true,
      // prefix include '.'
      customLookup(prefix = "") {
        return {
          from: "invitation",
          let: { ledgerId: `$${prefix}_id` },
          pipeline: [
            {
              $match: { $expr: { $eq: ["$ledgerId", "$$ledgerId"] }, type: 2 },
            },
            {
              $lookup: {
                from: "user",
                localField: "toUserId",
                foreignField: "_id",
                as: "toUser",
              },
            },
            { $unwind: "$toUser" },
            { $replaceRoot: { newRoot: "$toUser" } },
          ],
          as: `${prefix}invitees`,
        };
      },
    },
  },
  invitation: {
    fromUser: { coll: "user" },
    toUser: { coll: "user" },
    ledger: { coll: "ledger" },
  },
  record: {
    category: { coll: "category" },
    ledger: { coll: "ledger" },
    user: { coll: "user" },
  },
  "point-activity": {
    fromUser: { coll: "user" },
    toUser: { coll: "user" },
    fromRecord: { coll: "record" },
    toGoods: { coll: "goods" },
  },
};

/**
 * @param {string} coll_name
 * @param {string} field
 */
function getRelation(coll_name, field) {
  return relationMap[coll_name] && relationMap[coll_name][field];
}

/**
 * @param {array} pipeline
 * @param {string} coll_name
 * @param {string} field
 */
function addRelationPipeline(pipeline, coll_name, field) {
  if (!field) return;

  // support nest relation (e.g. 'ledger.admin')
  let prefix = "";
  let dotIdx = field.indexOf(".");
  let relation = null;
  if (dotIdx > 0) {
    relation = getRelation(coll_name, field.slice(0, dotIdx));
    coll_name = relation && relation.coll;
    prefix = coll_name + ".";
    field = field.slice(dotIdx + 1);
  }
  relation = getRelation(coll_name, field);
  if (!relation) return;

  if (relation.customLookup)
    pipeline.push({ $lookup: relation.customLookup(prefix) });
  else {
    const lookup = {
      from: relation.coll,
      localField: prefix + (relation.localField || field + "Id"),
      foreignField: relation.foreignField || "_id",
      as: prefix + field,
    };
    pipeline.push({ $lookup: lookup });
  }

  if (!relation.isMany) {
    pipeline.push({
      $unwind: { path: "$" + prefix + field, preserveNullAndEmptyArrays: true },
    });
  }
}

/**
 * @param {string} coll_name
 * @param {string[] | string} oneToManyFields
 * @param {string[] | string} manyToManyFields
 * @return any[]
 */
function relationPipeline(coll_name, oneToManyFields, manyToManyFields) {
  const pipeline = [];
  if (!Array.isArray(oneToManyFields)) oneToManyFields = [oneToManyFields];
  if (!Array.isArray(manyToManyFields)) manyToManyFields = [manyToManyFields];
  const allFields = [...oneToManyFields, ...manyToManyFields];
  for (const field of allFields) {
    addRelationPipeline(pipeline, coll_name, field);
  }

  return pipeline;
}

/**
 * @param {import('mongodb').Collection} coll
 * @param {string} id
 * @param {string[] | string} [oneToManyFields]
 * @param {string[] | string} [manyToManyFields]
 * @return Promise<any[]>
 */
async function findOneWithRelation(
  coll,
  id,
  oneToManyFields,
  manyToManyFields
) {
  /** @type {any} */
  const pipeline = relationPipeline(
    coll.collectionName,
    oneToManyFields,
    manyToManyFields
  );
  pipeline.unshift({ $match: { _id: id } });
  return (await coll.aggregate(pipeline).toArray())[0];
}

/**
 * 對不是array的field進行relation
 * @param {import('mongodb').Collection} coll
 * @param {object} match
 * @param {string[] | string} [oneToManyFields]
 * @param {string[] | string} [manyToManyFields]
 * @return Promise<any[]>
 */
function findWithRelation(coll, match, oneToManyFields, manyToManyFields) {
  /** @type {any} */
  const pipeline = relationPipeline(
    coll.collectionName,
    oneToManyFields,
    manyToManyFields
  );
  if (match) {
    pipeline.unshift({ $match: match });
  }
  return coll.aggregate(pipeline).toArray();
}

module.exports = {
  findWithRelation,
  findOneWithRelation,
};
