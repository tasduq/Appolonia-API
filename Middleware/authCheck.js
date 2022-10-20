const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const { JWTKEY } = require("../Config/config");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  console.log(authorization, "I am headers data");

  // if (!authorization) {
  //   return res.json({
  //     serverError: 0,
  //     authError: "1",
  //     data: { success: 0 },
  //     message: "You must be login",
  //   });
  // }

  // const token = authorization.replace("Bearer ", "");
  // jwt.verify(token, JWTKEY, async (err, payload) => {
  //   if (err) {
  //     console.log(err);
  //     return res.json({
  //       serverError: 0,
  //       authError: "1",
  //       data: { success: 0 },
  //       message: "Token Expired. Login again",
  //     });
  //   }
  //   const { userId } = payload;
  //   console.log(userId, "i am userId");

  //   const user = await User.findById(userId);
  //   req.user = user;
  //   next();
  // });
  next();
};
