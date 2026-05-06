const axios      = require('axios');
const path       = require("path");
const fs         = require("fs");
const mongoose   = require("mongoose");
const Book       = require("../models/Book");
const Tag        = require("../models/Tag");
const Rating     = require("../models/Rating");
const Annotation = require("../models/Annotation");
const { TOP_RATED_THRESHOLD } = require("../config/ratings");


async function attachRatings(books) {
  if (!books.length) return books;

  const bookIds = books.map(b => new mongoose.Types.ObjectId(b._id));

  const aggregated = await Rating.aggregate([
    { $match: { book: { $in: bookIds } } },
    {
      $group: {
        _id:            "$book",
        average_rating: { $avg: "$rating" },
        ratings_count:  { $sum: 1 },
      },
    },
  ]);

  const ratingById = {};
  for (const r of aggregated) {
    ratingById[r._id.toString()] = {
      average_rating: parseFloat(r.average_rating.toFixed(2)),
      ratings_count:  r.ratings_count,
    };
  }

  return books.map(book => {
    const r = ratingById[book._id.toString()] ?? { average_rating: 0, ratings_count: 0 };
    return {
      ...book,
      average_rating: r.average_rating,
      ratings_count:  r.ratings_count,
      isTopRated:     r.average_rating >= TOP_RATED_THRESHOLD,
    };
  });
}

exports.getAllBooks = async (req, res) => {
  try {
    const books    = await Book.find().select("-pdfPath").populate("tags", "name").lean();
    const enriched = await attachRatings(books);
    res.json(enriched);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .select("-pdfPath")
      .populate("tags", "name")
      .lean();

    if (!book) return res.status(404).json({ msg: "Book not found" });

    const [enriched] = await attachRatings([book]);
    res.json({ ...enriched, viewUrl: `/api/books/${book._id}/view` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.viewBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).select("pdfPath title");
    if (!book) return res.status(404).json({ msg: "Book not found" });

    if (book.pdfPath.startsWith("http")) {
      let pdfUrl = book.pdfPath;
      if (pdfUrl.includes("cloudinary.com") && !pdfUrl.includes("/raw/upload/")) {
        pdfUrl = pdfUrl.replace("/upload/", "/raw/upload/");
      }
      const response = await axios({ method: "get", url: pdfUrl, responseType: "stream" });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(book.title)}.pdf"`);
      res.setHeader("Access-Control-Allow-Origin", "*");
      return response.data.pipe(res);
    }

    const oldPath = path.resolve(book.pdfPath);
    if (fs.existsSync(oldPath)) return res.sendFile(oldPath);

    res.status(404).json({ msg: "File not found" });
  } catch (err) {
    console.error("View Error:", err.message);
    res.status(500).send("Error fetching book from cloud");
  }
};

exports.addBook = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "PDF file is required" });

    const { title, author, category, tag_ids } = req.body;
    if (!title || !author || !category)
      return res.status(400).json({ msg: "title, author, and category are required" });

    const book = new Book({
      title,
      author,
      category,
      pdfPath: req.file.path,
      addedBy: req.user.id,
      tags:    tag_ids?.length ? [...new Set(tag_ids)] : [],
    });

    await book.save();
    const populated = await book.populate("tags", "name");
    const response  = populated.toObject();
    delete response.pdfPath;

    res.status(201).json({ ...response, average_rating: 0, ratings_count: 0, isTopRated: false });
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

    const matchingTags = await Tag.find({ name: regex }).select("_id");
    const tagIds       = matchingTags.map(t => t._id);

    const books = await Book.find({
      $or: [
        { title:    regex },
        { author:   regex },
        { category: regex },
        { tags:     { $in: tagIds } },
      ],
    })
      .select("-pdfPath")
      .populate("tags", "name")
      .lean();

    const enriched = await attachRatings(books);
    res.json(enriched);
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

exports.saveDrawing = async (req, res) => {
  try {
    const { pageNumber, drawingData } = req.body;
    if (!drawingData) return res.status(400).json({ msg: "No drawing data provided" });

    await Annotation.findOneAndUpdate(
      { user: req.user.id, book: req.params.id, pageNumber },
      { drawingData, date: Date.now() },
      { upsert: true, new: true }
    );
    res.json({ msg: "Drawing saved" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.getDrawing = async (req, res) => {
  try {
    const annotation = await Annotation.findOne({
      user:       req.user.id,
      book:       req.params.id,
      pageNumber: req.params.pageNumber,
    });
    res.json(annotation || { drawingData: null });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.deleteDrawing = async (req, res) => {
  try {
    await Annotation.findOneAndDelete({
      user:       req.user.id,
      book:       req.params.id,
      pageNumber: req.params.pageNumber,
    });
    res.json({ msg: "Drawing deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};