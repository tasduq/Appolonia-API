const mongoose = require("mongoose");
// const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const filePhoneVerificationSchema = new Schema({
  otp: { type: String, required: true },
  fileId: {
    type: String,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  expires: {
    type: Date,
  },
});

// roleSchema.plugin(uniqueValidator);

module.exports = mongoose.model(
  "Filephoneverfication",
  filePhoneVerificationSchema
);
