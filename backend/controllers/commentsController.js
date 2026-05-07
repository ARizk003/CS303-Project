const Book    = require("../models/Book");
const Comment = require("../models/Comment");

exports.getBookComments = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId).select("_id");
    if (!book) return res.status(404).json({ msg: "Book not found" });

    const comments = await Comment.find({ book: req.params.bookId })
      .populate("user", "username")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.createComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ msg: "Comment text is required" });
    }

    const book = await Book.findById(req.params.bookId).select("_id");
    if (!book) return res.status(404).json({ msg: "Book not found" });

    const comment = new Comment({
      user: req.user.id,
      book: req.params.bookId,
      text: text.trim(),
    });

    await comment.save();
    await comment.populate("user", "username");

    res.status(201).json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ msg: "Comment text is required" });
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: "Comment not found" });

    const isOwner = comment.user.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ msg: "Not authorized to edit this comment" });
    }

    comment.text = text.trim();
    await comment.save();
    await comment.populate("user", "username");

    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: "Comment not found" });

    const isOwner = comment.user.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ msg: "Not authorized to delete this comment" });
    }

    await comment.deleteOne();
    res.json({ msg: "Comment deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};