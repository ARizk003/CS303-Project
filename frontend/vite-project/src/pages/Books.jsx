import React from 'react';

function Books() {
    const books = [
        { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Classic", img: "/Book.jpg" },
        { id: 2, title: "Atomic Habits", author: "James Clear", category: "Self-Help", img:"/Book.jpg" },
        { id: 3, title: "Deep Work", author: "Cal Newport", category: "Productivity", img: "/Book.jpg" },
        { id: 4, title: "The Psychology of Money", author: "Morgan Housel", category: "Finance", img:"/Book.jpg"},
        { id: 5, title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", img: "/Book.jpg"},
        { id: 6, title: "Clean Code", author: "Robert C. Martin", category: "Programming", img: "/Book.jpg" },
        { id: 7, title: "Sapiens", author: "Yuval Noah Harari", category: "History", img: "/Book.jpg"},
        { id: 8, title: "Start With Why", author: "Simon Sinek", category: "Business", img:"/Book.jpg" },
        { id: 9, title: "The 5 AM Club", author: "Robin Sharma", category: "Self-Help", img: "/Book.jpg"},
        { id: 10, title: "Brave New World", author: "Aldous Huxley", category: "Classic", img: "/Book.jpg" },
        { id: 11, title: "Thinking, Fast and Slow", author: "Daniel Kahneman", category: "Psychology", img: "/Book.jpg" },
        { id: 12, title: "The Subtle Art...", author: "Mark Manson", category: "Self-Help", img:"/Book.jpg" },
        { id: 13, title: "Principles", author: "Ray Dalio", category: "Finance", img: "/Book.jpg" },
        { id: 14, title: "Dune", author: "Frank Herbert", category: "Sci-Fi", img: "/Book.jpg" },
        { id: 15, title: "Zero to One", author: "Peter Thiel", category: "Business", img: "/Book.jpg" },
        { id: 16, title: "1984", author: "George Orwell", category: "Dystopian", img: "/Book.jpg"},
        { id: 17, title: "The 4-Hour Workweek", author: "Tim Ferriss", category: "Productivity", img:"/Book.jpg"},
        { id: 18, title: "The Power of Habit", author: "Charles Duhigg", category: "Psychology", img: "/Book.jpg" },
        { id: 19, title: "Elon Musk", author: "Walter Isaacson", category: "Biography", img: "/Book.jpg"},
        { id: 20, title: "Grit", author: "Angela Duckworth", category: "Psychology", img: "/Book.jpg" },
    ];

    return (
        <div className="container-fluid px-4 py-5" style={{ background: "#f1f3f5", minHeight: "100vh" }}>
            
            <div className="text-center mb-5 mt-4">
                <h1 className="display-3 fw-bold mb-3" style={{ color: "#1a1a1a", letterSpacing: "-1px" }}>
                    Explore Our Masterpieces 
                </h1>
                <p className="text-muted fs-4">Curated collection for the curious minds.</p>
                <div className="mx-auto" style={{ width: "100px", height: "5px", background: "#f39c12", borderRadius: "50px" }}></div>
            </div>

            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4">
                {books.map((book) => (
                    <div className="col" key={book.id}>
                        <div className="card h-100 border-0 shadow-sm book-card" 
                             style={{ borderRadius: "24px", overflow: "hidden", background: "#fff", transition: "all 0.4s ease" }}>
                            
                            <div className="position-relative" style={{ height: "350px" }}>
                                <img 
                                    src={book.img} 
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
                                <button className="btn btn-warning w-100 py-3 fw-bold shadow-sm" 
                                        style={{ borderRadius: "16px", fontSize: "1rem", backgroundColor: "#f39c12", border: "none", color: "#fff" }}>
                                    Explore Book
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

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