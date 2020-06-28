// @ts-check
const { fetchNextId, collections } = require("../models/mongo");
const validatePipe = require("../middleware/validate-pipe");
const loginCheck = require("../middleware/login-check");
const { StatisticQuerySchema } = require("../models/statistic.model");
const router = require("express-promise-router").default();

const avail_coll = ["ledger", "user", "category"];
function getEntityName(name, coll_prefix = "", non_coll_prefix = "") {
  if (name === "ledger") return coll_prefix + "ledgerName";
  else if (avail_coll.includes(name)) return coll_prefix + "name";
  else return non_coll_prefix + name;
}

/**
 * @param {Date} start
 * @param {Date} end
 * @param {any} match
 */
function recordDateCond(start, end, match = {}) {
  // 存在資料庫不統一的情形(以前date假設包含時間，但現在沒有)
  if (start || end) match.date = {};
  if (start) match.date.$gte = start;
  if (end) match.date.$lt = end;
  return match;
}

function pointTimeCond(start, end, match = {}) {
  // record的日期是Date格式，而pointActivity的time是string格式
  if (start || end) match.time = {};
  if (start) {
    const new_start = new Date(start);
    new_start.setHours(new_start.getHours() - 8);
    match.time.$gte = new_start.toISOString();
  }
  if (end) {
    const new_end = new Date(end);
    new_end.setHours(end.getHours() - 8);
    match.time.$lt = new_end.toISOString();
  }
  return match;
}

/**
 * @param {string} name
 * @param {string[]} branches
 */
function makeGroupId(name, branches, group_prefix = "$") {
  const result = {};
  for (const key of branches) {
    if (avail_coll.includes(key))
      result[key + "Id"] = group_prefix + key + "Id";
    else result[key] = group_prefix + key;
  }
  if (name) {
    if (avail_coll.includes(name))
      result[name + "Id"] = group_prefix + name + "Id";
    else result[name] = group_prefix + name;
  }

  return result;
}

/**
 * @param {string} coll_name
 * @param {string} localPrefix
 */
function makeLookup(coll_name, localPrefix = "") {
  if (!avail_coll.includes(coll_name)) return [];

  const localField = localPrefix + coll_name + "Id";
  return [
    {
      $lookup: {
        from: coll_name,
        localField,
        foreignField: "_id",
        as: "entity",
      },
    },
    { $unwind: { path: "$entity", preserveNullAndEmptyArrays: true } },
  ];
}

/**
 * @param {string} coll_name
 * @param {string[]} branches
 */
function innerHashtagsPipeline(coll_name, branches, sumField = "money") {
  const nameId = coll_name + "Id";
  return [
    { $unwind: { path: "$hashtags", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: {
          ...makeGroupId(coll_name, branches, "$_id."),
          hashtags: "$hashtags",
        },
        count: { $sum: 1 },
        size: { $first: "$size" },
        [sumField]: { $first: "$size" },
        [nameId]: { $first: `$_id.${nameId}` },
      },
    },
    // group hashtags
    {
      $group: {
        _id: {
          ...makeGroupId(coll_name, branches, "$_id."),
        },
        hashtags: {
          $push: {
            $cond: [
              { $gt: ["$_id.hashtags", null] },
              { tag: "$_id.hashtags", count: "$count" },
              "$$REMOVE",
            ],
          },
        },
        size: { $first: "$size" },
        [sumField]: { $first: "$" + sumField },
      },
    },
  ];
}

/**
 * @param {string} coll_name
 * @param {string[]} branches
 */
