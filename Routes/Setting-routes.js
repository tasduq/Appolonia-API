const express = require("express");
const authCheck = require("../Middleware/authCheck");

const settingController = require("../controllers/setting-controllers");

const router = express.Router();

router.get("/getroles", settingController.getRoles);
router.post("/createrole", settingController.createRole);
router.post("/addsettingsdata", settingController.addSettingsData);
router.get("/getsettings", settingController.getSettings);
// router.post("/createrole", settingController.createRole);

module.exports = router;
