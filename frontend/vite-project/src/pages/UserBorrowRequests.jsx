import React, { useState, useEffect} from 'react';
import axios from 'axios';
import API_URL from '../config/api';


const UserBorrowRequests = () => {
    // 1. ADDED: State to hold the borrow requests
    const [borrowRequests, setBorrowRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('myList');


    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchBorrowRequests();
    }, []);

    const fetchBorrowRequests = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/borrow/my-requests`, {
                headers: { 'x-auth-token': token }
            });
            // This now successfully updates the state
            setBorrowRequests(res.data);
        } catch (err) {
            console.error('Error fetching requests:', err);
        }
        setLoading(false);
    };

    // Helper function to color-code status badges
    const getStatusBadgeClass = (status) => {
        switch(status) {
            case 'approved': return 'bg-success';
            case 'rejected': return 'bg-danger';
            default: return 'bg-warning text-dark'; // pending
        }
    };

    return (
        <div className="container-fluid py-5" style={{ backgroundColor: '#fdfaf6', minHeight: '100vh' }}>
            <div className="container">
                <div className="row g-4 justify-content-center">

                    {/* MAIN AREA */}
                    <div className="col-md-10 col-lg-8">
                        <h2 className="mb-4">My Borrow Requests</h2>

                        {/* Tab Switcher */}
                        <div className="d-flex gap-3 mb-4">
                            <button
                                className={`btn rounded-pill px-4 ${viewMode === 'myList' ? 'btn-dark' : 'btn-outline-dark'}`}
                                onClick={() => setViewMode('myList')}
                            >
                                My Requests
                            </button>
                        </div>

                        {/* 2. ADDED: Render the fetched data */}
                        {loading ? (
                            <div className="text-center mt-5">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : borrowRequests.length === 0 ? (
                            <div className="alert alert-info">
                                You don't have any borrow requests yet.
                            </div>
                        ) : (
                            <div className="card shadow-sm border-0">
                                <div className="list-group list-group-flush">
                                    {borrowRequests.map((request) => (
                                        <div key={request._id} className="list-group-item p-4 d-flex justify-content-between align-items-center">
                                            <div>
                                                {/* Assuming your backend populates 'book' with title and author */}
                                                <h5 className="mb-1">
                                                    {request.book ? request.book.title : 'Deleted Book'}
                                                </h5>
                                                <p className="text-muted mb-1">
                                                    Author: {request.book ? request.book.author : 'Unknown'}
                                                </p>
                                                <small className="text-muted">
                                                    Requested on: {new Date(request.createdAt).toLocaleDateString()}
                                                </small>
                                            </div>
                                            <div>
                                                <span className={`badge ${getStatusBadgeClass(request.status)} px-3 py-2 rounded-pill text-uppercase`}>
                                                    {request.status || 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UserBorrowRequests;