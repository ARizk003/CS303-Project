const Book = require("../models/Book");

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.addToFavorite = async (req, res) => {
  try {
    res.json({ msg: "Added to favorites" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.addBook = async (req, res) => {
  try {
    const { title, author, category, pdfUrl } = req.body;
    
    const book = new Book({
      title,
      author,
      category,
      pdfUrl,
      addedBy: req.user.id
    });
    
    await book.save();
    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ msg: "Book not found" });
    }
    
    await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ msg: "Book updated" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ msg: "Book not found" });
    }
    
    await Book.findByIdAndDelete(req.params.id);
    res.json({ msg: "Book deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};