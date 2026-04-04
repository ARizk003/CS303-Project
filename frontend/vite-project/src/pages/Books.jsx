import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Books() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:5000/api/books')
            .then(res => setBooks(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="container-fluid px-4 py-5" style={{ background: "#f1f3f5", minHeight: "100vh" }}>
            
            <div className="text-center mb-5 mt-4">
                <h1 className="display-3 fw-bold mb-3" style={{ color: "#1a1a1a", letterSpacing: "-1px" }}>
                    Explore Our Masterpieces 
                </h1>
                <p className="text-muted fs-4">Curated collection for the curious minds.</p>
                <div className="mx-auto" style={{ width: "100px", height: "5px", background: "#f39c12", borderRadius: "50px" }}></div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border" style={{ color: "#f39c12" }} role="status" />
                </div>
            ) : books.length === 0 ? (
                <div className="text-center py-5 text-muted fs-5">No books found.</div>
            ) : (
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4">
                    {books.map((book) => (
                        <div className="col" key={book._id}>
                            <div className="card h-100 border-0 shadow-sm book-card" 
                                 style={{ borderRadius: "24px", overflow: "hidden", background: "#fff", transition: "all 0.4s ease" }}>
                                
                                <div className="position-relative" style={{ height: "350px" }}>
                                    <img 
                                        src="/Book.jpg"
                                        className="card-img-top h-100 w-100" 
                                        alt={book.title} 
                                        style={{ objectFit: "cover" }}
                                    />
                                    <div className="card-img-overlay d-flex align-items-start justify-content-end p-3">
                                        <span className="badge bg-dark bg-opacity-75 rounded-pill px-3 py-2">
                                            {book.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="card-body p-4 text-center">
                                    <h5 className="card-title fw-bold text-dark mb-2 text-truncate">{book.title}</h5>
                                    <p className="card-text text-muted mb-4 small">by {book.author}</p>
                                    <a
                                        href={book.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn w-100 py-3 fw-bold shadow-sm"
                                        style={{ borderRadius: "16px", fontSize: "1rem", backgroundColor: "#f39c12", border: "none", color: "#fff" }}
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
                    .book-card:hover img {
                        filter: brightness(0.9);
                    }
                `}
            </style>
        </div>
    );
}

export default Books;