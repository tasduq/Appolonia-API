const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  db: process.env.DB,
  JWTKEY: process.env.JWT,
  SMTPPASS: process.env.SMTPPASS,
  authToken: process.env.authToken,
  accountSid: process.env.accountSid,
};
