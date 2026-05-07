const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BorrowRequest = require('../models/BorrowRequest');


router.post('/', auth, async (req, res) => {
    try {
        const { bookId, fullName, phone, address, nationalId } = req.body;

        if (!bookId || !fullName || !phone || !address || !nationalId) {
            return res.status(400).json({ msg: 'All fields are required' });
        }


        const existing = await BorrowRequest.findOne({
            user: req.user.id,
            book: bookId,
            status: 'pending'
        });
        if (existing) {
            return res.status(400).json({ msg: 'You already have a pending request for this book' });
        }

        const request = new BorrowRequest({
            user: req.user.id,
            book: bookId,
            fullName,
            phone,
            address,
            nationalId
        });

        await request.save();
        res.status(201).json({ msg: 'Borrow request submitted successfully', request });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});


router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const requests = await BorrowRequest.find()
            .populate('user', 'username email')
            .populate('book', 'title author')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});


router.get('/my-requests', auth, async (req, res) => {
    try {

        const requests = await BorrowRequest.find({ user: req.user.id })
            .populate('book', 'title author')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});


router.patch('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        const request = await BorrowRequest.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!request) return res.status(404).json({ msg: 'Request not found' });

        res.json({ msg: `Request ${status}`, request });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;