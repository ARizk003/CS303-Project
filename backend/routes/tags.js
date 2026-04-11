const express        = require("express");
const router         = express.Router();
const tagsController = require("../controllers/tagsController");

const auth          = require("../middleware/auth");
const { adminOnly } = require("../middleware/auth");

router.get("/",  tagsController.getAllTags);

router.post("/", auth, adminOnly, tagsController.createTag);

router.put("/:id", auth, adminOnly, tagsController.updateTag);

router.delete("/:id", auth, adminOnly, tagsController.deleteTag);

module.exports = router;