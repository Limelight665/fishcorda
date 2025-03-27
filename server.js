const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.static("public"));

let messageHistory = []; // Store chat history

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Send chat history to new user
  socket.emit("chat history", messageHistory);

  // Listen for new chat messages
  socket.on("chat message", (data) => {
    const messageData = {
      userId: data.userId,
      displayName: data.displayName || "Anonymous",
      messageText: data.messageText,
      timestamp: new Date().toISOString(),
    };

    messageHistory.push(messageData); // Store message
    io.emit("chat message", messageData); // Broadcast to all clients
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
