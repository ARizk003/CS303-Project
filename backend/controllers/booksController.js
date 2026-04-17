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
    if (!book) {
      return res.status(404).json({ msg: "Book not found" });
    }

    if (!fs.existsSync(book.pdfPath)) {
      console.error(`[VIEW] File not found on disk: ${book.pdfPath}`);
      return res.status(404).json({ msg: "PDF file not found on server" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(book.title)}.pdf"`);
    res.setHeader("Cache-Control", "no-store");       
    res.setHeader("X-Content-Type-Options", "nosniff");

    console.log(`[VIEW] User ${req.user.id} viewed book ${book._id} at ${new Date().toISOString()}`);

    const stream = fs.createReadStream(book.pdfPath);
    stream.on("error", (streamErr) => {
      console.error(`[VIEW] Stream error: ${streamErr.message}`);
      if (!res.headersSent) {
        res.status(500).send("Error streaming file");
      }
    });
    stream.pipe(res);

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
    if (!req.file) {
      return res.status(400).json({ msg: "PDF file is required" });
    }

    const { title, author, category, tag_ids } = req.body;

    if (!title || !author || !category) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ msg: "title, author, and category are required" });
    }

    if (tag_ids && tag_ids.length > 0) {
      const foundTags = await Tag.find({ _id: { $in: tag_ids } }).select("_id");
      if (foundTags.length !== tag_ids.length) {
        fs.unlink(req.file.path, () => {});
        return res.status(400).json({ msg: "One or more tag IDs are invalid" });
      }
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

   
    console.log(`[UPLOAD] Admin ${req.user.id} uploaded book "${title}" → ${req.file.filename} at ${new Date().toISOString()}`);

    const populated = await book.populate("tags", "name");


    const response = populated.toObject();
    delete response.pdfPath;

    res.status(201).json(response);

  } catch (err) {
  
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
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

    delete req.body.pdfPath;

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

// ── [MODIFIED] deleteBook: بيحذف الملف من /uploads مع الـ document
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ msg: "Book not found" });
    }

    if (book.pdfPath && fs.existsSync(book.pdfPath)) {
      fs.unlink(book.pdfPath, (err) => {
        if (err) {
          console.error(`[DELETE] Failed to delete file ${book.pdfPath}: ${err.message}`);
        } else {
          console.log(`[DELETE] File deleted: ${book.pdfPath}`);
        }
      });
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ msg: "Book and its PDF file deleted successfully" });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.searchBooks = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ msg: "Query parameter 'q' is required" });
    }

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