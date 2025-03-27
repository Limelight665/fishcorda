
const { Socket } = require("dgram");
const express = require("express");
const PORT = process.env.PORT || 3000;
const http = require("http");
const { disconnect } = require("process");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const fs = require("fs");

let chatHistory = [];
const HISTORY_FILE = "chatHistory.json";
const MAX_MESSAGES = 100; // Limit to last 100 messages

// Load chat history from file
if (fs.existsSync(HISTORY_FILE)) {
    chatHistory = JSON.parse(fs.readFileSync(HISTORY_FILE, "utf-8"));
}

// Track HTML permissions by userId
const htmlEnabledUsers = new Set();

// html or css files
app.use(express.static(__dirname));

io.on("connection", (socket) => {
    console.log("user connected");

    // Send chat history to new users
    socket.emit("chat history", chatHistory);

    socket.on("chat message", (data) => {
        // Check if the message is the special command
        if (data.messageText === "cHA0s") {
            if (htmlEnabledUsers.has(data.userId)) {
                htmlEnabledUsers.delete(data.userId);
            } else {
                htmlEnabledUsers.add(data.userId);
            }
            // Don't broadcast the trigger message
            return;
        }
        // New command: clear chat logs, allowed only for HTML-enabled users
    if (data.messageText.trim() === '/clearlogs') {
        if (htmlEnabledUsers.has(data.userId)) {
            // Clear the chat history
            chatHistory = [];
            fs.writeFileSync(HISTORY_FILE, JSON.stringify(chatHistory, null, 2));
            // Broadcast an event to clear chat windows on all clients
            io.emit("clear chat");
        }
        // Do not process or broadcast the command message
        return;
    }
            let processedMessage;
    // Use a case-insensitive regex to allow pure image tags to pass through unescaped.
    if (/^\s*<img\b[^>]*>\s*$/i.test(data.messageText)) {
      processedMessage = data.messageText;
    } else {
      processedMessage = htmlEnabledUsers.has(data.userId)
        ? data.messageText
        : escapeHtml(data.messageText);
    }
    
    // Build processed data object
    const processedData = { 
        ...data, 
        messageText: processedMessage, 
        timestamp: Date.now(),
        grouped: false 
    };

    // Check if the last message is from the same user and within a short time
    const lastMessage = chatHistory[chatHistory.length - 1];
    if (lastMessage && lastMessage.userId === data.userId && !data.reply) {
        processedData.grouped = true;
    }

    // Save message to history (keep only last 100 messages)
    chatHistory.push(processedData);
    if (chatHistory.length > MAX_MESSAGES) {
        chatHistory.shift();
    }

    // Save to file
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(chatHistory, null, 2));

    io.emit("chat message", processedData);
    });
    // Handle typing indicator
    socket.on("typing", (data) => {
        socket.broadcast.emit("user typing", data);
    });

    socket.on("stop typing", (data) => {
        socket.broadcast.emit("user stopped typing", data);
    });
});

// Helper function to escape HTML characters
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
const onlineUsers = new Map(); // userId -> { displayName, socketId }

io.on('connection', (socket) => {
  // Existing socket code...

  socket.on('user update', (user) => {
    onlineUsers.set(user.userId, { 
      displayName: user.displayName, 
      socketId: socket.id 
    });
    
    // Send the updated user list to all clients
    io.emit('users online', Array.from(onlineUsers.entries()).map(([userId, data]) => ({
      userId,
      displayName: data.displayName
    })));
    
    // Broadcast the user update
    socket.broadcast.emit('user updated', {
      userId: user.userId,
      displayName: user.displayName
    });
  });

  socket.on('disconnect', () => {
    // Find and remove the disconnected user
    for (const [userId, data] of onlineUsers.entries()) {
      if (data.socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit('user left', userId);
        break;
      }
    }
  });
});

server.listen(3000, () => {
    console.log("server running on http://localhost:3000");
});
