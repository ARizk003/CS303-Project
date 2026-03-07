const express = require("express");
const router = express.Router();
const { registerUser, loginUser, sendOtp, verifyOtp } = require("../controllers/authController");

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;