const mongoose = require("mongoose");
// const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const fileSchema = new Schema({
  phoneNumber: { type: String },
  countryCode: { type: String },
  password: { type: String },
  familyMembers: { type: Array },
  clinicVerified: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  activeRequested: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  image: { type: String },
  city: { type: String },
  created: {
    type: Date,
    default: Date.now,
  },
  emiratesId: { type: String },
  uniqueId: { type: String }, //emiid
});

// userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("File", fileSchema);
