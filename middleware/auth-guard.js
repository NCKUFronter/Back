// @ts-check
const { collections } = require("../models/mongo");
const { LedgerModel, UserModel } = require("../models");

/**
 * @param {(req) => string | LedgerModel} ledgerIdFn 取得ledger id or ledger
 * @return {any}
 */
function getLedgerAuthGuard(ledgerIdFn) {
  /**
   * 假設使用者已經登入，確認使用者是否有Ledger權限
   */
  async function ledgerAuthGuard(req, res, next) {
    /** @type {any} */
    let ledger = ledgerIdFn(req);
    if (typeof ledger === "string") {
      ledger = await collections.ledger.findOne({ _id: ledger });
      if (ledger == null) return res.status(404).json("Ledger Not Found");
    }

    if (
      ledger.adminId == req.userId ||
      (ledger.userIds && ledger.userIds.includes(req.userId))
    ) {
      next();
    } else return res.status(403).json("No auth to access this ledger");
  }

  return ledgerAuthGuard;
}

module.exports = {
  getLedgerAuthGuard,
};
