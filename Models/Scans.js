const mongoose = require("mongoose");
// const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const scansSchema = new Schema({
  userId: { type: String },
  doctorId: { type: String },
  doctorName: { type: String },
  faceScanImages: { type: Array },
  teethScanImages: { type: Array },
  created: {
    type: Date,
  },
});

// roleSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Scans", scansSchema);
