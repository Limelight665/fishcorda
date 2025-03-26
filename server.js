// Front-End JavaScript

// Connect to the server using socket.io
const socket = io();

// Get the message container
const messageContainer = document.getElementById("message-container");

// Listen for new messages from other users
socket.on("newMessage", (messageData) => {
  const messageElement = createMessageElement(messageData);
  messageContainer.appendChild(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight;
});

// Listen for the previous messages when the page loads
socket.on("previousMessages", (messages) => {
  messages.forEach((messageData) => {
    const messageElement = createMessageElement(messageData);
    messageContainer.appendChild(messageElement);
  });
});

// Function to create a new message element
function createMessageElement(messageData) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");

  const avatarElement = document.createElement("img");
  const profilePicSrc = messageData.profilePic;
  avatarElement.src = profilePicSrc ? profilePicSrc : "default-avatar.png";
  avatarElement.classList.add("avatar");

  const usernameElement = document.createElement("span");
  usernameElement.classList.add("username");
  usernameElement.textContent = messageData.username;

  const textElement = document.createElement("span");
  textElement.classList.add("text");
  textElement.textContent = messageData.message;

  const avatarAndUsernameContainer = document.createElement("div");
  avatarAndUsernameContainer.classList.add("avatar-username-container");
  avatarAndUsernameContainer.appendChild(avatarElement);
  avatarAndUsernameContainer.appendChild(usernameElement);

  messageElement.appendChild(avatarAndUsernameContainer);
  messageElement.appendChild(textElement);

  return messageElement;
}

// Update the send message function to emit the message using socket.io
function sendMessage() {
  const messageInput = document.getElementById("message-input");
  const messageText = messageInput.value.trim();

  const usernameInput = document.getElementById("username-input");
  const username = usernameInput.value.trim() || "Anonymous"; // Default to "Anonymous" if no username

  if (messageText) {
    const profilePicSrc = document.getElementById("profile-pic").src;

    // Create message object
    const messageData = {
      username: username,
      message: messageText,
      profilePic: profilePicSrc
    };

    // Emit the message to the server
    socket.emit("sendMessage", messageData);

    // Clear input field
    messageInput.value = "";
  }
}
