const List = require("../models/List");
const Book = require("../models/Book");
const User = require("../models/User");


exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

exports.getAllUsersLists = async (req, res) => {
    try {
        const userLists = await List.find({userId: req.user.id});
        res.json(userLists);
    } catch (err) {
        console.error(err.message);
        res.status(500).send(`Could not get list of books of ${req.user.username}`);
    }
};


exports.removeBookFromLists = async (req, res) => {
    try {
        const {listId} = req.params;
        const {bookId} = req.body;
        const userId = req.user.id;

        const updatedList = await List.findOneAndUpdate(
            {_id: listId, userId: userId},
            {$pull: {booksIds: bookId}},
            {new: true} 
        ).populate('booksIds'); 

        if (!updatedList) {
            return res.status(404).json({message: "List not found or unauthorized"});
        }


        res.status(200).json({
            message: "Book removed successfully to List",
            list: updatedList
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error: Could not remove book to the list");
    }
};


exports.createList = async (req, res) => {
    try {
        const { title } = req.body;
        const userId = req.user.id; 

        const newList = new List({
            title,
            userId,
            booksIds: []
        });

        await newList.save();

        await User.findByIdAndUpdate(userId, {
            $push: { lists: newList._id }
        });

        res.status(201).json({
            message: "List created successfully",
            list: newList
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error: Could not create list");
    }
};

exports.deleteList = async (req, res) => {

    try {
        const {listId} = req.params;
        const userId = req.user.id;

        const deletedList = await List.findOneAndDelete({
            _id: listId,
            userId: userId
        });

        if (!deletedList) {
            return res.status(404).json({message: "List not found or unauthorized"});
        }

        await User.findByIdAndUpdate(userId, {
            $pull: {lists: listId}
        });


        res.status(200).json({message: "List and references deleted successfully"});


    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error during deletion");
    }

};


// exports.removeBookFromLists = async (req, res) => {
//     try {
//         const {listId} = req.params;
//         const {bookId} = req.body;
//         const userId = req.user.id;
//
//         // $pull to remove specfic item
//         const updatedList = await List.findOneAndUpdate(
//             {_id: listId, userId: userId},
//             {$pull: {booksIds: bookId}},
//             {new: true} // This returns the list AFTER the book was deleted
//         ).populate('booksIds'); //returns the full book details to the frontend
//
//         if (!updatedList) {
//             return res.status(404).json({message: "List not found or unauthorized"});
//         }
//
//
//         //Return the updated data
//         res.status(200).json({
//             message: "Book removed successfully to List",
//             list: updatedList
//         });
//
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send("Server error: Could not remove book to the list");
//     }
// };


exports.addBookToList = async (req, res) => {
    try {
        const {listId} = req.params;
        const {bookId} = req.body;
        const userId = req.user.id; 


        const updatedList = await List.findOneAndUpdate(
            {_id: listId, userId: userId},
            {$addToSet: {booksIds: bookId}},
            {new: true} 
        ).populate('booksIds');

        if (!updatedList) {
            return res.status(404).json({message: "List not found or unauthorized"});
        }


        res.status(200).json({
            message: "Book added successfully to List",
            list: updatedList
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error: Could not add book to the list");
    }
};


