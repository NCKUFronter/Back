class PointActivityModel {
  /** @type {number=} */
  _id;

  /** @type {string} */
  type;

  /** @type {string=} */
  subtype;

  /** @type {number} */
  fromId;

  /** @type {number} */
  toId;

  /** @type {Date} */
  time;

  /**
   * @param {string} type
   * @param {string} subtype
   * @param {number} amount
   * @param {number} fromId
   * @param {number} toId
   * @param {string=} detail
   */
  constructor(type, subtype, amount, fromId, toId, detail) {
    this.type = type;
    this.subtype = subtype;
    this.amount = amount;
    this.fromId = fromId;
    this.toId = toId;
    this.detail = detail;
    this.time = new Date().toISOString();
  }
}

module.exports = {
  PointActivityModel,
};
