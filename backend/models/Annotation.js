const mongoose = require("mongoose");

const AnnotationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  pageNumber: {
    type: Number,
    required: true,
  },
  drawingData: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

AnnotationSchema.index({ user: 1, book: 1, pageNumber: 1 }, { unique: true });

module.exports = mongoose.model("Annotation", AnnotationSchema);