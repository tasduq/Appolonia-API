const mongoose = require("mongoose");
// const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const conversationSchema = new Schema(
  {
    members: { type: Array },
    membersData: { type: Array },
  },
  { timestamps: true }
);

// userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Conversation", conversationSchema);
