import { Link } from "react-router-dom";

const stats = [
  { value: "10,000+", label: "Books Available" },
  { value: "50+",     label: "Categories" },
  { value: "25,000+", label: "Happy Readers" },
  { value: "100%",    label: "Free to Browse" },
];

const features = [
  {
    icon: "📚",
    title: "Huge Library",
    desc: "Access a wide range of books from different categories — fiction, science, history, and more.",
  },
  {
    icon: "⚡",
    title: "Easy Access",
    desc: "Read books online anytime, anywhere, on any device — no downloads needed.",
  },
  {
    icon: "👤",
    title: "Personal Account",
    desc: "Create your account, track your reading progress, and manage your personal reading list.",
  },
  {
    icon: "🔖",
    title: "Bookmarks",
    desc: "Save your favourite pages and come back to them anytime.",
  },
  {
    icon: "🔍",
    title: "Smart Search",
    desc: "Find exactly what you're looking for by title, genre, or keyword.",
  },
];

const featured = [
  { title: "Mathematics",  genre: "Math",    cover: "https://covers.openlibrary.org/b/isbn/9780073383095-M.jpg" },
  { title: "Physics",      genre: "Physics", cover: "https://covers.openlibrary.org/b/isbn/9780321909107-M.jpg" },
  { title: "Chemistry",    genre: "Science", cover: "https://covers.openlibrary.org/b/isbn/9781305957404-M.jpg" },
  { title: "Programming",  genre: "CS",      cover: "https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg" },
];

function HomePage() {
  return (
    <div>

      <div
        style={{
          backgroundImage: "url('/Homepage.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "85vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          textAlign: "center",
        }}
      >
        <div style={{ background: "rgba(0,0,0,0.55)", padding: "48px 40px", borderRadius: "12px", maxWidth: 600 }}>
          <h1 className="display-4 fw-bold">Welcome to LEARNOVA</h1>
          <p className="lead" style={{ marginBottom: "8px" }}>
            Discover thousands of books and expand your knowledge anytime.
          </p>
          <p style={{ opacity: 0.85, marginBottom: "24px" }}>
            Your personal digital library — read, bookmark, and grow.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/books" className="btn btn-warning btn-lg">
              Get Started
            </Link>

          </div>
        </div>
      </div>

      <div style={{ background: "#1e293b", color: "white", padding: "32px 16px" }}>
        <div className="container">
          <div className="row text-center g-3">
            {stats.map((s) => (
              <div key={s.label} className="col-6 col-md-3">
                <div style={{ fontSize: "2rem", fontWeight: 700, color: "#f59e0b" }}>{s.value}</div>
                <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container text-center my-5">
        <h2 className="mb-2">Why Choose LEARNOVA?</h2>
        <p className="text-muted mb-4">Everything you need for a great reading experience</p>

        <div className="row g-4 justify-content-center mb-4">
          {features.slice(0, 3).map((f) => (
            <div key={f.title} className="col-md-4">
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "28px 20px",
                  height: "100%",
                  transition: "box-shadow 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <div style={{ fontSize: "2.2rem", marginBottom: "12px" }}>{f.icon}</div>
                <h5 className="fw-semibold">{f.title}</h5>
                <p className="text-muted" style={{ fontSize: "0.9rem" }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4 justify-content-center">
          {features.slice(3).map((f) => (
            <div key={f.title} className="col-md-4">
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "28px 20px",
                  height: "100%",
                  transition: "box-shadow 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <div style={{ fontSize: "2.2rem", marginBottom: "12px" }}>{f.icon}</div>
                <h5 className="fw-semibold">{f.title}</h5>
                <p className="text-muted" style={{ fontSize: "0.9rem" }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#f8fafc", padding: "48px 0" }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">Featured Books</h2>
              <p className="text-muted mb-0">Hand-picked reads to get you started</p>
            </div>
            <Link to="/books" className="btn btn-outline-warning">
              View All →
            </Link>
          </div>
          <div className="row g-4">
            {featured.map((b) => (
              <div key={b.title} className="col-6 col-md-3">
                <div
                  style={{
                    background: "white",
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                    height: "100%",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <img
                    src={b.cover}
                    alt={b.title}
                    style={{ width: "100%", height: "200px", objectFit: "cover" }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <div style={{ padding: "14px" }}>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        background: "#fef9c3",
                        color: "#92400e",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        fontWeight: 600,
                      }}
                    >
                      {b.genre}
                    </span>
                    <h6 className="fw-bold mt-2 mb-0" style={{ fontSize: "0.95rem" }}>{b.title}</h6>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          color: "white",
          textAlign: "center",
          padding: "64px 24px",
        }}
      >
        <h2 className="fw-bold mb-3">Ready to Start Reading?</h2>
        <p style={{ opacity: 0.8, maxWidth: 480, margin: "0 auto 28px" }}>
          Join LEARNOVA today for free and unlock access to thousands of books across every genre.
        </p>
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <Link to="/register" className="btn btn-warning btn-lg px-4">
            Create Free Account
          </Link>

        </div>
      </div>

    </div>
  );
}

export default HomePage;