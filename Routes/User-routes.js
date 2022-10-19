const express = require("express");
const usersController = require("../controllers/user-controllers");
const authCheck = require("../Middleware/authCheck");

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: "dbff6tzuo",
  api_key: "376437619835514",
  api_secret: "Jz-U91pJTdFnbWN4X6Lx3fj6pC4",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "CONTACT",
  },
});

const upload = multer({ storage: storage });
// const upload = multer({ dest: "uploads/" });

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
router.post("/profileget", authCheck, usersController.getUserdata);
router.post("/changepassword", authCheck, usersController.changePassword);
router.post("/updateprofile", authCheck, usersController.updateUserProfile);
router.post("/deleteaccount", usersController.deleteAccount);

router.get("/getalldoctors", authCheck, usersController.getAllDoctors);

module.exports = router;
