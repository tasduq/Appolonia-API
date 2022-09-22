const mongoose = require("mongoose");
// const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const messagesSchema = new Schema(
  {
    conversationId: { type: String },
    sender: { type: String },
    message: { type: String },
  },
  { timestamps: true }
);

// userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Messages", messagesSchema);
