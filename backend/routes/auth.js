const express = require("express");
const router  = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");


const rateLimit = require("express-rate-limit");

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    msg: "Too many password reset requests from this IP. Please try again after 15 minutes."
  }
});

router.post("/register",        authController.registerUser);
router.post("/login",           authController.loginUser);
router.post("/google-login",    authController.googleLogin);
router.get("/me",               auth, authController.getMe);
router.put("/update-role",      auth, authController.updateUserRole);
router.get("/users",            auth, authController.getAllUsers);
router.post("/forgot-password", forgotPasswordLimiter, authController.forgotPassword);
router.post("/reset-password",  authController.resetPassword);
module.exports = router;