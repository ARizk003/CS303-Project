import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const redirectMessage = location.state?.message;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
            
            login(res.data.token, res.data.user);

            if (res.data.user && res.data.user.role === 'admin') {
                navigate("/admin-dashboard");
            } else {
                navigate("/");
            }
        } catch (err) {
            alert(err.response?.data?.msg || "Login failed");
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        const decoded = jwtDecode(credentialResponse.credential);
        const googleEmail = decoded.email;

        try {
            await axios.post("http://localhost:5000/api/auth/send-otp", { email: googleEmail });
            setEmail(googleEmail);
            setShowOtp(true);
            alert("OTP sent to your email");
        } catch (err) {
            console.log(err);
            alert("Error sending OTP");
        }
    };

    const verifyOtp = async () => {
        try {
            const res = await axios.post("http://localhost:5000/api/auth/verify-otp", { email, otp });
            login(res.data.token, res.data.user);
            navigate("/");
        } catch (err) {
            alert("Invalid OTP");
        }
    };

    return (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center" 
             style={{ background: "#f0f2f5", fontFamily: "'Poppins', sans-serif" }}>
            
            <div className="card shadow-lg border-0" 
                 style={{ width: "90%", maxWidth: "1200px", borderRadius: "30px", overflow: "hidden", background: "#fdfaf6" }}>
                
                <div className="row g-0">
                    
                    <div className="col-lg-7 d-none d-lg-block" 
                         style={{ 
                             backgroundImage: "url('/Homepage.jpg')", 
                             backgroundSize: "cover", 
                             backgroundPosition: "center", 
                             position: "relative"
                         }}>
                        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)" }}></div>
                        
                        <div className="h-100 d-flex flex-column justify-content-center p-5 text-white" style={{ position: "relative", zIndex: 2 }}>
                            <h1 className="fw-bold display-3 mb-3">LEARNOVA</h1>
                            <p className="fs-4 fw-light" style={{ maxWidth: "500px", color: "#e0e0e0" }}>
                                "A room without books is like a body without a soul."
                            </p>
                        </div>
                    </div>

                    <div className="col-lg-5 d-flex align-items-center">
                        <div className="card-body p-5">
                            <div className="text-center mb-5">
                                <h2 className="fw-bold display-6 text-dark">Welcome Back</h2>
                                <p className="text-muted">Login to your Learnova account</p>
                            </div>

                            {redirectMessage && (
                                <div className="alert d-flex align-items-center gap-2 mb-4"
                                     style={{ background: "#fff8ec", border: "1px solid #f39c12", borderRadius: "12px", color: "#7d5a00" }}>
                                    <span style={{ fontSize: "1.2rem" }}>🔒</span>
                                    <span className="small fw-semibold">{redirectMessage}</span>
                                </div>
                            )}

                            {!showOtp ? (
                                <>
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-4">
                                            <label className="form-label fw-bold">Email Address</label>
                                            <input type="email" className="form-control form-control-lg border-0 shadow-sm py-3" 
                                                   style={{ borderRadius: "15px", background: "#fff" }} 
                                                   required onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
                                        </div>
                                        <div className="mb-4">
                                            <label className="form-label fw-bold">Password</label>
                                            <input type="password" className="form-control form-control-lg border-0 shadow-sm py-3" 
                                                   style={{ borderRadius: "15px", background: "#fff" }} 
                                                   required onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                                        </div>
                                        <button className="btn btn-dark btn-lg w-100 py-3 mt-2 fw-bold" 
                                                style={{ borderRadius: "15px", background: "#2c3e50" }}>Sign In</button>
                                    </form>

                                    <div className="text-center my-4 text-muted small">OR LOGIN WITH</div>
                                    
                                    <div className="d-flex justify-content-center">
                                        <GoogleLogin 
                                            onSuccess={handleGoogleSuccess} 
                                            onError={() => alert("Google Login Failed")}
                                            shape="pill"
                                        />
                                    </div>

                                    <p className="text-center mt-5 mb-0">
                                        New here? <Link to="/register" className="fw-bold text-decoration-none" style={{color: "#C5A059"}}>Create Account</Link>
                                    </p>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <h3 className="fw-bold mb-4">Verify Your Email</h3>
                                    <p className="small text-muted mb-4">Enter the OTP sent to {email}</p>
                                    <input type="text" className="form-control form-control-lg text-center mb-4 border-0 shadow-sm py-3" 
                                           style={{ letterSpacing: "8px", fontSize: "1.5rem", borderRadius: "15px" }}
                                           onChange={(e) => setOtp(e.target.value)} placeholder="000000" />
                                    <button className="btn btn-primary btn-lg w-100 py-3 fw-bold" 
                                            onClick={verifyOtp} style={{ borderRadius: "15px", background: "#C5A059", border: "none" }}>
                                        Verify & Login
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;