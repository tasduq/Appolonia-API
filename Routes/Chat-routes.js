const express = require("express");

const chatController = require("../controllers/chat-controllers");

const router = express.Router();

router.post("/newchat", chatController.newChat);
router.post("/getconversations", chatController.getConversations);
router.post("/getconversationmessages", chatController.getConversationMessages);
router.post("/newmessage", chatController.newMessage);

module.exports = router;
