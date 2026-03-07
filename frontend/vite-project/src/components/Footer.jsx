import React from 'react';

function Footer() {
    return (
        <footer className="py-4 mt-5" style={{ backgroundColor: '#C2A85A', fontFamily: 'Arial, sans-serif', color: '#ffffff' }}>
            <div className="container">
                <div className="row text-center text-md-start">
                    
                    <div className="col-md-4 mb-3">
                        <h5 className="fw-bold">About Us</h5>
                        <p className="small">
                            We provide the best e-library experience with online access to your favorite books. 
                            Enjoy reading anytime, anywhere.
                        </p>
                    </div>

                    <div className="col-md-4 mb-3">
                        <h5 className="fw-bold">Quick Links</h5>
                        <ul className="list-unstyled small">
                            <li><a href="/" className="text-white text-decoration-none">Home</a></li>
                            <li><a href="/login" className="text-white text-decoration-none">Login</a></li>
                            <li><a href="/register" className="text-white text-decoration-none">Register</a></li>
                            <li><a href="/about" className="text-white text-decoration-none">About</a></li>
                        </ul>
                    </div>

                    <div className="col-md-4 mb-3">
                        <h5 className="fw-bold">Contact</h5>
                        <p className="small mb-1">
                            Email: info@elibrary.com
                        </p>
                        <p className="small mb-1">
                            Phone: +123 456 7890
                        </p>
                        <p className="small mb-1">
                            Address: 123 Main Street, City, Country
                        </p>

                        <div className="d-flex justify-content-center justify-content-md-start mt-2 gap-3">
                            <a href="#" className="text-white"><i className="fab fa-facebook-f"></i></a>
                            <a href="#" className="text-white"><i className="fab fa-twitter"></i></a>
                            <a href="#" className="text-white"><i className="fab fa-instagram"></i></a>
                            <a href="#" className="text-white"><i className="fab fa-linkedin-in"></i></a>
                        </div>
                    </div>

                </div>

                <div className="text-center mt-4 small">
                    &copy; {new Date().getFullYear()} LearnNova. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

export default Footer;