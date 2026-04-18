const axios = require('axios');
const path = require("path");
const fs   = require("fs");
const Book = require("../models/Book");
const Tag  = require("../models/Tag");

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find()
      .select("-pdfPath")         
      .populate("tags", "name");
    res.json(books);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .select("-pdfPath")
      .populate("tags", "name");

    if (!book) {
      return res.status(404).json({ msg: "Book not found" });
    }

    res.json({
      ...book.toObject(),
      viewUrl: `/api/books/${book._id}/view`  
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.viewBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).select("pdfPath title");
    if (!book) return res.status(404).json({ msg: "Book not found" });

   
if (book.pdfPath.startsWith('http')) {
  let pdfUrl = book.pdfPath;
  if (pdfUrl.includes('cloudinary.com') && !pdfUrl.includes('/raw/upload/')) {
    pdfUrl = pdfUrl.replace('/upload/', '/raw/upload/');
  }

  const response = await axios({
    method: 'get',
    url: pdfUrl,
    responseType: 'stream'
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(book.title)}.pdf"`);
  res.setHeader("Access-Control-Allow-Origin", "*");
  return response.data.pipe(res);
}

    const oldPath = path.resolve(book.pdfPath);
    if (fs.existsSync(oldPath)) {
      return res.sendFile(oldPath);
    }

    res.status(404).json({ msg: "File not found" });

  } catch (err) {
    console.error("View Error:", err.message);
    res.status(500).send("Error fetching book from cloud");
  }
};

exports.addBook = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "PDF file is required" });
    }

    const { title, author, category, tag_ids } = req.body;

    if (!title || !author || !category) {
      return res.status(400).json({ msg: "title, author, and category are required" });
    }

    const book = new Book({
      title,
      author,
      category,
      pdfPath: req.file.path,  
      addedBy: req.user.id,
      tags: tag_ids && tag_ids.length > 0 ? [...new Set(tag_ids)] : []
    });

    await book.save();
    const populated = await book.populate("tags", "name");
    const response = populated.toObject();
    delete response.pdfPath;

    res.status(201).json(response);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: "Book not found" });

    await Book.findByIdAndDelete(req.params.id);
    res.json({ msg: "Book deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.searchBooks = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.status(400).json({ msg: "Query required" });

    const regex = new RegExp(q.trim(), "i");
    const books = await Book.find({
      $or: [{ title: regex }, { author: regex }]
    })
    .select("-pdfPath")
    .populate("tags", "name");

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
    res.status(500).send("Server error");
  }
};

exports.updateBook = async (req, res) => {
  try {
    await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ msg: "Book updated" });
  } catch (err) {
    res.status(500).send("Server error");
  }
};