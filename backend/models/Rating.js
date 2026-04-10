const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

RatingSchema.index({ user: 1, book: 1 }, { unique: true });

RatingSchema.statics.getAggregated = async function (bookId, userId = null) {
  const [agg] = await this.aggregate([
    { $match: { book: new mongoose.Types.ObjectId(bookId) } },
    {
      $group: {
        _id: "$book",
        average_rating: { $avg: "$rating" },
        ratings_count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    average_rating: agg ? parseFloat(agg.average_rating.toFixed(2)) : 0,
    ratings_count: agg ? agg.ratings_count : 0,
    user_rating: null
  };

  if (userId) {
    const userRating = await this.findOne({
      book: bookId,
      user: userId
    }).select("rating");

    result.user_rating = userRating ? userRating.rating : null;
  }

  return result;
};

module.exports = mongoose.model("Rating", RatingSchema);