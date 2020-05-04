// @ts-check
process.env.DB_URI = "mongodb://localhost/test";
const { connectDB, client } = require("../models/mongo");
const { resetDB, initDB } = require("./init");
const supertest = require('supertest')

async function run() {
  // await connectDB();
  const { server, app } = await require("../app.js");
  const agent = supertest.agent(app);
  await resetDB();
  try {
    await require("./point.test").run();
    await require("./invitation.test").run();
    await require("./login.test").run(agent);
  } catch (err) {
    console.log(err);
  } finally {
    await server.close();
    await client.close();
  }
}
run();
