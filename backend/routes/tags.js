const express        = require("express");
const router         = express.Router();
const { auth, adminOnly } = require("../middleware/auth");
const tagsController = require("../controllers/tagsController");

router.post("/", auth, adminOnly, tagsController.createTag);

router.get("/", tagsController.getAllTags);

module.exports = router;