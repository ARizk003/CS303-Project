const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { studentOnly } = auth;

const authController = require("../controllers/authController");

const listController = require("../controllers/listController");

const bookController = require("../controllers/booksController");



router.use(auth);

router.get("/", listController.getAllUsersLists);


router.post("/", studentOnly, listController.createList);

router.patch("/:listId/add", listController.addBookToList);

router.patch("/:listId/remove", listController.removeBookFromLists);

router.delete("/:listId", listController.deleteList);

module.exports = router;