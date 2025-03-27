const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this in production to allow only specific origins
  },
});

app.use(cors());
app.use(express.static("public")); // Serve static files (if needed)

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("sendMessage", (data) => {
    io.emit("receiveMessage", data); // Broadcast message to all clients
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
