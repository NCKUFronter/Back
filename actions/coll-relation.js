// @ts-check

/**
 * { Collection: { 欄位: 對應Collection } }
 * from: 對應Collection
 * localField = 欄位 + 'Id'
 * foreignField = '_id'
 * as = 欄位
 */
const oneToManyMap = {
  ledger: {
    admin: "user",
  },
  invitation: {
    fromUser: "user",
    toUser: "user",
    ledger: "ledger",
  },
  record: {
    category: "category",
    ledger: "ledger",
    user: "user",
  },
  pointActivity: {
    fromUser: "user",
    toUser: "user",
    fromRecord: "record",
    toGoods: "goods",
  },
};

const manyToManyMap = {
  ledger: {
    users: { coll: "user", localField: "userIds", foreignField: "_id" },
    records: { coll: "record", localField: "_id", foreignField: "ledgerId" },
  },
};

/**
 * @param {string} coll_name
 * @param {string[] | string} oneToManyFields
 * @param {string[] | string} manyToManyFields
 * @return any[]
 */
function relationPipeline(coll_name, oneToManyFields, manyToManyFields) {
  const pipeline = [];

  const one_map = oneToManyFields && oneToManyMap[coll_name];
  console.log(one_map);
  if (one_map) {
    if (!Array.isArray(oneToManyFields)) oneToManyFields = [oneToManyFields];
    for (const field of oneToManyFields) {
      const relation_coll = one_map[field];
      if (!relation_coll) continue;
      pipeline.push({
        $lookup: {
          from: relation_coll,
          localField: field + "Id",
          foreignField: "_id",
          as: field,
        },
      });
      pipeline.push({
        $unwind: { path: "$" + field, preserveNullAndEmptyArrays: true },
      });
    }
  }

  const many_map = manyToManyFields && manyToManyMap[coll_name];
  if (many_map) {
    if (!Array.isArray(manyToManyFields)) manyToManyFields = [manyToManyFields];
    for (const field of manyToManyFields) {
      const relation = many_map[field];
      if (!relation) continue;
      pipeline.push({
        $lookup: {
          from: relation.coll,
          localField: relation.localField,
          foreignField: "_id",
          as: field,
        },
      });
    }
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
