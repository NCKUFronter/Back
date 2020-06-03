const SocketIO = require("socket.io");

/**
 * @param {import('http').Server} server
 */
function AppSocketIO(server) {
  const io = SocketIO(server);
  io.on("connect", function (socket) {
    // console.log(socket);
    socket.emit("nothing", { xxx: "xxx" });

    socket.on("disconnect", function () {
      console.log("disconnect");
    });
  });
}

module.exports = AppSocketIO;
