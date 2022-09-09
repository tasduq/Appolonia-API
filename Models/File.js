const mongoose = require("mongoose");
// const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const fileSchema = new Schema({
  phoneNumber: { type: String, required: true },
  emiratesId: { type: String, required: true, unique: true },
  fileNumber: { type: String, unique: true },
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
