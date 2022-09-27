const express = require("express");
const authCheck = require("../Middleware/authCheck");

const libraryController = require("../controllers/library-controllers");

const router = express.Router();

router.get(
  "/getarticles",
  // authCheck,
  libraryController.getArticles
);
router.post(
  "/getsinglearticle",
  // authCheck,
  libraryController.getSingleArticle
);

module.exports = router;
