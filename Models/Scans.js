const mongoose = require("mongoose");
// const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const scansSchema = new Schema({
  userId: { type: String },
  doctorId: { type: String },
  scanImages: { type: Array },
  created: {
    type: Date,
  },
});

// roleSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Scans", scansSchema);
