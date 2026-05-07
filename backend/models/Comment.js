const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    book: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Book",
      required: true,
    },
    text: {
      type:     String,
      required: true,
      trim:     true,
      maxlength: 5000,
    },
  },
  { timestamps: true }
);

CommentSchema.index({ book: 1, createdAt: -1 });
CommentSchema.index({ user: 1 });

module.exports = mongoose.model("Comment", CommentSchema);