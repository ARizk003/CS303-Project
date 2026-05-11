const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const profileController = require("../controllers/profileController");
const { uploadProfileImage } = require("../middleware/upload");

router.use(auth);
router.get("/", profileController.getProfile);
router.put("/", profileController.updateProfile);
// processes the image in uploadProfileImage middleware multer function
// , then passes it against metadata to the controller
router.post("/image", auth, uploadProfileImage, profileController.uploadProfileImage);

module.exports = router;