const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

router.get("/me", auth, authController.getMe);
router.put("/update-role", auth, authController.updateUserRole);
router.get("/users", auth, authController.getAllUsers);

module.exports = router;