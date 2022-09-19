const mongoose = require("mongoose");
// const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const forgotPhoneVerificationSchema = new Schema({
  otp: { type: String },
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
  "Forgotphoneverfication",
  forgotPhoneVerificationSchema
);
