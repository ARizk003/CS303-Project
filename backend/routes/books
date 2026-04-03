const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const { adminOnly } = require("../middleware/auth");

const booksController = require("../controllers/booksController");


router.get("/", booksController.getAllBooks);


router.post("/favorite", auth, booksController.addToFavorite);


router.post("/", auth, adminOnly, booksController.addBook);

router.put("/:id", auth, adminOnly, booksController.updateBook);

router.delete("/:id", auth, adminOnly, booksController.deleteBook);


module.exports = router;