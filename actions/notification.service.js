// @ts-check
const { rx } = require("fastrx");
const { collections } = require("../models/mongo");
const { sseMessage } = require("../middleware/sse.middleware");
/** @typedef {import('fastrx').Sink} Sink */
/** @typedef {import('fastrx').Rx.Observable} Observable */

class NotificationService {
  /** @type {Sink & Observable} */
  // @ts-ignore: fastrx定義的型別不正確
  _subject = rx.subject();

  /**
   * @param {import('express').Request} req
   * @param {any} data
   * @param {string[]} toUserIds
   */
  send(req, data, toUserIds) {
    this._subject.next(sseMessage(req, data, toUserIds));
  }

  async sendToLedgerUsers(req, data, ledgerId) {
    const ledger = await collections.ledger.findOne({ _id: ledgerId });
    data.ledger = ledger;
    this.send(req, data, ledger.userIds);
  }

  /** @return {Observable} */
  listen() {
    return this._subject;
  }
}

module.exports = {
  notification: new NotificationService(),
};
