import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Books() {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        axios.get('http://localhost:5000/api/books')
            .then(res => {
                setBooks(res.data);
                setFilteredBooks(res.data);
            })
            .catch(err => console.error("Error fetching books:", err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const results = books.filter(book => {
            const searchLower = searchTerm.toLowerCase();
            const titleMatch = book.title?.toLowerCase().includes(searchLower);
            const authorMatch = book.author?.toLowerCase().includes(searchLower);
            const tagsMatch = book.tags && book.tags.some(tag => {
                const tagName = tag && typeof tag === 'object' ? tag.name : (tag || '');
                return tagName.toLowerCase().includes(searchLower);
            });
            return titleMatch || tagsMatch || authorMatch;
        });
        setFilteredBooks(results);
    }, [searchTerm, books]);

    return (
        <div className="container-fluid px-4 py-5" style={{ background: "#f1f3f5", minHeight: "100vh" }}>

            <div className="text-center mb-5 mt-4">
                <h1 className="display-3 fw-bold mb-3" style={{ color: "#1a1a1a", letterSpacing: "-1px" }}>
                    Explore Our Masterpieces
                </h1>
                <div className="mx-auto mt-4" style={{ maxWidth: "600px" }}>
                    <div className="input-group mb-3 shadow-sm" style={{ borderRadius: "15px", overflow: "hidden" }}>
                        <span className="input-group-text bg-white border-0 ps-4"></span>
                        <input
                            type="text"
                            className="form-control border-0 py-3"
                            placeholder="Search by Title, Author or Tag..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ outline: "none", boxShadow: "none" }}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" style={{ color: "#f39c12" }} role="status" />
                </div>
            ) : filteredBooks.length === 0 ? (
                <div className="text-center py-5 text-muted fs-5">No books match your search.</div>
            ) : (
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4">
                    {filteredBooks.map((book) => (
                        <div className="col" key={book._id}>
                            <div className="card h-100 border-0 shadow-sm book-card"
                                style={{ borderRadius: "24px", overflow: "hidden", background: "#fff", transition: "all 0.4s ease" }}>

                                <div className="position-relative" style={{ height: "300px" }}>
                                    <img src="/Book.jpg" className="card-img-top h-100 w-100" alt={book.title} style={{ objectFit: "cover" }} />
                                    <div className="card-img-overlay d-flex align-items-start justify-content-end p-3">
                                        <span className="badge bg-dark bg-opacity-75 rounded-pill px-3 py-2">
                                            {book.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="card-body p-4 text-center d-flex flex-column">
                                    <h5 className="card-title fw-bold text-dark mb-1 text-truncate">{book.title}</h5>
                                    <p className="card-text text-muted mb-3 small">by {book.author}</p>

                                    <div className="mb-3 d-flex flex-wrap justify-content-center gap-1">
                                        {book.tags && book.tags.map((tag, i) => (
                                            <span
                                                key={tag._id || i}
                                                className="badge rounded-pill border fw-normal"
                                                style={{ fontSize: "0.7rem", backgroundColor: "#f8f9fa", color: "#6c757d" }}
                                            >
                                                #{tag && typeof tag === 'object' ? tag.name : tag}
                                            </span>
                                        ))}
                                    </div>

                                    <a 
                                        href={book.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn w-100 py-3 fw-bold shadow-sm mt-auto"
                                        style={{ borderRadius: "16px", backgroundColor: "#f39c12", border: "none", color: "#fff" }}
                                    >
                                        Explore Book
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>
                {`
                    .book-card:hover {
                        transform: translateY(-15px) scale(1.02);
                        box-shadow: 0 25px 50px rgba(0,0,0,0.15) !important;
                    }
                `}
            </style>
        </div>
    );
}

export default Books;