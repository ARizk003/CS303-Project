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
  pdfUrl: {
    type: String,
    required: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Book", BookSchema);