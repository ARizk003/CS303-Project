const Book   = require("../models/Book");
const Rating = require("../models/Rating");

exports.rateBook = async (req, res) => {
  try {
    const { rating } = req.body;

    
    if (rating === undefined || rating === null) {
      return res.status(400).json({ msg: "rating is required" });
    }

    const parsed = Number(rating);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
      return res.status(400).json({ msg: "rating must be an integer between 1 and 5" });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ msg: "Book not found" });
    }

    const existingRating = await Rating.findOne({
      user: req.user.id,
      book: req.params.id
    });

    let savedRating;
    if (existingRating) {
      existingRating.rating    = parsed;
      existingRating.updatedAt = Date.now();
      savedRating = await existingRating.save();
    } else {
      savedRating = await new Rating({
        user:   req.user.id,
        book:   req.params.id,
        rating: parsed
      }).save();
    }
    const aggregated = await Rating.getAggregated(req.params.id, req.user.id);

    res.json({
      msg: existingRating ? "Rating updated" : "Rating submitted",
      your_rating: savedRating.rating,
      ...aggregated
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};


exports.getBookRating = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).select("_id");
    if (!book) {
      return res.status(404).json({ msg: "Book not found" });
    }

    const userId = req.user ? req.user.id : null;
    const data   = await Rating.getAggregated(req.params.id, userId);

    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};