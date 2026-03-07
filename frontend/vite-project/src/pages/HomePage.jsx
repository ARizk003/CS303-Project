import { Link } from "react-router-dom";

function HomePage() {
    return (
        <div>
            <div
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    height: "80vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    textAlign: "center",
                }}
            >
                <div style={{ background: "rgba(0,0,0,0.5)", padding: "40px", borderRadius: "10px" }}>
                    <h1 className="display-4 fw-bold">Welcome to LEARNOVA</h1>
                    <p className="lead">
                        Discover thousands of books and expand your knowledge anytime.
                    </p>

                    <Link to="/register" className="btn btn-warning btn-lg mt-3">
                        Get Started
                    </Link>
                </div>
            </div>
            <div className="container text-center my-5">
                <h2 className="mb-4">Why Choose LEARNOVA?</h2>
                <div className="row">

                    <div className="col-md-4">
                        <h4>📚 Huge Library</h4>
                        <p>
                            Access a wide range of books from different categories.
                        </p>
                    </div>

                    <div className="col-md-4">
                        <h4>⚡ Easy Access</h4>
                        <p>
                            Read books online anytime from anywhere.
                        </p>
                    </div>

                    <div className="col-md-4">
                        <h4>👤 Personal Account</h4>
                        <p>
                            Create your own account and manage your reading list.
                        </p>
                    </div>

                </div>
            </div>

        </div>
    );
}

export default HomePage;