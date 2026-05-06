const mongoose = require("mongoose");

const PositionSchema = new mongoose.Schema(
  {
    boundingRect: {
      x1:     { type: Number, required: true },
      y1:     { type: Number, required: true },
      x2:     { type: Number, required: true },
      y2:     { type: Number, required: true },
      width:  { type: Number, required: true },
      height: { type: Number, required: true },
    },
    rects: [
      {
        x1:     { type: Number, required: true },
        y1:     { type: Number, required: true },
        x2:     { type: Number, required: true },
        y2:     { type: Number, required: true },
        width:  { type: Number, required: true },
        height: { type: Number, required: true },
      },
    ],
    pageNumber: { type: Number, required: true },
  },
  { _id: false }
);

const HighlightSchema = new mongoose.Schema(
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
    content: {
      text:  { type: String, default: "" },
      image: { type: String, default: "" },
    },
    position: {
      type:     PositionSchema,
      required: true,
    },
    note: {
      type:    String,
      default: "",
      trim:    true,
    },
    color: {
      type:    String,
      default: "#FFFF00",
      trim:    true,
    },
  },
  { timestamps: true }
);

HighlightSchema.index({ user: 1, book: 1 });
HighlightSchema.index({ book: 1, "position.pageNumber": 1 });

module.exports = mongoose.model("Highlight", HighlightSchema);