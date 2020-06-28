/* symbol
 * -- ✔️ 可以運作
 * -- 🚫 前端不應該使用
 * -- 🔨 尚未弄好
 * -- ⚠️ 可能有bug
 * -- ❔ 有待討論的問題
 * -- ℹ️ 有資訊
 * ℹ️ 有資訊
 * ⚠️ bug說明
 * ❔ 疑問?
 */

// ---------  Category ---------
/**
 * @route GET /category
 * @group category
 * @summary 取德所有category
 * -- ✔️ 可以運作
 * @returns {Array.<Category>} 200
 */

/**
 * @route GET /category/{id}
 * @group category
 * @summary 查詢指定 id 的category
 * -- ✔️ 可以運作
 * @param {string} id.path.required
 * @returns {Category.model} 200
 */

/**
 * ℹ️ 可連同使用者的categoryTags，一併新增
 * ℹ️ 顏色只支援hex 6碼格式
 * @route POST /category
 * @summary 新增category與hashtags
 * -- ✔️ 可以運作
 * -- ℹ️ 有資訊
 * @group category
 * @param {CategoryDto.model} dto.body.required
 * @returns {Category.model} 201 - inserted model
 * @returns {string} 400 - 所填資料有誤
 * @returns {any} 401 - 未登入
 * @returns {any} 403 - 沒有權限訪問
 * @returns {any} 404 - 找不到
 * @security Basic
 */

/**
 * ℹ️ 預設類別不能更名
 * ℹ️ 會連同使用者的categoryTags，一併更改
 * @route PATCH /category/{id}
 * @group category
 * @summary 部分修改指定 id 的category與hashtags
 * -- ✔️ 可以運作
 * -- ℹ️ 有資訊
 * @param {string} id.path.required
 * @param {CategoryDto.model} dto.body.required
 * @returns {string} 200 - success
 * @returns {string} 400 - 所填資料有誤
 * @returns {any} 401 - 未登入
 * @returns {any} 403 - 沒有權限訪問
 * @returns {any} 404 - 找不到
 * @security Basic
 */

/**
 * ℹ️ 會連同使用者的categoryTags，一併清除
 * @route DELETE /category/{id}
 * @group category
 * @summary 刪除指定 id 的category
 * -- ✔️ 可以運作
 * -- ℹ️ 有資訊
 * @param {string} id.path.required
 * @returns {string} 200 - success
 * @returns {any} 401 - 未登入
 * @returns {any} 403 - 沒有權限訪問
 * @security Basic
 */

// ---------  Record ---------
/**
 * @route GET /record
 * @group record
 * @summary 查詢所有record
 * -- ✔️ 可以運作
 * -- 🚫 前端不應該使用
 * @parm {string} ledger
 * @param {enum[]} _one.query - one to one fields - eg: category,user,ledger
 * @returns {Array<Record>} 200
 */

/**
 * @route GET /record/{id}
 * @group record
 * @summary 查詢指定id的record
 * -- ✔️ 可以運作
 * -- 🚫 前端不應該使用
 * @param {string} id.path.required
 * @param {enum[]} _one.query - one to one fields - eg: category,user,ledger
 * @returns {Record.model} 200
 * @returns {any} 404 - 找不到
 */

/**
 * @typedef InsertRecordResponse
 * @property {string} message
 * @property {number} rewardPoints
 */
/**
 * ℹ️ 點數發放簡單用money/100發放
 * @route POST /record
 * @group record
 * @summary 新增的record
 * -- ✔️ 可以運作
 * -- ℹ️ 有資訊
 * @param {RecordDto.model} dto.body.required
 * @returns {InsertRecordResponse.model} 201 - inserted model
 * @returns {string} 400 - 所填資料有誤
 * @returns {any} 401 - 未登入
 * @returns {any} 403 - 沒有權限訪問
 * @security Basic
 */

/**
 * ℹ️ 使用者categoryTags，也一併更改
 * ℹ️ pointActivity的點數，也一併更改
 * @route PATCH /record/{id}
 * @group record
 * @summary 部分修改指定 id 的record
 * -- ✔️ 可以運作
 * -- ℹ️ 有資訊
 * @param {string} id.path.required
 * @param {RecordDto.model} dto.body.required
 * @returns {Record.model} 200 - updated model
 * @returns {string} 400 - 所填資料有誤 || 不能修改預設類別名稱
 * @returns {any} 401 - 未登入
 * @returns {any} 403 - 沒有權限訪問
 * @returns {any} 404 - 找不到
 * @security Basic
 */

