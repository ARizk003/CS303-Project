const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const profileController = require("../controllers/profileController");
// const { uploadProfileImage } = require("../middleware/upload");

router.get("/", auth, profileController.getProfile);
router.put("/", auth, profileController.updateProfile);
// router.post("/image", auth, uploadProfileImage, profileController.uploadProfileImage);

module.exports = router;