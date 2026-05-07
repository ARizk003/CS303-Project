const express              = require("express");
const router               = express.Router({ mergeParams: true });
const auth                 = require("../middleware/auth");
const highlightsController = require("../controllers/highlightscontroller");

router.use(auth);

router.get("/",    highlightsController.getHighlightsForBook);
router.post("/",   highlightsController.createHighlight);
router.put("/:highlightId",    highlightsController.updateHighlight);
router.delete("/:highlightId", highlightsController.deleteHighlight);

module.exports = router;