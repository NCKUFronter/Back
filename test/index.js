// @ts-check
// process.env.DB_URI = "mongodb://localhost/uidd";
process.env.dbfile = "mock.test.db"
process.env.PORT = "5000";
const { connectDB, client } = process.env.BABEL_TEST
  ? require("../dist/models/mongo")
  : require("../models/mongo");
const { resetDB, initDB } = require("./init");

async function run() {
  // await connectDB();
  const { server, app } = await (process.env.BABEL_TEST
    ? require("../dist/app.js")
    : require("../app.js"));
  await resetDB();

  try {
    // 不能改順序
    await require("./middleware.test").run();
    await require("./point.test").run(app);
    await require("./other.test").run(app);
    await require("./login.test").run(app);
    await require("./user.test").run(app);
    await require("./record.test").run(app);
    await require("./category.test").run(app);
    await require("./goods.test").run(app);
    await require("./ledger.test").run(app);
    await require("./invitation.test").run(app);
  } catch (err) {
    console.log(err);
  }
  await server.close();
  await client.close();
}
run();