/**
 * ℹ️ 相關pointActivity會一併刪除
 * @route DELETE /record/{id}
 * @group record
 * @summary 刪除指定 id 的預設record
 * -- ✔️ 可以運作
 * -- ℹ️ 有資訊
 * @param {string} id.path.required
 * @returns {string} 200 - success
 * @returns {any} 401 - 未登入
 * @returns {any} 403 - 沒有權限訪問
 * @security Basic
 */

// ---------  Goods ---------
/**
 * @route GET /goods
 * @group goods
 * @summary 查詢所有goods
 * -- ✔️ 可以運作
 * @returns {Array<Goods>} 200
 */

/**
 * @route GET /goods/{id}
 * @group goods
 * @summary 查詢所有goods
 * -- ✔️ 可以運作
 * @param {string} id.path.required
 * @returns {Goods.model} 200
 */

// ---------  User ---------
/**
 * @route GET /user -- 🚫前端不應該使用
 * @group user
 * @summary 查詢所有 user
 * -- ✔️ 可以運作
 * @returns {Array<User>} 200
 */

/**
 * @route POST /user/login
 * @group user
 * @summary 登入
 * -- ✔️ 可以運作
 * @param {LoginDto.model} dto.body.required
 * @returns {string} 200
 * @returns {string} 401 - 登入失敗，帳號或密碼錯誤
 */

/**
 * @typedef PointCheckResponse
 * @property {number} perLogin
 * @property {number} continueLogin
 */
/**
 * @route POST /user/pointCheck
 * @group user
 * @summary 取得登入點數
 * -- ✔️ 可以運作
 * @returns {PointCheckResponse.model} 200
 * @returns {string} 401 - 登入失敗，帳號或密碼錯誤
 */

/**
 * @route POST /user/logout
 * @group user
 * @summary 登出
 * -- ✔️ 可以運作
 * @returns {string} 200
 */

/**
 * @route GET /user/ledgers
 * @group user
 * @summary 取得使用者所有帳簿
 * -- ✔️ 可以運作
 * @param {enum[]} _one.query - one to one fields - eg: admin
 * @param {enum[]} _many.query - many-to-many relationship fields - eg: users,records,invitees
 * @returns {Array<Ledger>} 200
 * @security Basic
 */

/**
 * @route GET /user/pointActivities
 * @group user
 * @summary 取得使用者所有點數紀錄
 * -- ✔️ 可以運作
 * @param {enum} type.query - activity type - eg: new, transfer, consume
 * @param {string} subtype.query - activity subtype
 * @param {enum[]} _one.query - one-to-many relationship fields - eg: fromUser,toUser,fromRecord,toGoods
 * @returns {Array<PointActivity>} 200
 * @security Basic
 */

/**
 * @route GET /user/invitations
 * @group user
 * @summary 取得使用者待回覆的邀請
 * -- ✔️ 可以運作
 * @param {string[]} _one.query - one-to-many relationship fields - eg: fromUser,toUser,ledger
 * @returns {Array<Invitation>} 200
 * @security Basic
 */

/**
 * @route GET /user/relativeUsers
 * @group user
 * @summary 取得相關使用者資訊
 * -- ✔️ 可以運作
 * @returns {Array<User>} 200
 * @security Basic
 */

/**
 * @typedef CategoryResponse
 * @property {string} _id.required
 * @property {string} name.required
 * @property {string} userId
 * @property {string[]} hashtags
 */
/**
 * @route GET /user/categories
 * @group user
 * @summary 取得使用者的所有類別(包含預設)
 * -- ✔️ 可以運作
 * @returns {Array<CategoryResponse>} 200
 * @security Basic
 */

/**
 * @route GET /user/profile
 * @group user
 * @summary 取得使用者資料
 * -- ✔️ 可以運作
 * @returns {User.model} 200
 * @returns {string} 401 未登入
 * @security Basic
 */

// ---------  Invitation ---------
/**
 * @route POST /invitation/invite
 * @group invitation
 * @summary 發送ledger的邀請
 * -- ✔️ 可以運作
 * @param {InviteDto.model} dto.body.required
 * @returns {string} 200
 * @returns {string} 400 - 所填資料有誤
 * @returns {any} 401 - 未登入
 * @security Basic
 */

/**
 * @route PUT /invitation/{id}/answer
 * @group invitation
 * @summary 回應邀請
 * -- ✔️ 可以運作
 * @param {string} id.path.required
 * @param {AnswerDto.model} dto.body.required
 * @returns {string} 200
 * @returns {string} 400 - 所填資料有誤
 * @returns {any} 401 - 未登入
 * @returns {any} 403 - 沒有權限訪問
 * @returns {any} 404 - 找不到
 * @security Basic
 */

