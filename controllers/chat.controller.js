const User = require("../models/user.model");
const Chat = require("../models/chat.model");
const Message = require("../models/message.model");
const { getRecieverSocketId, io } = require("../config/socket");

// Find a user by username
const findUser = async (req, res) => {
  try {
    const { username } = req.body;

    const getUser = await User.findOne({ username }).select("-password -__v");

    if (!getUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: getUser });
  } catch (error) {
    console.error("Error in finding user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new chat and send the first message
const newChat = async (req, res) => {
  try {
    const { recieverId, message } = req.body;
    const userId = req.user._id;

    const getUser = await User.findById(recieverId);
    if (!getUser) {
      return res.status(404).json({ message: "Receiver user not found" });
    }

    // Check if chat already exists (either direction)
    const checkAlreadyChat = await Chat.findOne({
      $or: [
        { firstUserId: userId, secondUserId: recieverId },
        { firstUserId: recieverId, secondUserId: userId },
      ],
    });

    if (checkAlreadyChat) {
      return res
        .status(400)
        .json({ message: "Chat already exists with this user" });
    }

    // Create chat
    const newChat = await Chat.create({
      firstUserId: userId,
      secondUserId: recieverId,
      lastMessage: message,
      lastMessageTime: Date.now(),
    });

    // Create message
    const newMessage = await Message.create({
      userId: userId,
      recieverId: recieverId,
      chatId: newChat._id,
      text: message,
      isRead: false,
    });

    const chatToSend = await Chat.findById(newChat._id).populate(
      "firstUserId secondUserId",
      "-password -__v"
    );

    // Emit to receiver if online
    const recieverSocketId = getRecieverSocketId(recieverId);
    if (recieverSocketId) {
      io.to(recieverSocketId).emit("new-chat", {
        chat: chatToSend,
      });
    }

    res
      .status(200)
      .json({ message: "Chat created successfully", chat: chatToSend });
  } catch (error) {
    console.error("Error in new Chat:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all chats of the current user
const getChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({
      $or: [{ firstUserId: userId }, { secondUserId: userId }],
    })
      .populate("firstUserId", "-password -__v")
      .populate("secondUserId", "-password -__v")
      .sort({ lastMessageTime: -1 });

    res.status(200).json({ chats });
  } catch (error) {
    console.error("Error in fetching chats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  findUser,
  newChat,
  getChats,
};
