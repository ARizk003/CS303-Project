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
  description: {
    type: String,
    default: ""
  },
  authorBio: {
    type: String,
    default: ""
  },
  pdfPath: {
    type: String,
    required: true
  },

  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  coverImage: { type: String, default: "" },

  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
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