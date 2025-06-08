const express = require("express");
const protectRoute = require("../middlewares/auth.middleware.js");
const { getMessages, sendMessage } = require("../controllers/message.controller.js");

const router = express.Router();

router.route("/get-messages/:chatId").get(protectRoute, getMessages);
router.route("/send-message").post(protectRoute, sendMessage);

module.exports = router;
