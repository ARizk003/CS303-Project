import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import StarRating from "../components/StarRating.jsx";


const BookRatingDisplay = ({ bookId }) => {
    const [stats, setStats] = useState({ average_rating: 0, ratings_count: 0 });

    useEffect(() => {
        const fetchRating = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/books/${bookId}/rating`);
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching rating", err);
            }
        };
        fetchRating();
    }, [bookId]);

    return (
        <div className="mb-2">
            <StarRating initialRating={stats.average_rating} readonly={true} />
            <small className="text-muted">({stats.ratings_count} reviews)</small>
        </div>
    );
};






function Books() {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const API_URL = "http://localhost:5000";





    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`${API_URL}/api/books`, {
            headers: { 'x-auth-token': token }
        })
            .then(res => {
                setBooks(res.data);
                setFilteredBooks(res.data);
            })
            .catch(err => console.error("Error fetching books:", err))
            .finally(() => setLoading(false));
    }, []);

    const openBook = (book) => {
        if (!user) {
            navigate('/login', { state: { message: 'Please sign in or create an account to explore books.' } });
            return;
        }
        navigate('/read-book', { state: { book } });
    };

    useEffect(() => {
        const results = books.filter(book => {
            const searchLower = searchTerm.toLowerCase();
            return book.title?.toLowerCase().includes(searchLower) ||
                   book.author?.toLowerCase().includes(searchLower);
        });
        setFilteredBooks(results);
    }, [searchTerm, books]);

    return (
        <div className="container-fluid px-4 py-5" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
            <div className="text-center mb-5">
                <h1 className="fw-bold" style={{ color: "#1a1a1a", fontSize: '3rem' }}>LearnNova Library</h1>
                <p className="text-muted">Your Gateway to Knowledge</p>
            </div>

            <div className="row justify-content-center mb-5">
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control form-control-lg shadow-sm"
                        placeholder="🔍 Search by title or author..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ borderRadius: "50px", border: "none", padding: "14px 25px" }}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-warning" style={{ width: '3rem', height: '3rem' }} role="status" />
                    <p className="mt-3 text-muted">Loading books...</p>
                </div>
            ) : filteredBooks.length === 0 ? (
                <div className="text-center py-5">
                    <p style={{ fontSize: '3rem' }}>📚</p>
                    <p className="text-muted">No books found.</p>
                </div>
            ) : (
                <div className="row row-cols-1 row-cols-md-3 row-cols-lg-5 g-4">
                    {filteredBooks.map((book) => (
                        <div className="col" key={book._id}>
                            <div className="card h-100 border-0 shadow-sm book-card" style={{ borderRadius: "20px", overflow: 'hidden' }}>
                                <div style={{ height: '280px', overflow: 'hidden' }}>
                                    <img
                                       src={book.coverImage || "/Book.jpg"}
                                       className="card-img-top h-100 w-100"
                                       style={{ objectFit: "cover" }}
                                       alt={book.title}
                                    />
                                </div>
                                <div className="card-body p-4 text-center d-flex flex-column">
                                    <h6 className="fw-bold mb-1">{book.title}</h6>

        

                                    <BookRatingDisplay bookId={book._id} />



                                    <p className="text-muted small mb-3">by {book.author}</p>

                                    <div className="mb-2">
                                        {Array.isArray(book.tags) && book.tags.map((tag, i) => (
                                            <span key={tag._id || i} className="badge bg-light text-dark border me-1">
                                                {typeof tag === 'object' ? tag.name : tag}
                                            </span>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => openBook(book)}
                                        className="btn w-100 py-2 fw-bold mt-auto"
                                        style={{ borderRadius: "12px", backgroundColor: "#f39c12", color: "#fff", border: "none" }}
                                    >
                                        preview
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .book-card:hover {
                    transform: translateY(-10px);
                    transition: all 0.3s ease;
                    box-shadow: 0 15px 30px rgba(0,0,0,0.15) !important;
                }
                .book-card { transition: all 0.3s ease; }
            `}</style>
        </div>
    );
}




export default Books;


