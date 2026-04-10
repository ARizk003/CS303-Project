const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { studentOnly } = auth;

const authController = require("../controllers/authController");

const listController = require("../controllers/listController");

const bookController = require("../controllers/booksController");



router.use(auth);

// GET: Fetch all lists belonging to the logged-in user
router.get("/", listController.getAllUsersLists);

// POST: Create a new empty list
// Note: You'll need to create this function in your controller!
router.post("/", studentOnly, listController.createList);

// PATCH: Add a book to a specific list
router.patch("/:listId/add", listController.addBookToList);

// PATCH: Remove a book from a specific list
router.patch("/:listId/remove", listController.removeBookFromLists);

// DELETE: Remove a list and its references
router.delete("/:listId", listController.deleteList);

module.exports = router;