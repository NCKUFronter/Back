// @ts-check
const { collections } = require("../models/mongo");
const { LedgerModel, UserModel } = require("../models");

/**
 * @param {(req) => string} ledgerIdFn 取得ledger id
 */
function getLedgerAuthGuard(ledgerIdFn) {
  /**
   * 假設使用者已經登入，確認使用者是否有Ledger權限
   * @param {import('express').Request & {user: UserModel}} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  async function ledgerAuthGuard(req, res, next) {
    const ledgerId = ledgerIdFn(req);

    /** @type {LedgerModel} */
    const ledger = await collections.ledger.findOne({ _id: ledgerId });
    if (ledger) return res.status(404).json("Ledger Not Found");
    else if (
      ledger.adminId == req.user._id ||
      (ledger.userIds && ledger.userIds.indexOf(req.user._id) > -1)
    ) {
      next();
    } else return res.status(403).json("No auth to access this ledger");
  }

  return ledgerAuthGuard;
}

module.exports = {
  getLedgerAuthGuard,
};
