const mongoose = require("mongoose");

// a better approach is to make 2 separate relationship representations: user_list, and list_book
//, user_list relationship can be represented by just adding userId in List attributes, refering a user
const ListSchema = new mongoose.Schema({
    // 'name' is more descriptive
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