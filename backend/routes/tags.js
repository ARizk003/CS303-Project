const express        = require("express");
const router         = express.Router();
const tagsController = require("../controllers/tagsController");


const auth               = require("../middleware/auth");
const { adminOnly }      = require("../middleware/auth");

router.post("/", auth, adminOnly, tagsController.createTag);
router.get("/",  tagsController.getAllTags);

module.exports = router;