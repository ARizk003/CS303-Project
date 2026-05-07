



import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/LEARNOVA.png';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const isAdmin = user && user.role === 'admin';

  // Handle scroll effect for shadow and sizing
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
      <nav className={`navbar navbar-expand-lg sticky-top transition-all ${scrolled ? 'shadow-md' : 'shadow-sm'}`}
           style={{
             background: "#fdfaf6",
             borderBottom: "3px solid #C5A059",
             padding: scrolled ? "8px 0" : "15px 0",
             transition: "all 0.4s ease",
             zIndex: 1000
           }}>
        <div className="container-fluid px-lg-5">

          {/* Brand/Logo Section */}
          <Link className="navbar-brand d-flex align-items-center" to="/" style={{ textDecoration: 'none' }}>
            <img
                src={logo}
                alt="Learnova Logo"
                style={{ width: scrolled ? '65px' : '75px', transition: '0.4s' }}
                className="me-2"
            />
            <div className="d-flex flex-column lh-1 border-start ps-3 ms-2" style={{ borderColor: '#C5A059 !important' }}>
            <span className="fw-bold h2 mb-0" style={{ color: '#2c3e50', fontFamily: "'Playfair Display', serif", letterSpacing: '1px' }}>
              LEARN<span style={{ color: '#C5A059' }}>OVA</span>
            </span>
              <small style={{ color: '#8e7f68', fontSize: '0.65rem', letterSpacing: '3px', fontWeight: '800' }}>
                PREMIUM LIBRARY
              </small>
            </div>
          </Link>

          {/* Mobile Toggle Button */}
          <button className="navbar-toggler border-0 shadow-none" type="button" onClick={toggleMenu}>
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navigation Links */}
          <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
            <ul className="navbar-nav ms-auto align-items-center gap-2">

              <li className="nav-item">
                <Link className={`nav-link custom-link ${location.pathname === '/' ? 'active-item' : ''}`} to="/" onClick={() => setIsOpen(false)}>
                  Home
                </Link>
              </li>

              <li className="nav-item">
                <Link className={`nav-link custom-link ${location.pathname === '/books' ? 'active-item' : ''}`} to="/books" onClick={() => setIsOpen(false)}>
                  Our Books
                </Link>
              </li>

              {/* NEW: My Lists Link (Visible only to logged-in users) */}
              {user && !isAdmin && (
                  <li className="nav-item">
                    <Link
                        className={`nav-link custom-link ${location.pathname === '/my-lists' ? 'active-item' : ''}`}
                        to="/my-lists"
                        onClick={() => setIsOpen(false)}
                    >
                      My Lists
                    </Link>
                  </li>
              )}

                {user && !isAdmin && (
                    <li className="nav-item">
                        <Link
                            className={`nav-link custom-link ${location.pathname === '/my-borrow-req' ? 'active-item' : ''}`}
                            to="/my-borrow-req"
                            onClick={() => setIsOpen(false)}
                        >
                            My Borrow Requests
                        </Link>
                    </li>
                )}

{/* User Profile / Auth Actions */}
{user ? (
    <li className="nav-item ms-lg-4 d-flex align-items-center gap-3 bg-white p-2 px-3 shadow-sm rounded-pill" style={{ border: '1px solid #C5A059' }}>
      {/* Profile Link - Clickable username with icon */}
      <Link 
        to="/profile" 
        className="d-flex align-items-center gap-2 text-decoration-none"
        onClick={() => setIsOpen(false)}
      >
        <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" 
             style={{ width: '28px', height: '28px', backgroundColor: '#f0e3ca !important' }}>
          <span style={{ fontSize: '0.8rem' }}>👤</span>
        </div>
        <span className="fw-bold profile-name">{user.username || user.name}</span>
      </Link>

      {isAdmin && (
          <Link
              to="/admin-dashboard"
              className="btn btn-sm btn-dark rounded-pill px-2"
              style={{fontSize: '0.7rem'}}
          >
            ADMIN
          </Link>
      )}

      <button
          className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold"
          onClick={() => { logout(); setIsOpen(false); }}
          style={{ fontSize: '0.75rem' }}
      >
        LOGOUT
      </button>
    </li>
) : (
    <div className="d-flex align-items-center ms-lg-4 gap-4 mt-3 mt-lg-0">
      <li className="nav-item">
        <Link className="nav-link fw-bold sign-in-link" to="/login" onClick={() => setIsOpen(false)}>
          Sign In
        </Link>
      </li>
      <li className="nav-item">
        <Link className="btn join-btn" to="/Register" onClick={() => setIsOpen(false)}>
          Join Learnova
        </Link>
      </li>
    </div>
)}            </ul>
          </div>
        </div>

        {/* Scoped Styles for Premium Look */}
        <style>
          {`
          .custom-link { color: #5d5c5c !important; font-weight: 600; font-size: 1.05rem; padding: 10px 18px !important; transition: 0.3s ease; }
          .custom-link:hover { color: #C5A059 !important; background: rgba(197, 160, 89, 0.08); border-radius: 12px; }
          .active-item { color: #C5A059 !important; border-bottom: 2px solid #C5A059; border-radius: 0 !important; }
          .sign-in-link { color: #8e7f68 !important; font-size: 1rem; transition: 0.3s; }
          .join-btn { background: linear-gradient(135deg, #C5A059 0%, #b38f4d 100%); color: #fff !important; font-weight: 700; padding: 12px 35px !important; border-radius: 50px; border: none; box-shadow: 0 4px 15px rgba(197, 160, 89, 0.3); text-transform: uppercase; font-size: 0.9rem; letter-spacing: 1px; transition: all 0.3s ease; }
          @media (max-width: 991px) { .navbar-collapse { background: #fdfaf6; padding: 25px; margin-top: 15px; border-radius: 20px; border: 1px solid #C5A059; } }
        `}
        </style>
      </nav>
  );
};

export default Navbar;

