const mongoose  = require("mongoose");
const Book      = require("../models/Book");
const Highlight = require("../models/Highlight");

function isValidPosition(pos) {
  if (!pos || typeof pos !== "object") return false;
  const { boundingRect, rects, pageNumber } = pos;
  if (!Number.isFinite(pageNumber) || pageNumber < 1) return false;
  if (!boundingRect) return false;
  const rectFields = ["x1", "y1", "x2", "y2", "width", "height"];
  if (!rectFields.every(f => Number.isFinite(boundingRect[f]))) return false;
  if (!Array.isArray(rects) || rects.length === 0) return false;
  return true;
}

function sanitizeNote(note) {
  if (note === undefined || note === null) return "";
  return String(note).trim().slice(0, 2000);
}

exports.getHighlightsForBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId).select("_id");
    if (!book) return res.status(404).json({ msg: "Book not found" });

    const highlights = await Highlight.find({
      user: req.user.id,
      book: req.params.bookId,
    }).sort({ createdAt: 1 });

    res.json(highlights);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.createHighlight = async (req, res) => {
  try {
    const { content, position, note, color } = req.body;

    if (!isValidPosition(position)) {
      return res.status(400).json({
        msg: "position is required and must include boundingRect, rects[], and pageNumber",
      });
    }

    const book = await Book.findById(req.params.bookId).select("_id");
    if (!book) return res.status(404).json({ msg: "Book not found" });

    const highlight = new Highlight({
      user:     req.user.id,
      book:     req.params.bookId,
      content:  { text: content?.text ?? "", image: content?.image ?? "" },
      position,
      note:     sanitizeNote(note),
      color:    color ?? "#FFFF00",
    });

    await highlight.save();
    res.status(201).json(highlight);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.updateHighlight = async (req, res) => {
  try {
    const highlight = await Highlight.findOne({
      _id:  req.params.highlightId,
      user: req.user.id,
    });

    if (!highlight) {
      return res.status(404).json({ msg: "Highlight not found or unauthorized" });
    }

    const { content, position, note, color } = req.body;

    if (position !== undefined) {
      if (!isValidPosition(position)) {
        return res.status(400).json({
          msg: "position must include boundingRect, rects[], and pageNumber",
        });
      }
      highlight.position = position;
    }

    if (content !== undefined) {
      highlight.content = {
        text:  content?.text  ?? highlight.content.text,
        image: content?.image ?? highlight.content.image,
      };
    }

    if (note !== undefined)  highlight.note  = sanitizeNote(note);
    if (color !== undefined) highlight.color = color;

    await highlight.save();
    res.json(highlight);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.deleteHighlight = async (req, res) => {
  try {
    const highlight = await Highlight.findOneAndDelete({
      _id:  req.params.highlightId,
      user: req.user.id,
    });

    if (!highlight) {
      return res.status(404).json({ msg: "Highlight not found or unauthorized" });
    }

    res.json({ msg: "Highlight deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};