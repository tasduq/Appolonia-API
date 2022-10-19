const express = require("express");
const authCheck = require("../Middleware/authCheck");

const patientController = require("../controllers/patient-controllers");

const router = express.Router();

router.get("/getallpatients", authCheck, patientController.getAllPatients);

module.exports = router;