function hashtagsPipeline(coll_name, branches, sumField = "money") {
  return [
    {
      $group: {
        _id: makeGroupId(coll_name, branches),
        size: { $sum: "$" + sumField },
        hashtags: {
          $push: "$hashtags",
        },
      },
    },
    {
      $project: {
        _id: 1,
        size: 1,
        hashtags: {
          $reduce: {
            input: "$hashtags",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
      },
    },
    ...innerHashtagsPipeline(coll_name, branches, sumField),
    ...makeLookup(coll_name, "_id."),
  ];
}

/**
 * @param {string} name
 * @param {string} last_coll_name
 * @param {string[]} branches
 */
function otherPipeline(name, last_coll_name, branches, sumField = "money") {
  return [
    { $sort: { [getEntityName(last_coll_name, "entity.", "_id.")]: 1 } },
    {
      $group: {
        _id: {
          ...makeGroupId(name, branches, "$_id."),
          child_type_name: last_coll_name,
        },
        [sumField]: { $sum: "$" + sumField },
        children: {
          $push: {
            [sumField]: "$" + sumField,
            name: getEntityName(last_coll_name, "$entity.", "$_id."),
            hashtags: "$hashtags",
            size: "$size",
            // entity: "$entity",
            child_type_name: "$_id.child_type_name",
            children: "$children",
          },
        },
      },
    },
    ...makeLookup(name, "_id."),
  ];
}

/**
 * @param {string} coll_name
 */
function endPipeline(coll_name, sumField = "money") {
  return [
    { $sort: { [getEntityName(coll_name, "entity.", "_id.")]: 1 } },
    {
      $project: {
        _id: 0,
        name: getEntityName(coll_name, "$entity.", "$_id."),
        hashtags: 1,
        size: 1,
        [sumField]: 1,
        children: 1,
        child_type_name: "$_id.child_type_name",
        // entity: 1,
      },
    },
    {
      $group: {
        _id: 0,
        children: {
          $push: "$$ROOT",
        },
        [sumField]: { $sum: "$" + sumField },
      },
    },
    {
      $project: {
        _id: 0,
        size: 1,
        [sumField]: 1,
        child_type_name: coll_name,
        children: 1,
      },
    },
  ];
}

async function makeStatistic(match, branches, coll = collections.record) {
  /** @type {any} */
  const basePipeline = [{ $match: match }];
  if (!Array.isArray(branches)) branches = [branches];

  let coll_name = branches.pop();
  basePipeline.push(...hashtagsPipeline(coll_name, branches));

  while (branches.length > 0) {
    let last_coll_name = coll_name;
    coll_name = branches.pop();
    basePipeline.push(...otherPipeline(coll_name, last_coll_name, branches));
  }
  basePipeline.push(...endPipeline(coll_name));

  const arr = await coll.aggregate(basePipeline).toArray();
  return arr[0];
}

// available branch: ledgerId, categoryId, userId, recordType
// sum with money
// hashtag always be latest one
router.get(
  "/ledger",
  loginCheck(null),
  validatePipe("query", StatisticQuerySchema),
  async function (req, res) {
    const { order, start, end } = req.query;
    const ledgers = await collections.ledger
      .find({ userIds: req.userId })
      .toArray();
    const ledgerIds = ledgers.map((ledger) => ledger._id);
    let summary = await makeStatistic(
      recordDateCond(start, end, { ledgerId: { $in: ledgerIds } }),
      order
    );
    if (!summary) summary = {};
    summary.name = "帳本";

    return res.status(200).json(summary);
  }
);

// available: type, user, flow, subtype
router.get(
  "/points",
  loginCheck(null),
  validatePipe("query", StatisticQuerySchema),
  async function (req, res) {
    const { order, start, end } = req.query;
    let branches = order;
    if (!Array.isArray(branches)) branches = [branches];

    /** @type {any} */
    const basePipeline = [
      {
        $match: {
          $or: [
            pointTimeCond(start, end, { fromUserId: req.userId }),
            pointTimeCond(start, end, { toUserId: req.userId }),
          ],
        },
      },
      {
        $addFields: {
          flow: {
            $cond: [{ $eq: ["$fromUserId", req.userId] }, "out", "in"],
          },
          userId: {
            $cond: [
              { $eq: ["$type", "transfer"] },
              {
                $cond: [
                  { $eq: ["$fromUserId", req.userId] },
                  "$toUserId",
                  "$fromUserId",
                ],
              },
              "$$REMOVE",
            ],
          },
        },
      },
    ];

    let coll_name = branches.pop();
    basePipeline.push(...hashtagsPipeline(coll_name, branches, "amount"));

    while (branches.length > 0) {
      let last_coll_name = coll_name;
      coll_name = branches.pop();
      basePipeline.push(
        ...otherPipeline(coll_name, last_coll_name, branches, "amount")
      );
    }
    basePipeline.push(...endPipeline(coll_name, "amount"));

    const arr = await collections.pointActivity
      .aggregate(basePipeline)
      .toArray();
    let summary = arr[0];
    if (!summary) summary = {};
    summary.name = "點數";

    return res.status(200).json(summary);
  }
);

// available: recordType, categor, ledger
router.get(
  "/personal",
  loginCheck(null),
  validatePipe("query", StatisticQuerySchema),
  async function (req, res) {
    const { order, start, end } = req.query;
    let summary = await makeStatistic(
      recordDateCond(start, end, { userId: req.userId }),
      order
    );
    if (!summary) summary = {};
    summary.name = "個人";

    return res.status(200).json(summary);
  }
);

const testbranches = () => ["ledger", "user", "recordType", "category"];

function testPipeline() {
  const branches = testbranches();
  /** @type {any[]} */
  const basePipeline = [
    {
      $match: {
        ledgerId: { $in: ["1", "2"] },
        date: {
          $gte: new Date("2020-04-19T00:00:00.000Z"),
          $lt: new Date("2020-04-22T00:00:00.000Z"),
        },
      },
    },
  ];

  let coll_name = branches.pop();
  basePipeline.push(...hashtagsPipeline(coll_name, branches));

  while (branches.length > 0) {
    let last_coll_name = coll_name;
    coll_name = branches.pop();
    basePipeline.push(...otherPipeline(coll_name, last_coll_name, branches));
  }
  basePipeline.push(...endPipeline(coll_name));
  return basePipeline;
}
router.get("/test-pipeline", async function (req, res) {
  return res.status(200).json(testPipeline());
});

router.get("/test", async function (req, res) {
  /** @type {any[]} */
  const basePipeline = testPipeline();
  const arr = await collections.record.aggregate(basePipeline).toArray();

  res.status(200).json(arr);
});

/*
async function test() {

  console.log(arr);
}
test();
*/

module.exports = router;
