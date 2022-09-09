const mongoose = require("mongoose");
// const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const fileSchema = new Schema({
  phoneNumber: { type: String, required: true },
  countryCode: { type: String },
  emiratesId: { type: String, required: true },
  fileNumber: { type: String },
  password: { type: String, required: true },
  familyMembers: { type: Array },
  clinicVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  image: { type: String },
  created: {
    type: Date,
    default: Date.now,
  },
});

// userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("File", fileSchema);
