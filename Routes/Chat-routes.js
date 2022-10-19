const express = require("express");
const authCheck = require("../Middleware/authCheck");

const chatController = require("../controllers/chat-controllers");

const router = express.Router();

router.post("/newchat", authCheck, chatController.newChat);
router.post("/getconversations", authCheck, chatController.getConversations);
router.post(
  "/getconversationmessages",
  authCheck,
  chatController.getConversationMessages
);
router.post("/newmessage", authCheck, chatController.newMessage);

module.exports = router;
