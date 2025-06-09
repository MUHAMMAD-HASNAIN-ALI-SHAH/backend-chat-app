const { getRecieverSocketId, io } = require("../config/socket");
const Message = require("../models/message.model");
const cloudinary = require("../config/cloudinary.js");
const Chat = require("../models/chat.model.js");

const sendMessage = async (req, res) => {
  try {
    const { text, image, chatId, recieverId } = req.body;
    const userId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      userId,
      recieverId,
      chatId,
      text,
      image: imageUrl,
    });
    await newMessage.save();

    const getChat = await Chat.findById(chatId);
    if (!getChat) {
      return res.status(404).json({ error: "Chat not found" });
    }
    getChat.lastMessage = newMessage.text;
    getChat.updatedAt = new Date();
    await getChat.save();

    const receiverSocketId = getRecieverSocketId(recieverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      io.to(receiverSocketId).emit("chatUpdate", {
        chatId: getChat._id,
        lastMessage: newMessage.text,
      });
    }

    res.status(200).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    console.log("Fetching messages for chatId:", chatId);
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

    if (!messages) {
      return res.status(200).json({ message: [] });
    }

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error in fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};
