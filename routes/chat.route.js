const express = require("express");
const protectRoute = require("../middlewares/auth.middleware.js");
const { findUser, getChats, newChat, getMessages } = require("../controllers/chat.controller.js");

const router = express.Router();

router.route("/find-user").post(protectRoute, findUser);
router.route("/get-chats").get(protectRoute, getChats);
router.route("/new-chat").post(protectRoute, newChat);

module.exports = router;
