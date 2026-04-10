const Tag  = require("../models/Tag");
const Book = require("../models/Book");


exports.createTag = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ msg: "Tag name is required" });
    }

    const tag = new Tag({ name: name.trim() });
    await tag.save();

    res.status(201).json(tag);
  } catch (err) {
    // Duplicate key
    if (err.code === 11000) {
      return res.status(409).json({ msg: "Tag already exists" });
    }
    console.error(err.message);
    res.status(500).send("Server error");
  }
};


exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json(tags);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};


exports.assignTagsToBook = async (req, res) => {
  try {
    const { tag_ids } = req.body;

    if (!Array.isArray(tag_ids) || tag_ids.length === 0) {
      return res.status(400).json({ msg: "tag_ids must be a non-empty array" });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ msg: "Book not found" });
    }

    const foundTags = await Tag.find({ _id: { $in: tag_ids } }).select("_id");
    if (foundTags.length !== tag_ids.length) {
      return res.status(400).json({ msg: "One or more tag IDs are invalid" });
    }

    book.tags = [...new Set(tag_ids)];
    await book.save();

    const populated = await book.populate("tags", "name");
    res.json({ msg: "Tags assigned successfully", tags: populated.tags });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};


exports.getBookTags = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("tags", "name");
    if (!book) {
      return res.status(404).json({ msg: "Book not found" });
    }

    res.json(book.tags);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};