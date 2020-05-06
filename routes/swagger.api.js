// ---------  Category ---------
/**
 * @route GET /category
 * @group category
 * @summary 取德所有category
 * @returns {Array.<Category>} 200
 */

/**
 * @route GET /category/{id}
 * @group category
 * @summary 取德指定 id 的category
 * @param {string} id.path.required
 * @returns {Category.model} 200
 */

/**
 * @route POST /category
 * @summary 新增category
 * @group category
 * @param {CategoryDto.model} dto.body.required
 * @returns {Category.model} 201 - inserted model
 * @returns {string} 400 - 所填資料有誤
 * @returns {any} 404 - 找不到
 */

/**
 * @route PATCH /category/{id}
 * @group category
 * @summary 部分修改指定 id 的category
 * @param {string} id.path.required
 * @param {CategoryDto.model} name.body.required
 * @returns {Category.model} 200 - updated model
 * @returns {string} 400 - 所填資料有誤
 * @returns {any} 404 - 找不到
 */

/**
 * @route DELETE /category/{id}
 * @group category
 * @summary 刪除指定 id 的category
 * @param {string} id.path.required
 * @param {CategoryDto.model} name.body.required
 * @returns {string} 200 - success
 */

// ---------  Record ---------
/**
 * @route GET /record
 * @group record
 * @summary 查詢所有record -- 🚫前端不應該使用
 * @parm {string} ledger
 * @param {enum[]} _expand.query - one to one fields - eg: category,user,ledger
 * @returns {Array<Record>} 200
 */

/**
 * @route GET /record/{id}
 * @group record
 * @summary 查詢所有record
 * @param {string} id.path.required
 * @param {enum[]} _expand.query - one to one fields - eg: category,user,ledger
 * @returns {Record.model} 200
 */

/**
 * @typedef InsertRecordResponse
 * @property {string} message
 * @property {number} rewardPoints
 */
/**
 * @route POST /record
 * @group record
 * @summary 新增的record
 * @param {RecordDto.model} dto.body.required
 * @returns {InsertRecordResponse.model} 201 - inserted model
 * @returns {string} 400 - 所填資料有誤
 * @returns {any} 401 - 未登入
 * @returns {any} 403 - 沒有權限訪問
 * @security Basic
 */

/**
 * @route PATCH /record/{id}
 * @group record
 * @summary 部分修改指定 id 的record
 * @param {string} id.path.required
 * @param {RecordDto.model} dto.body.required
 * @returns {Record.model} 200 - updated model
 * @returns {string} 400 - 所填資料有誤
 * @returns {any} 401 - 未登入
 * @returns {any} 403 - 沒有權限訪問
 * @returns {any} 404 - 找不到
 * @security Basic
 */

/**
 * @route DELETE /record/{id}
 * @group record
 * @summary 刪除指定 id 的預設record
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
 * @returns {Array<Goods>} 200
 */

/**
 * @route GET /goods/{id}
 * @group goods
 * @summary 查詢所有goods
 * @param {string} id.path.required
 * @returns {Goods.model} 200
 */

// ---------  User ---------
/**
 * @route GET /user -- 🚫前端不應該使用
 * @group user
 * @summary 查詢所有 user
 * @returns {Array<User>} 200
 */

/**
 * @route GET /user/{id}
 * @group user
 * @summary 查詢其中一個 user
 * @param {string} id.path.required
 * @returns {User.model} 200
 */

/**
 * @route POST /user/login
 * @group user
 * @summary 登入
 * @param {LoginDto.model} dto.body.required
 * @returns {string} 200
 * @returns {string} 401 - 登入失敗，帳號或密碼錯誤
 */

/**
 * @route POST /user/logout
 * @group user
 * @summary 登出
 * @returns {string} 200
 */

// ---------  Invitation ---------
/**
 * @route GET /invitation/invite
 * @group invitation
 * @summary 發送ledger的邀請 --  🔨尚未弄好
 * @param {InviteDto.model} dto.body.required
 * @returns {string} 200
 * @returns {string} 400 - 所填資料有誤
 * @returns {any} 401 - 未登入
 * @security Basic
 */

/**
 * @route GET /invitation/{id}/answer
 * @group invitation
 * @summary 回應邀請 --  🔨尚未弄好
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
 * @summary 查詢所有 ledger -- 🚫前端不應該使用
 * @parm {string} ledger
 * @param {enum[]} _expand.query - one to one fields - eg: admin
 * @param {enum[]} _embed.query - many-to-many relationship fields - eg: users,records
 * @returns {Array<Ledger>} 200
 */

/**
 * @route GET /ledger/{id}
 * @group ledger
 * @summary 查詢指定 id 的 ledger
 * @param {string} id.path.required
 * @param {enum[]} _expand.query - one to one fields - eg: category,user,ledger
 * @returns {Ledger.model} 200 - success
 * @returns {any} 401 - 未登入
 * @returns {any} 403 - 沒有權限訪問
 * @returns {any} 404 - 找不到
 * @security Basic
 */

/**
 * @route POST /ledger
 * @group ledger
 * @summary 新增的record
 * @param {LedgerDto.model} name.body.required
 * @returns {Ledger.model} 201 - inserted model
 * @returns {any} 400 - 所填資料有誤
 * @returns {any} 401 - 未登入
 * @security Basic
 */

/**
 * @route PATCH /ledger/{id}
 * @group ledger
 * @summary 部分修改指定 id 的 ledger
 * @param {string} id.path.required
 * @param {LedgerDto.model} dto.body.required
 * @returns {Ledger.model} 200 - updated model
 * @returns {any} 401 - 未登入
 * @returns {any} 403 - 沒有權限訪問
 * @security Basic
 */

/**
 * @route DELETE /ledger/{id}
 * @group ledger
 * @summary 刪除指定 id 的預設 ledger
 * @param {string} id.path.required
 * @returns {string} 200 - success
 * @returns {any} 401 - 未登入
 * @returns {any} 403 - 沒有權限訪問
 * @security Basic
 */

// ---------  Points ---------
/**
 * @route GET /point/activites
 * @group point
 * @summary 查詢所有pointActivity -- 🚫前端不應該使用
 * @param {enum[]} _expand.query - one-to-many relationship fields - eg: fromUser,toUser,fromRecord,toGoods
 * @returns {Array<PointActivity>} 200
 */

/**
 * @route GET /point/activites/{id}
 * @group point
 * @summary 查詢指定 id 的pointActivity
 * @param {enum[]} _expand.query - one-to-many relationship fields - eg: fromUser,toUser,fromRecord,toGoods
 * @returns {PointActivity.model} 200
 */

/**
 * @route POST /point/transfer
 * @group point
 * @summary 轉移點數
 * @param {TransferPointsDto.model} dto.body.required
 * @returns {string} 200 - success
 * @returns {string} 400 - 所填資料有誤
 * @returns {string} 401 - 未登入
 * @security Basic
 */

/**
 * @route POST /points/consume/{goodsId}
 * @group point
 * @summary 消費點數
 * @param {string} goodsId.path.required
 * @returns {string} 200 - success
 * @returns {string} 400 - 所填資料有誤
 * @returns {string} 401 - 未登入
 * @security Basic
 */
