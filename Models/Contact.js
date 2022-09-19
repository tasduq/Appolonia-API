const mongoose = require("mongoose");
// const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const contactSchema = new Schema({
  name: { type: String },
  contactInfo: { type: String },
  subject: { type: String },
  message: { type: String },
  files: { type: Array },
  appVersion: { type: String },
  appOsVersion: { type: String },
  source: { type: String, default: "mobile" },
  created: {
    type: Date,
    default: Date.now,
  },
});

// userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Contact", contactSchema);
