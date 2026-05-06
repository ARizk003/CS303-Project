const mongoose = require("mongoose");
const List     = require("../models/List");
const Book     = require("../models/Book");
const User     = require("../models/User");
const Rating   = require("../models/Rating");
const { TOP_RATED_THRESHOLD } = require("../config/ratings");

async function attachRatings(books) {
  if (!books.length) return books;

  const bookIds = books.map(b => new mongoose.Types.ObjectId(b._id));

  const aggregated = await Rating.aggregate([
    { $match: { book: { $in: bookIds } } },
    {
      $group: {
        _id:            "$book",
        average_rating: { $avg: "$rating" },
        ratings_count:  { $sum: 1 },
      },
    },
  ]);

  const ratingById = {};
  for (const r of aggregated) {
    ratingById[r._id.toString()] = {
      average_rating: parseFloat(r.average_rating.toFixed(2)),
      ratings_count:  r.ratings_count,
    };
  }

  return books.map(book => {
    const r = ratingById[book._id.toString()] ?? { average_rating: 0, ratings_count: 0 };
    return {
      ...book,
      average_rating: r.average_rating,
      ratings_count:  r.ratings_count,
      isTopRated:     r.average_rating >= TOP_RATED_THRESHOLD,
    };
  });
}


exports.getAllUsersLists = async (req, res) => {
  try {
    const searchQuery = req.query.search ? req.query.search.trim() : "";

    const userLists = await List.find({ userId: req.user.id })
      .populate({
        path:     "booksIds",
        select:   "-pdfPath",
        populate: { path: "tags", select: "name" },
      })
      .lean();

    const allBooksMap = {};
    for (const list of userLists) {
      for (const book of list.booksIds) {
        if (book?._id) allBooksMap[book._id.toString()] = book;
      }
    }

    const enrichedMap = {};
    const enriched    = await attachRatings(Object.values(allBooksMap));
    for (const book of enriched) enrichedMap[book._id.toString()] = book;

    const regex = searchQuery ? new RegExp(searchQuery, "i") : null;

    const result = userLists.map(list => {
      let books = list.booksIds
        .filter(Boolean)
        .map(b => enrichedMap[b._id.toString()] ?? b);

      if (regex) {
        books = books.filter(book =>
          regex.test(book.title    ?? "") ||
          regex.test(book.author   ?? "") ||
          regex.test(book.category ?? "") ||
          (Array.isArray(book.tags) && book.tags.some(t => regex.test(t.name ?? "")))
        );
      }

      return { ...list, booksIds: books };
    });

    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.createList = async (req, res) => {
  try {
    const { title } = req.body;
    const userId    = req.user.id;

    const newList = new List({ title, userId, booksIds: [] });
    await newList.save();

    await User.findByIdAndUpdate(userId, { $push: { lists: newList._id } });

    res.status(201).json({ message: "List created successfully", list: newList });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error: Could not create list");
  }
};

exports.deleteList = async (req, res) => {
  try {
    const { listId } = req.params;
    const userId     = req.user.id;

    const deletedList = await List.findOneAndDelete({ _id: listId, userId });
    if (!deletedList) return res.status(404).json({ message: "List not found or unauthorized" });

    await User.findByIdAndUpdate(userId, { $pull: { lists: listId } });

    res.status(200).json({ message: "List and references deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error during deletion");
  }
};

exports.addBookToList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { bookId } = req.body;
    const userId     = req.user.id;

    const updatedList = await List.findOneAndUpdate(
      { _id: listId, userId },
      { $addToSet: { booksIds: bookId } },
      { new: true }
    ).populate({
      path:     "booksIds",
      select:   "-pdfPath",
      populate: { path: "tags", select: "name" },
    });

    if (!updatedList) return res.status(404).json({ message: "List not found or unauthorized" });

    res.status(200).json({ message: "Book added successfully to List", list: updatedList });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error: Could not add book to the list");
  }
};

exports.removeBookFromLists = async (req, res) => {
  try {
    const { listId } = req.params;
    const { bookId } = req.body;
    const userId     = req.user.id;

    const updatedList = await List.findOneAndUpdate(
      { _id: listId, userId },
      { $pull: { booksIds: bookId } },
      { new: true }
    ).populate({
      path:     "booksIds",
      select:   "-pdfPath",
      populate: { path: "tags", select: "name" },
    });

    if (!updatedList) return res.status(404).json({ message: "List not found or unauthorized" });

    res.status(200).json({ message: "Book removed successfully from List", list: updatedList });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error: Could not remove book from the list");
  }
};