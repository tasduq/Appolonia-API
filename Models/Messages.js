const mongoose = require("mongoose");
// const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const messagesSchema = new Schema(
  {
    conversationId: { type: String },
    senderId: { type: String },
    message: { type: String },
    format: { type: String },
    scanId: { type: String },
  },
  { timestamps: true }
);

// userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Messages", messagesSchema);
