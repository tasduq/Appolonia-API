const mongoose = require("mongoose");
// const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const roleSchema = new Schema({
  roleName: { type: String, required: true },
  roleId: { type: String },
  created: {
    type: Date,
    default: Date.now,
  },
});

// roleSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Role", roleSchema);
