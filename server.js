
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public")); // Serve static files (your front-end)

// Handle new socket connections
io.on("connection", (socket) => {
    console.log("a user connected");

    // Listen for incoming messages
    socket.on("chat message", (msg) => {
        io.emit("chat message", msg); // Emit message to all connected users
    });

    // Handle disconnections
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
