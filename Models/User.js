const mongoose = require("mongoose");
// const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  countryCode: { type: String },
  emiratesId: { type: String, required: true },
  // role: {
  //   type: Schema.Types.ObjectId,
  //   ref: "Role",
  // },
  gender: { type: String },
  city: { type: String },
  dob: { type: String },
  role: {
    type: String,
  },
  image: { type: String },
  created: {
    type: Date,
    default: Date.now,
  },
  uniqueId: { type: String },
});

// userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
