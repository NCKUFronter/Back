// @ts-check
process.env.DB_URI = "mongodb://localhost/test";
process.env.PORT = "5000";
const { connectDB, client } = require("../models/mongo");
const { resetDB, initDB } = require("./init");

async function run() {
  // await connectDB();
  const { server, app } = await require("../app.js");
  await resetDB();
  try {
    // 不能改順序
    await require("./point.test").run();
    await require("./invitation.test").run();
    await require("./user.test").run();
    await require("./other.test").run();
    await require("./login.test").run(app);
    await require("./record.test").run(app);
    await require("./category.test").run(app);
  } catch (err) {
    console.log(err);
  }
  await server.close();
  await client.close();
}
run();
