const express = require("express");

const fileController = require("../controllers/file-controllers");

const router = express.Router();

router.post("/getfilefamilymembers", fileController.getFileFamilyMembers);
router.post("/connectmembertofile", fileController.connectMemberToFile);

module.exports = router;
