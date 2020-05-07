// @ts-check
const { collections } = require("../models/mongo");
const { LedgerModel, UserModel } = require("../models");

/**
 * @param {(req) => string} ledgerIdFn 取得ledger id
 * @return {any}
 */
function getLedgerAuthGuard(ledgerIdFn) {
  /**
   * 假設使用者已經登入，確認使用者是否有Ledger權限
   */
  async function ledgerAuthGuard(req, res, next) {
    const ledgerId = ledgerIdFn(req);

    /** @type {LedgerModel} */
    const ledger = await collections.ledger.findOne({ _id: ledgerId });
    if (!ledger) return res.status(404).json("Ledger Not Found");
    else if (
      ledger.adminId == req.userId ||
      (ledger.userIds && ledger.userIds.indexOf(req.userId) > -1)
    ) {
      next();
    } else return res.status(403).json("No auth to access this ledger");
  }

  return ledgerAuthGuard;
}

module.exports = {
  getLedgerAuthGuard,
};
