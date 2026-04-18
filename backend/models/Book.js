const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },

  pdfPath: {
    type: String,
    required: true
  },

  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  // *discuss favourites later*
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ], // *discuss book_tag representation later*
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag"
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Book", BookSchema);