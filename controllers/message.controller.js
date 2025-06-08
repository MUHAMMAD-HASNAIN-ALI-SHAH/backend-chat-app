const Message = require("../models/message.model");

const sendMessage = async (req, res) => {
  try {
    const { text, image, chatId } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      chatId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    io.to(receiverSocketId).emit("newMessages", newMessage);

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

    console.log("Messages fetched successfully:", messages);

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
