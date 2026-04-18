const mongoose = require("mongoose");

const ListSchema = new mongoose.Schema({
    title: { type: String, required: true },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    booksIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }],
});

module.exports = mongoose.model("List", ListSchema);