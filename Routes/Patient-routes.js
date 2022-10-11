const express = require("express");

const patientController = require("../controllers/patient-controllers");

const router = express.Router();

router.get("/getallpatients", patientController.getAllPatients);

module.exports = router;