// ---------  Ledger ---------
/**
 * @route GET /ledger
 * @group ledger
 * @summary 查詢所有 ledger
 * -- ✔️ 可以運作
 * -- 🚫 前端不應該使用
 * @parm {string} ledgerId.query
 * @param {enum[]} _one.query - one to one fields - eg: admin
 * @param {enum[]} _many.query - many-to-many relationship fields - eg: users,records,invitees
 * @returns {Array<Ledger>} 200
 */

/**
 * @route GET /ledger/{id}
 * @group ledger
 * @summary 查詢指定 id 的 ledger
 * -- ✔️ 可以運作
 * @param {string} id.path.required
 * @param {enum[]} _one.query - one to one fields - eg: admin
 * @param {enum[]} _many.query - many-to-many relationship fields - eg: users,records,invitees
 * @returns {Ledger.model} 200 - success
 * @returns {any} 401 - 未登入
 * @returns {any} 403 - 沒有權限訪問
 * @returns {any} 404 - 找不到
 * @security Basic
 */

/**
 * @route POST /ledger
 * @group ledger
 * @summary 新增 ledger
 * -- ✔️ 可以運作
 * @consumes multipart/form-data
 * @param {string} ledgerName.formData.required
 * @param {file} upPhoto.formData - 上傳圖片
 * @param {string} photo.formData - 圖片網址
 * @returns {Ledger.model} 201 - inserted model
 * @returns {any} 400 - 所填資料有誤
 * @returns {any} 401 - 未登入
 * @security Basic
 */

/**
 * @route PATCH /ledger/{id}
 * @group ledger
 * @summary 部分修改指定 id 的 ledger
 * -- ✔️ 可以運作
 * @consumes multipart/form-data
 * @param {string} id.path.required
 * @param {string} ledgerName.formData
 * @param {file} upPhoto.formData - 上傳圖片
 * @param {string} photo.formData - 圖片網址
 * @returns {Ledger.model} 200 - updated model
 * @returns {any} 401 - 未登入
 * @returns {any} 403 - 沒有權限訪問
 * @security Basic
 */

/**
 * @route DELETE /ledger/{id}
 * @group ledger
 * @summary 刪除指定 id 的 ledger
 * -- ✔️ 可以運作
 * @param {string} id.path.required
 * @returns {string} 200 - success
 * @returns {any} 401 - 未登入
 * @returns {any} 403 - 沒有權限訪問
 * @security Basic
 */

/**
 * @route GET /ledger/{id}/records
 * @group ledger
 * @summary 查詢帳本所有record
 * -- ✔️ 可以運作
 * @param {string} id.path.required
 * @param {enum[]} _one.query - one to one fields - eg: category,user,ledger
 * @returns {Array<Record>} 200
 * @security Basic
 */

/**
 * @route GET /ledger/{id}/invitations
 * @group ledger
 * @summary 查詢帳本所有邀請紀錄
 * -- ✔️ 可以運作
 * @param {string} id.path.required
 * @param {string[]} _one.query - one-to-many relationship fields - eg: fromUser,toUser,ledger
 * @returns {Array<Invitation>} 200
 * @security Basic
 */

/**
 * @route POST /ledger/{id}/leave
 * @group ledger
 * @summary 使用者離開ledger
 * -- ✔️ 可以運作
 * @param {string} id.path.required
 * @returns {string} 200 - success
 * @returns {any} 401 - 未登入
 * @returns {any} 403 - 沒有權限訪問
 * @security Basic
 */

/**
 * @route POST /ledger/{id}/leave/{userId}
 * @group ledger
 * @summary 使用者離開ledger
 * -- ✔️ 可以運作
 * @param {string} id.path.required - ledgerId
 * @param {string} userId.path.required - 要踢走的使用者id
 * @returns {string} 200 - success
 * @returns {any} 401 - 未登入
 * @returns {any} 403 - 沒有權限訪問
 * @security Basic
 */

// ---------  Points ---------
/**
 * @route GET /point/activities
 * @group point
 * @summary 查詢所有pointActivity
 * -- ✔️ 可以運作
 * -- 🚫 前端不應該使用
 * @param {enum[]} _one.query - one-to-many relationship fields - eg: fromUser,toUser,fromRecord,toGoods
 * @returns {Array<PointActivity>} 200
 */

/**
 * @route GET /point/activities/{id}
 * @group point
 * @summary 查詢指定 id 的pointActivity
 * -- ✔️ 可以運作
 * @param {string} id.path.required
 * @param {enum[]} _one.query - one-to-many relationship fields - eg: fromUser,toUser,fromRecord,toGoods
 * @returns {PointActivity.model} 200
 */

