// @ts-check
/// <reference types="../types" />
const stringify = require("fast-stable-stringify");

class SSE {
  keepAlive;
  isClose = false;

  /** @type {import('fastrx').Sink[]} */
  subscriptions = [];

  /**
   * @param {import('express').Response} res
   */
  constructor(res) {
    /** @type {import('express').Response} res */
    this.res = res;
    this.keepAlive = setInterval(() => {
      if (!this.isClose) {
        this.send("keep-alive", "", true);
      }
    }, 20000);
  }

  /**
   * @param {any} data
   * @param {string} field
   * @param {boolean} end = false
   */
  send(data, field, end = false) {
    if (field === "data") {
      data = this.serialize(data);
    }

    let content = `${field}: ${data}\n`;
    if (end) content += "\n";
    this.res.write(content);
  }

  /**
   * @param {any} data
   * @param {string} eventName = "message"
   */
  sendEvent(data, eventName = "message") {
    this.send(eventName, "event");
    this.send(data, "data", true);
  }

  /**
   * @param {import('fastrx').Rx.Observable} source$
   * @param {string=} eventName
   */
  subscribe(source$, eventName) {
    const subscription = source$.subscribe((data) => {
      this.sendEvent(data, eventName);
    });
    console.log(subscription);
    console.log(subscription.dispose)

    this.subscriptions.push(subscription);
  }

  unsubscribeAll() {
    for (const subscription of this.subscriptions) {
      subscription.dispose();
    }
  }

  close() {
    this.isClose = true;
    clearInterval(this.keepAlive);
    this.unsubscribeAll();
  }

  /**
   * @param {any} data
   * @return {string}
   */
  serialize(data) {
    return stringify(data);
  }
}

function sseMiddleware(req, res, next) {
  req.socket.setTimeout(0);
  req.socket.setNoDelay(true);
  req.socket.setKeepAlive(true);

  // header
  // from https://zhuanlan.zhihu.com/p/47099953
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
    // "Access-Control-Allow-Origin": "*",
  });

  // 2kB of padding (for IE)
  res.write(":" + Array(2049).join(" ") + "\n");
  res.write("retry: 2000\n\n");

  const sse = new SSE(res);
  res.sse = sse; // let controller can get SSE object in nestjs

  res.on("close", () => sse.close());
  next();
}

module.exports = {
  SSE,
  sseMiddleware,
};
