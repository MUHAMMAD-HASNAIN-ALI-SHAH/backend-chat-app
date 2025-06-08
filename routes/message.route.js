const express = require("express");
const protectRoute = require("../middlewares/auth.middleware.js");
const { getMessages } = require("../controllers/message.controller.js");

const router = express.Router();

router.route("/get-messages/:chatId").get(protectRoute, getMessages);

module.exports = router;
