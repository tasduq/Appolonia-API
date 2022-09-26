const User = require("../Models/User");
const Role = require("../Models/Role");
const File = require("../Models/File");
const Conversation = require("../Models/Conversations");
const Message = require("../Models/Messages");

const newChat = async (req, res) => {
  console.log(req.body);
  const { senderId, receiverId, message, membersData } = req.body;
  if ((senderId, receiverId, message)) {
    let conversations = await Conversation.find({
      members: { $in: [senderId] },
    });

    let foundConversation = conversations.map((convo) =>
      convo.members.some((member) => member === receiverId)
    );

    console.log(foundConversation, "Found conversations");
    if (foundConversation?.length > 0) {
      if (foundConversation[0] === true) {
        res.json({
          errorCode: 0,
          message: "You already have a conversation on going",
          data: {
            success: 0,
            chatExist: 1,
          },
        });
        return;
      }
    }

    let createdConversation = new Conversation({
      members: [senderId, receiverId],
      membersData: membersData,
    });

    try {
      createdConversation.save((err, doc) => {
        if (err) {
          throw new Error("Error Creating the Chat");
        } else {
          console.log(doc, "doc there");
          let createdMessage = new Message({
            conversationId: doc._id,
            senderId: senderId,
            message: message,
          });

          createdMessage.save((err) => {
            if (err) {
              throw new Error("Error Creating the message");
            } else {
              res.json({
                errorCode: 0,
                message: "Message Sent",
                data: {
                  success: 1,
                },
              });
            }
          });
        }
      });
    } catch (err) {
      res.json({
        errorCode: 1,
        message: err.message,
        data: {
          success: 0,
        },
      });
    }
  }
};

const getConversations = async (req, res) => {
  console.log(req.body);
  let conversations = await Conversation.find({
    members: { $in: [req.body.userId] },
  });

  if (conversations?.length > 0) {
    res.json({
      errorCode: 0,
      message: "Found conversations",
      data: {
        success: 1,
        conversations: conversations,
      },
    });
  } else {
    res.json({
      errorCode: 0,
      message: "Found no conversations",
      data: {
        success: 0,
        conversations: conversations,
      },
    });
  }
};

const getConversationMessages = async (req, res) => {
  console.log(req.body);
  const { conversationId, bottomHit } = req.body;
  try {
    console.log("sea");
    let foundMessages = await Message.find({ conversationId: conversationId })
      .sort({ _id: 1 })
      .skip(bottomHit > 0 ? (bottomHit - 1) * 10 : 0)
      .limit(10);

    console.log(foundMessages.length, "foundMessages");

    if (foundMessages.length > 0) {
      res.json({
        errorCode: 0,
        message: "Messages Found",
        data: {
          success: 1,
          messages: foundMessages,
        },
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      errorCode: 1,
      message: err.message,
      data: {
        success: 0,
      },
    });
  }
};

const newMessage = (async = (req, res) => {
  console.log(req.body);
  const { conversationId, senderId, message } = req.body;
  try {
    if ((conversationId, senderId, message)) {
      let createdMessage = new Message({
        conversationId,
        senderId,
        message,
      });
      createdMessage.save((err) => {
        if (err) {
          console.log(err);
          throw new Error("Error saving Message");
        } else {
          res.json({
            errorCode: 0,
            data: {
              success: 1,
            },
            message: "message saved",
          });
        }
      });
    } else {
      throw new Error("Somthing is missing");
    }
  } catch (err) {
    console.log(err);
    res.json({
      errorCode: 1,
      message: err.message,
      data: {
        success: 0,
      },
    });
  }
});

module.exports = {
  newChat,
  getConversations,
  getConversationMessages,
  newMessage,
};