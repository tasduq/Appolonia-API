const express = require("express");
const authCheck = require("../Middleware/authCheck");

const customPageController = require("../controllers/custompage-controllers");

const router = express.Router();

// router.get(
//   "/getarticles",
//   // authCheck,
//   customPageController.getArticles
// );
router.post(
  "/getcustompages",
  // authCheck,
  customPageController.getCustomPages
);

module.exports = router;
