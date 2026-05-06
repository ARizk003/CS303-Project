import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import StarRating from "../components/StarRating.jsx";

const TAG_COLORS = [
    { bg: "#FFE0E0", color: "#c0392b" },
    { bg: "#E0F0FF", color: "#2471a3" },
    { bg: "#E0FFE8", color: "#1e8449" },
    { bg: "#FFF3E0", color: "#d35400" },
    { bg: "#F3E0FF", color: "#7d3c98" },
    { bg: "#E0FFFE", color: "#117a65" },
    { bg: "#FFFBE0", color: "#b7950b" },
    { bg: "#FFE0F5", color: "#a93226" },
];

const getTagColor = (index) => TAG_COLORS[index % TAG_COLORS.length];

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
    const [selectedTag, setSelectedTag] = useState("");
    const [allTags, setAllTags] = useState([]);
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

                const tagsMap = new Map();
                res.data.forEach(book => {
                    if (Array.isArray(book.tags)) {
                        book.tags.forEach(tag => {
                            if (typeof tag === 'object') tagsMap.set(tag._id, tag.name);
                        });
                    }
                });
                setAllTags([...tagsMap.entries()].map(([_id, name]) => ({ _id, name })));
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
            const matchesSearch = book.title?.toLowerCase().includes(searchLower) ||
                                  book.author?.toLowerCase().includes(searchLower);
            const matchesTag = selectedTag === "" || (
                Array.isArray(book.tags) &&
                book.tags.some(tag => (typeof tag === 'object' ? tag._id : tag) === selectedTag)
            );
            return matchesSearch && matchesTag;
        });
        setFilteredBooks(results);
    }, [searchTerm, selectedTag, books]);

    const tagColorMap = {};
    allTags.forEach((tag, i) => { tagColorMap[tag._id] = getTagColor(i); });

    return (
        <div className="container-fluid px-4 py-5" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
            <div className="text-center mb-5">
                <h1 className="fw-bold" style={{ color: "#1a1a1a", fontSize: '3rem' }}>LearnNova Library</h1>
                <p className="text-muted">Your Gateway to Knowledge</p>
            </div>

            <div className="row justify-content-center mb-3">
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

            <div className="row justify-content-center mb-5">
                <div className="col-md-8 d-flex flex-wrap gap-2 justify-content-center">
                    <button
                        className="btn btn-sm fw-bold"
                        onClick={() => setSelectedTag("")}
                        style={{
                            borderRadius: "50px",
                            backgroundColor: selectedTag === "" ? "#f39c12" : "#e9ecef",
                            color: selectedTag === "" ? "#fff" : "#333",
                            border: "none",
                            padding: "6px 18px"
                        }}
                    >
                        All
                    </button>
                    {allTags.map((tag, i) => {
                        const c = getTagColor(i);
                        const isActive = selectedTag === tag._id;
                        return (
                            <button
                                key={tag._id}
                                className="btn btn-sm fw-bold"
                                onClick={() => setSelectedTag(isActive ? "" : tag._id)}
                                style={{
                                    borderRadius: "50px",
                                    backgroundColor: isActive ? c.color : c.bg,
                                    color: isActive ? "#fff" : c.color,
                                    border: `1.5px solid ${c.color}`,
                                    padding: "6px 18px"
                                }}
                            >
                                {tag.name}
                            </button>
                        );
                    })}
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

                                    <div className="mb-2 d-flex flex-wrap gap-1 justify-content-center">
                                        {Array.isArray(book.tags) && book.tags.map((tag, i) => {
                                            const tagId = typeof tag === 'object' ? tag._id : tag;
                                            const tagName = typeof tag === 'object' ? tag.name : tag;
                                            const c = tagColorMap[tagId] || getTagColor(i);
                                            const isActive = selectedTag === tagId;
                                            return (
                                                <span
                                                    key={tagId || i}
                                                    onClick={() => setSelectedTag(isActive ? "" : tagId)}
                                                    style={{
                                                        cursor: "pointer",
                                                        borderRadius: "50px",
                                                        padding: "3px 10px",
                                                        fontSize: "0.75rem",
                                                        fontWeight: "600",
                                                        backgroundColor: isActive ? c.color : c.bg,
                                                        color: isActive ? "#fff" : c.color,
                                                        border: `1.5px solid ${c.color}`,
                                                    }}
                                                >
                                                    {tagName}
                                                </span>
                                            );
                                        })}
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


