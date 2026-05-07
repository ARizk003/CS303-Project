const express=require("express");
const router=express.Router({ mergeParams: true });
const auth=require("../middleware/auth");
const commentsController=require("../controllers/commentsController");

router.get("/", commentsController.getBookComments);
router.post("/", auth, commentsController.createComment);
router.put("/:commentId", auth, commentsController.updateComment);
router.delete("/:commentId", auth, commentsController.deleteComment);

module.exports = router;