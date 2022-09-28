const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const librarySchema = new Schema({
  name: { type: String },
  description: { type: String },
  image: { type: String },
  author: { type: Object },
  created: {
    type: Date,
    default: Date.now,
  },
});

// userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Library", librarySchema);
