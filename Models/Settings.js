const mongoose = require("mongoose");
// const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const settingsSchema = new Schema({
  version: { type: String },
  fcmKey: { type: String },
  clinicName: { type: String },
  clinicLogo: { type: String },
  forceUpdate: { type: Boolean, default: false },
});

// roleSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Setting", settingsSchema);