/**
 * @route POST /point/transfer
 * @group point
 * @summary 轉移點數
 * -- ✔️ 可以運作
 * @param {TransferPointsDto.model} dto.body.required
 * @returns {string} 200 - success
 * @returns {string} 400 - 所填資料有誤
 * @returns {string} 401 - 未登入
 * @security Basic
 */

/**
 * @route POST /point/consume/{goodsId}
 * @group point
 * @summary 消費點數
 * -- ✔️ 可以運作
 * @param {string} goodsId.path.required
 * @param {ConsumePointsDto.model} dto.body.required
 * @returns {string} 200 - success
 * @returns {string} 400 - 所填資料有誤
 * @returns {string} 401 - 未登入
 * @security Basic
 */

// ---------  SSE ---------
/**
 * @route GET /sse/notification
 * @group sse
 * @summary 取得即時通知
 * -- ✔️ 可以運作
 * -- ‼️ Swagger不能測試
 * @produces text/event-stream
 * @returns {string} 200 - success
 * @returns {string} 401 - 未登入
 * @security Basic
 */

// ---------  Statistic ---------
/**
 * ℹ️ order順序等同分類順序，請注意
 * ℹ️ 最底層才有hashtags的統計
 * ℹ️ 假設時間都只填到日期(不填細部 時、分、秒)
 * @route GET /statistic/ledger
 * @group statistic
 * @summary 取得帳本的統計
 * -- ✔️ 可以運作
 * -- ℹ️ 有資訊
 * @param {string} start.query - 包含 - eg:2019-05-06T15:21:32.202Z
 * @param {string} end.query - 不包含 - eg:2020-05-06T15:21:32.202Z
 * @param {string[]} order.query.required - available: ledger, recordType, user, category
 * @returns {string} 200 - success
 * @returns {string} 401 - 未登入
 * @security Basic
 */

/**
 * ℹ️ order順序等同分類順序，請注意
 * ℹ️ 最底層才有hashtags的統計
 * ℹ️ 假設時間都只填到日期(不填細部 時、分、秒)
 * @route GET /statistic/personal
 * @group statistic
 * @summary 取得個人的統計
 * -- ✔️ 可以運作
 * -- ℹ️ 有資訊
 * @param {string} start.query - 包含 - eg:2019-05-06T15:21:32.202Z
 * @param {string} end.query - 不包含 - eg:2020-05-06T15:21:32.202Z
 * @param {string[]} order.query.required - available: ledger, recordType, category
 * @returns {string} 200 - success
 * @returns {string} 401 - 未登入
 * @security Basic
 */

/**
 * ℹ️ order順序等同分類順序，請注意
 * ℹ️ 沒有對hashtags的統計(點數本身沒有hashtags，只是懶惰沒有去掉回傳中的hashtags)
 * ℹ️ 假設時間都只填到日期(不填細部 時、分、秒)
 * @route GET /statistic/points
 * @group statistic
 * @summary 取得點數的統計
 * -- ✔️ 可以運作
 * -- ℹ️ 有資訊
 * @param {string} start.query - 包含 - eg:2019-05-06T15:21:32.202Z
 * @param {string} end.query - 不包含 - eg:2020-05-06T15:21:32.202Z
 * @param {string[]} order.query.required - available: type, user, flow, subtype
 * @returns {string} 200 - success
 * @returns {string} 401 - 未登入
 * @security Basic
 */

// ---------  Game ---------

// /**
//  * @typedef GameUser
//  * @property {string} _id.required
//  * @property {string} name.required
//  */
// /**
//  * @route GET /game/user
//  * @group game
//  * @summary 所有遊戲人物資訊
//  * -- ✔️ 可以運作
//  * @returns {Array<GameUser>} 200 - success
//  */
// 
// /**
//  * @route GET /game/user/{id}
//  * @group game
//  * @summary 遊戲人物資訊
//  * -- ✔️ 可以運作
//  * @param {string} id.path.required
//  * @returns {GameUser.model} 200 - success
//  */
// 
// /**
//  * @typedef BagItem
//  * @property {string} _id.required
//  * @property {string} name.required
//  * @property {number} point.required
//  * @property {string} intro.required
//  * @property {number} count - 數量
//  */
// /**
//  * @route GET /game/user/{id}/bag
//  * @group game
//  * @summary 遊戲人物的背包
//  * -- ✔️ 可以運作
//  * @param {string} id.path.required
//  * @returns {Array<BagItem>} 200 - success
//  */
// 
// /**
//  * @route POST /game/user/{id}/use/{goodsId}
//  * @group game
//  * @summary 使用道具(單純將道具數量-1)
//  * -- ✔️ 可以運作
//  * @param {string} id.path.required
//  * @param {string} goodsId.path.required
//  * @returns {string} 200 - success
//  */
