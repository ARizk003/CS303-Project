const Book = require("../models/Book");
const Tag  = require("../models/Tag");

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate("tags", "name");
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
    const { title, author, category, pdfUrl, tag_ids } = req.body;

    if (tag_ids && tag_ids.length > 0) {
      const foundTags = await Tag.find({ _id: { $in: tag_ids } }).select("_id");
      if (foundTags.length !== tag_ids.length) {
        return res.status(400).json({ msg: "One or more tag IDs are invalid" });
      }
    }

    const book = new Book({
      title,
      author,
      category,
      pdfUrl,
      addedBy: req.user.id,
      tags: tag_ids && tag_ids.length > 0 ? [...new Set(tag_ids)] : []
    });

    await book.save();

    const populated = await book.populate("tags", "name");
    res.json(populated);

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

    if (req.body.tag_ids && req.body.tag_ids.length > 0) {
      const foundTags = await Tag.find({ _id: { $in: req.body.tag_ids } }).select("_id");
      if (foundTags.length !== req.body.tag_ids.length) {
        return res.status(400).json({ msg: "One or more tag IDs are invalid" });
      }
      req.body.tags = [...new Set(req.body.tag_ids)];
      delete req.body.tag_ids;
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