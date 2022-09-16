const express = require("express");

const usersController = require("../controllers/user-controllers");

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

// router.post("/editbio", usersController.editBio);
// router.post("/edituserinfo", usersController.editUserInfo);
// router.post("/edituserimage", usersController.updateUserImage);

module.exports = router;
