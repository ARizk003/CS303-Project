const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");


// client:362 Cross-Origin-Opener-Policy policy would block the window.postMessage call.
//     client:362 Cross-Origin-Opener-Policy policy would block the window.postMessage call.

// ***********************************************
// :5000/api/auth/google-send-otp:1
// *********************************************
// Failed to load resource: the server responded with a status of 404 (Not Found)
// Signup.jsx:60 AxiosError: Request failed with status code 404
// at async Object.handleGoogleSuccess [as current]


//// route Fix came from here
router.post("/send-otp", authController.sendOtp);



router.post("/verify-otp", authController.verifyOtp);

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

router.get("/me", auth, authController.getMe);
router.put("/update-role", auth, authController.updateUserRole);
router.get("/users", auth, authController.getAllUsers);

module.exports = router;