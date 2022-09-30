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
router.post("/newotp", usersController.requestNewOtp);

router.post("/login", usersController.login);
router.post("/logout", usersController.logout);
router.post("/forgotpassword", usersController.requestForgotOtp);

router.post("/verifyforgototp", usersController.verifyForgotOtp);
router.post("/newpasswordforgot", usersController.newPassword);

router.post("/contact", upload.array("files"), usersController.contact);
router.post("/profileget", usersController.getUserdata);
router.post("/changepassword", usersController.changePassword);
router.post("/updateprofile", usersController.updateUserProfile);
router.post("/deleteaccount", usersController.deleteAccount);

router.get("/getalldoctors", usersController.getAllDoctors);

module.exports = router;
