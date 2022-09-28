const express = require("express");

const scansController = require("../controllers/scans-controllers");

const router = express.Router();

router.post("/submitscans", scansController.submitScans);
router.post("/getmyscans", scansController.getMyScans);
router.post("/getallscans", scansController.getAllScans);

module.exports = router;
