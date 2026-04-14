const mongoose = require("mongoose");

// a better approach is to make 2 separate relationship representations: user_list, and list_book
//, user_list relationship can be represented by just adding userId in List attributes, refering a user
const ListBookSchema = new mongoose.Schema({
    listId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List',
        required: true
    }, 
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    }
});

module.exports = mongoose.model("List_Book", ListBookSchema);