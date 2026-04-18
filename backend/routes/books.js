const express            = require("express");
const router             = express.Router();
const auth               = require("../middleware/auth");
const { adminOnly }      = require("../middleware/auth");
const booksController    = require("../controllers/booksController");
const tagsController     = require("../controllers/tagsController");
const ratingsController  = require("../controllers/ratingsController");
const { upload, handleUploadError } = require("../middleware/upload");

function optionalAuth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return next();
  try {
    const jwt           = require("jsonwebtoken");
    const { jwtSecret } = require("../config/jwt");
    const decoded       = jwt.verify(token, jwtSecret);
    req.user            = decoded.user;
  } catch {}
  next();
}

router.get("/search", booksController.searchBooks);
router.get("/", booksController.getAllBooks);
router.get("/:id", booksController.getBookById);
router.get("/:id/view", auth, booksController.viewBook);

router.post("/", auth, adminOnly, upload.single("pdf"), handleUploadError, booksController.addBook);
router.post("/favorite", auth, booksController.addToFavorite);
router.put("/:id", auth, adminOnly, booksController.updateBook);
router.delete("/:id", auth, adminOnly, booksController.deleteBook);

router.post("/:id/tags", auth, adminOnly, tagsController.assignTagsToBook);
router.get("/:id/tags",  tagsController.getBookTags);

router.post("/:id/rate",   auth,         ratingsController.rateBook);
router.get("/:id/rating",  optionalAuth, ratingsController.getBookRating);

router.post("/:id/drawing",              auth, booksController.saveDrawing);
router.get("/:id/drawing/:pageNumber",   auth, booksController.getDrawing);
router.delete("/:id/drawing/:pageNumber",auth, booksController.deleteDrawing);

module.exports = router;