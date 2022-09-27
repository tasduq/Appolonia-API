const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const customPageSchema = new Schema({
  title: { type: String },
  description: { type: String },
  pageId: { type: String },
  created: {
    type: Date,
    default: Date.now,
  },
});

// userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Custompage", customPageSchema);
