const socket = io(); // Connect to the server

// Profile Picture Preview from File Input
function previewProfilePicFromFile(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function () {
    const profilePic = document.getElementById("profile-pic");
    profilePic.src = reader.result;
  };

  if (file) {
    reader.readAsDataURL(file);
  }
}

// Username Update
function updateUsername() {
  const usernameInput = document.getElementById("username-input");
  const username = usernameInput.value.trim();

  if (username !== "") {
    console.log("Username updated:", username);
    socket.emit("user update", { userId: socket.id, displayName: username }); // Send username to the server
  }
}

// Send Message Function
function sendMessage() {
  const messageInput = document.getElementById("message-input");
  const messageText = messageInput.value.trim();
  const usernameInput = document.getElementById("username-input");
  const username = usernameInput.value.trim() || "Anonymous";

  if (messageText !== "") {
    const messageData = {
      userId: socket.id,
      displayName: username,
      messageText: messageText,
    };

    socket.emit("chat message", messageData); // Send message to server
    messageInput.value = "";
  }
}

// Listen for new messages from server
socket.on("chat message", (data) => {
  displayMessage(data);
});

// Load chat history
socket.on("chat history", (history) => {
  history.forEach(displayMessage);
});

// Append message to chat
function displayMessage(data) {
  const messageContainer = document.getElementById("message-container");
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");

  const avatarElement = document.createElement("img");
  avatarElement.src = document.getElementById("profile-pic").src || "default-avatar.png";
  avatarElement.classList.add("avatar");

  const usernameElement = document.createElement("span");
  usernameElement.classList.add("username");
  usernameElement.textContent = data.displayName;

  const textElement = document.createElement("span");
  textElement.classList.add("text");
  textElement.textContent = data.messageText;

  const avatarAndUsernameContainer = document.createElement("div");
  avatarAndUsernameContainer.classList.add("avatar-username-container");
  avatarAndUsernameContainer.appendChild(avatarElement);
  avatarAndUsernameContainer.appendChild(usernameElement);

  messageElement.appendChild(avatarAndUsernameContainer);
  messageElement.appendChild(textElement);

  messageContainer.appendChild(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}
