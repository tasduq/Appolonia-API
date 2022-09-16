const express = require("express");

const usersController = require("../controllers/user-controllers");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const router = express.Router();

// router.get("/", usersController.getUsers);

router.post("/signup", usersController.signup);
router.post("/checkpatient", usersController.checkPatient);
router.post("/phoneverify", usersController.emailVerify);
router.post("/fileverify", usersController.fileVerify);
// router.post("/newotp", usersController.requestNewEmailOtp);

router.post("/login", usersController.login);
router.post("/forgotpassword", usersController.requestForgotOtp);
router.post("/newotp", usersController.requestNewOtp);
router.post("/verifyforgototp", usersController.verifyForgotOtp);
router.post("/newpasswordforgot", usersController.newPassword);

router.post("/contact", upload.array("files"), usersController.contact);
router.post("/profileget", usersController.getUserdata);
router.post("/changepassword", usersController.changePassword);

module.exports = router;
