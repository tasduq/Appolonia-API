const express = require("express");
const authCheck = require("../Middleware/authCheck");

const scansController = require("../controllers/scans-controllers");

const router = express.Router();

router.post("/submitscans", authCheck, scansController.submitScans);
router.post("/getmyscans", authCheck, scansController.getMyScans);
router.post("/getallscans", authCheck, scansController.getAllScans);

module.exports = router;
