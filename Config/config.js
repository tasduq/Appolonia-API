const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  db: process.env.DB,
  JWTKEY: process.env.JWT,
};
