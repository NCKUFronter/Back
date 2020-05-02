process.env.DB_URI = "mongodb://localhost/test";
const { connectDB, client } = require("../models/mongo");
const { connectDBFn, resetDB, initDB } = require("./init");

async function run() {
  await connectDB();
  await resetDB();
  // require("../app.js");
  try {
    await require("./point-test").run();
  } catch (err) {
    console.log(err)
  } finally {
    await client.close();
  }
}
run();
