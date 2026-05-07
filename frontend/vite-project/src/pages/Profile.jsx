// Profile.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StarRating from "../components/StarRating.jsx";

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('reviews');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        avatar: ''
    });
    
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const API_URL = 'http://localhost:5000';

    useEffect(() => {
        if (!user) {
            navigate('/login', { state: { message: 'Please sign in to view your profile.' } });
            return;
        }
        fetchProfileData();
    }, [user]);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            const [profileRes, reviewsRes, listsRes] = await Promise.all([
                axios.get(`${API_URL}/api/users/profile`, {
                    headers: { 'x-auth-token': token }
                }),
                axios.get(`${API_URL}/api/reviews/user`, {
                    headers: { 'x-auth-token': token }
                }),
                axios.get(`${API_URL}/api/lists`, {
                    headers: { 'x-auth-token': token }
                })
            ]);
            
            setProfile(profileRes.data);
            setReviews(reviewsRes.data);
            setLists(listsRes.data);
            setFormData({
                name: profileRes.data.name || '',
                bio: profileRes.data.bio || '',
                avatar: profileRes.data.avatar || ''
            });
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
        setLoading(false);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`${API_URL}/api/users/profile`, formData, {
                headers: { 'x-auth-token': token }
            });
            setProfile(res.data);
            if (setUser) {
                setUser({ ...user, ...res.data });
            }
            setEditMode(false);
            alert('Profile updated successfully!');
        } catch (err) {
            alert('Failed to update profile');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Delete this review?')) return;
        try {
            await axios.delete(`${API_URL}/api/reviews/${reviewId}`, {
                headers: { 'x-auth-token': token }
            });
            setReviews(reviews.filter(r => r._id !== reviewId));
        } catch (err) {
            alert('Failed to delete review');
        }
    };

    const openBook = (bookId) => {
        navigate('/read-book', { state: { bookId } });
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-warning" style={{ width: '3rem', height: '3rem' }} role="status" />
                <p className="mt-3 text-muted">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="container-fluid py-5" style={{ backgroundColor: '#fdfaf6', minHeight: '100vh' }}>
            <div className="container">
                {/* Profile Header Card */}
                <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                    <div className="p-5 text-white" style={{ 
                        background: 'linear-gradient(135deg, #002147 0%, #1a3a5c 100%)',
                        position: 'relative'
                    }}>
                        <div className="row align-items-center">
                            <div className="col-md-2 text-center mb-3 mb-md-0">
                                <div className="mx-auto rounded-circle overflow-hidden border border-4 border-white shadow"
                                    style={{ width: '120px', height: '120px' }}>
                                    <img
                                        src={profile?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile?.name || user?.name || 'User') + '&background=C5A059&color=fff&size=120'}
                                        alt="Profile"
                                        className="w-100 h-100"
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                            </div>
                            <div className="col-md-7">
                                <h1 className="display-5 fw-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    {profile?.name || user?.name || 'Book Lover'}
                                </h1>
                                <p className="mb-2 opacity-75">{profile?.email || user?.email}</p>
                                {profile?.bio && !editMode && (
                                    <p className="mb-0 opacity-90">"{profile.bio}"</p>
                                )}
                                <div className="d-flex gap-3 mt-3">
                                    <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#C5A059' }}>
                                        📚 {reviews.length} Reviews
                                    </span>
                                    <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#C5A059' }}>
                                        📁 {lists.length} Collections
                                    </span>
                                </div>
                            </div>
                            <div className="col-md-3 text-md-end mt-3 mt-md-0">
                                <button
                                    className="btn btn-light rounded-pill px-4 fw-bold"
                                    onClick={() => setEditMode(!editMode)}
                                >
                                    {editMode ? '✕ Cancel' : '✎ Edit Profile'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Edit Profile Form */}
                    {editMode && (
                        <div className="card-body p-4 bg-light">
                            <form onSubmit={handleUpdateProfile}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold text-muted small">NAME</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-pill"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold text-muted small">AVATAR URL</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-pill"
                                            value={formData.avatar}
                                            onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                                            placeholder="https://example.com/avatar.jpg"
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-bold text-muted small">BIO</label>
                                        <textarea
                                            className="form-control rounded-3"
                                            rows="3"
                                            value={formData.bio}
                                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>
                                    <div className="col-12">
                                        <button
                                            type="submit"
                                            className="btn rounded-pill px-4 text-white fw-bold"
                                            style={{ backgroundColor: '#C5A059' }}
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="d-flex gap-2 mb-4">
                    <button
                        className={`btn rounded-pill px-4 fw-bold ${activeTab === 'reviews' ? 'text-white' : 'btn-outline-dark'}`}
                        style={activeTab === 'reviews' ? { backgroundColor: '#002147' } : {}}
                        onClick={() => setActiveTab('reviews')}
                    >
                        📝 My Reviews ({reviews.length})
                    </button>
                    <button
                        className={`btn rounded-pill px-4 fw-bold ${activeTab === 'collections' ? 'text-white' : 'btn-outline-dark'}`}
                        style={activeTab === 'collections' ? { backgroundColor: '#002147' } : {}}
                        onClick={() => setActiveTab('collections')}
                    >
                        📚 My Collections ({lists.length})
                    </button>
                </div>

                {/* Tab Content */}
                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-4">
                        {activeTab === 'reviews' ? (
                            reviews.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ color: '#8e7f68' }}>BOOK</th>
                                                <th style={{ color: '#8e7f68' }}>RATING</th>
                                                <th style={{ color: '#8e7f68' }}>REVIEW</th>
                                                <th style={{ color: '#8e7f68' }}>DATE</th>
                                                <th style={{ color: '#8e7f68' }} className="text-end">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reviews.map(review => (
                                                <tr key={review._id}>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="rounded-2 overflow-hidden" style={{ width: '50px', height: '70px' }}>
                                                                <img
                                                                    src={review.book?.coverImage || '/Book.jpg'}
                                                                    alt={review.book?.title}
                                                                    className="w-100 h-100"
                                                                    style={{ objectFit: 'cover' }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="fw-bold" style={{ color: '#2c3e50' }}>
                                                                    {review.book?.title || 'Unknown Book'}
                                                                </div>
                                                                <small className="text-muted">{review.book?.author}</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <StarRating initialRating={review.rating} readonly={true} />
                                                    </td>
                                                    <td>
                                                        <p className="mb-0 small text-muted" style={{ maxWidth: '200px' }}>
                                                            {review.comment || 'No comment'}
                                                        </p>
                                                    </td>
                                                    <td>
                                                        <small className="text-muted">
                                                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </small>
                                                    </td>
                                                    <td className="text-end">
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary rounded-pill me-2"
                                                            onClick={() => openBook(review.book?._id)}
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger rounded-pill"
                                                            onClick={() => handleDeleteReview(review._id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <div style={{ fontSize: '3rem' }}>📝</div>
                                    <h5 className="text-muted mt-3">No reviews yet</h5>
                                    <p className="text-muted">Start reviewing books from the library!</p>
                                    <button
                                        className="btn rounded-pill px-4 text-white mt-2"
                                        style={{ backgroundColor: '#C5A059' }}
                                        onClick={() => navigate('/books')}
                                    >
                                        Browse Books
                                    </button>
                                </div>
                            )
                        ) : (
                            lists.length > 0 ? (
                                <div className="row g-3">
                                    {lists.map(list => (
                                        <div className="col-md-6 col-lg-4" key={list._id}>
                                            <div className="card h-100 border shadow-sm rounded-3 p-3"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => navigate('/my-lists')}>
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <h5 className="fw-bold mb-0" style={{ color: '#002147' }}>
                                                        📁 {list.title}
                                                    </h5>
                                                    <span className="badge rounded-pill" style={{ backgroundColor: '#f0e3ca', color: '#002147' }}>
                                                        {list.booksIds?.length || 0} books
                                                    </span>
                                                </div>
                                                {list.booksIds?.slice(0, 3).map(book => (
                                                    <small key={book._id} className="text-muted d-block">
                                                        • {book.title}
                                                    </small>
                                                ))}
                                                {list.booksIds?.length > 3 && (
                                                    <small className="text-muted d-block mt-1">
                                                        +{list.booksIds.length - 3} more...
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <div style={{ fontSize: '3rem' }}>📂</div>
                                    <h5 className="text-muted mt-3">No collections yet</h5>
                                    <p className="text-muted">Create your first book collection!</p>
                                    <button
                                        className="btn rounded-pill px-4 text-white mt-2"
                                        style={{ backgroundColor: '#C5A059' }}
                                        onClick={() => navigate('/my-lists')}
                                    >
                                        Manage Lists
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;