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

        // $pull to remove specfic item
        const updatedList = await List.findOneAndUpdate(
            {_id: listId, userId: userId},
            {$pull: {booksIds: bookId}},
            {new: true} // This returns the list AFTER the book was deleted
        ).populate('booksIds'); //returns the full book details to the frontend

        if (!updatedList) {
            return res.status(404).json({message: "List not found or unauthorized"});
        }


        //Return the updated data
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
        const userId = req.user.id; // From your auth middleware

        // 1. Create the new list
        const newList = new List({
            title,
            userId,
            booksIds: [] // Start with an empty array
        });

        // 2. Save the list to the database
        await newList.save();

        // 3. Sync: Add this List's ID to the User's "lists" array
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

        // 1. Delete the list and capture its data in ONE query
        const deletedList = await List.findOneAndDelete({
            _id: listId,
            userId: userId
        });

        if (!deletedList) {
            return res.status(404).json({message: "List not found or unauthorized"});
        }

        // 2. Cleanup User: Remove this list reference from the User
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
        const userId = req.user.id; // Taken from Auth Middleware for security

        //Update the List & Verify Ownership in one step
        // $addToSet to prevent duplicates
        const updatedList = await List.findOneAndUpdate(
            {_id: listId, userId: userId},
            {$addToSet: {booksIds: bookId}},
            {new: true} // This returns the list AFTER the book was added
        ).populate('booksIds'); //returns the full book details to the frontend

        if (!updatedList) {
            return res.status(404).json({message: "List not found or unauthorized"});
        }


        //Return the updated data
        res.status(200).json({
            message: "Book added successfully to List",
            list: updatedList
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error: Could not add book to the list");
    }
};


