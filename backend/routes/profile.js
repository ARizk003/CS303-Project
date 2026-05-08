const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const profileController = require("../controllers/profileController");
const { uploadProfileImage } = require("../middleware/upload");

router.use(auth);
router.get("/", profileController.getProfile);
router.put("/", profileController.updateProfile);
router.post("/image", auth, uploadProfileImage, profileController.uploadProfileImage);

module.exports = router;