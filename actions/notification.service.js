// @ts-check
const { rx } = require("fastrx");
/** @typedef {import('fastrx').Sink} Sink */
/** @typedef {import('fastrx').Rx.Observable} Observable */

class NotificationService {
  /** @type {Sink & Observable} */
  // @ts-ignore: fastrx定義的型別不正確
  _subject = rx.subject();

  send(event) {
    this._subject.next(event);
  }

  /** @return {Observable} */
  listen() {
    return this._subject;
  }
}

module.exports = {
  notification: new NotificationService(),
};
