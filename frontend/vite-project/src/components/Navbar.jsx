import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/LEARNOVA.png'; 
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen,setIsOpen]=useState(false)
  const{user,logout}=useContext(AuthContext)

  const toggleMenu=()=>{
    setIsOpen(!isOpen)
  }

  const handleLogOut=()=>{
    logout()
    setIsOpen(false)
  }

  const isAdmin = user && user.role === 'admin';
  return (
    <>
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center fw-bold" style={{fontSize: '1.6rem'}} to="/">
          <img 
            src={logo} 
            alt="LearnOva Logo" 
            width="100" 
            height="60" 
            className="d-inline-block align-top me-2" 
          />
          <span style={{ color: '#002147' }}>LEARN</span>
          <span style={{ color: '#C5A059' }}>OVA</span>
        </Link>
        
        <button className="navbar-toggler" type="button" onClick={toggleMenu}>
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen?'show':''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/" onClick={() => setIsOpen(false)}>Home</Link>

            </li>
          {user?(
              <>
        {isAdmin && (
          <li className="nav-item">
            <Link 
              className="btn text-white px-3 rounded-pill me-2"
              style={{backgroundColor: '#002147'}}
              to="/admin-dashboard" 
              onClick={() => setIsOpen(false)}
            >
              Admin Dashboard
            </Link>
          </li>
        )}
        <li className="nav-item">
          <button 
            className="btn btn-danger px-3 rounded-pill ms-2"
            onClick={handleLogOut}
          >
            Logout
          </button>
        </li>
        </>
            ):(
                    <>
              <li className="nav-item">
                <Link className="nav-link mx-lg-2 fw-semibold" to="/login" onClick={() => setIsOpen(false)}>Login</Link>
              </li>
              <li className="nav-item">
                <Link className="btn text-white px-4 rounded-pill shadow-sm" style={{backgroundColor: '#C5A059'}} to="/Register" onClick={() => setIsOpen(false)}>
                  Sign Up
                </Link>
              </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navbar;