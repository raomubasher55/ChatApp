require("dotenv").config();
const { default: mongoose } = require("mongoose");
mongoose.connect("mongodb://localhost:27017/chatApp");
const app = require("express")();
const http = require("http").Server(app);
const express = require("express");
const path = require("path");
const User = require("./models/User");

const userRoute = require("./routes/userRoutes");
const Chat = require("./models/Chat");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); // For parsing JSON
app.use(express.urlencoded({ extended: true }));

app.use("/auth", userRoute);
const io = require("socket.io")(http);
const usp = io.of("/user-namespace");

usp.on("connection", async function (socket) {
  const userId = socket.handshake.auth.token;
  await User.findByIdAndUpdate({ _id: userId }, { $set: { isOnline: "1" } });
  // user broadcast online status
  socket.broadcast.emit("getOnlineUser", { userId: userId });

  // Handle incoming messages
  socket.on("sendMessage", async (data) => {
    const { senderId, receiverId, message } = data;

    // Emit the message to the recipient
    socket.broadcast.emit("receiveMessage", {
      senderId,
      receiverId,
      message,
    });

    // Optional: Save the message to the database
    const newMessage = new Chat({
      senderId,
      receiverId,
      message,
    });
    await newMessage.save();
  });

  //   load old Chat
  socket.on("existsChat", async function (data) {
    const chats = await Chat.find({
      $or: [
        { senderId: data.senderId, receiverId: data.receiverId },
        { senderId: data.receiverId, receiverId: data.senderId },
      ],
    });

    socket.emit("loadChats", { chats: chats });
  });

  // delete chats
  socket.on("chatDeleted", function (id) {
    socket.broadcast.emit("chatMessageDeleted", id);
  });

  // update chats
  socket.on("chatUpdated", (data) => {
      socket.broadcast.emit("chatMessageUpdated" , data)
  });

 

  socket.on("disconnect", async function () {
    console.log("user Discount ");
    await User.findByIdAndUpdate({ _id: userId }, { $set: { isOnline: "0" } });
    // user boardcast  offline status
    socket.broadcast.emit("getOfflineUser", { userId: userId });
    console.log("user offline with id", userId);
  });
});

http.listen(4000, function () {
  console.log("Server is Running");
});
