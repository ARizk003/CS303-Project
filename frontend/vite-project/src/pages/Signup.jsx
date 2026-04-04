import React, { useContext, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [loadingOtp, setLoadingOtp] = useState(false);
    const [isGoogleSignup, setIsGoogleSignup] = useState(false);

    const { signup, login } = useContext(AuthContext);
    const navigate = useNavigate();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!emailRegex.test(email)) {
            alert("Enter a valid email address");
            return;
        }
        if (!name || !password) {
            alert("Please fill all fields");
            return;
        }

        setLoadingOtp(true);
        try {
            await axios.post("http://localhost:5000/api/auth/send-otp", { email });
            setShowOtp(true);
            setIsGoogleSignup(false);
            alert("OTP sent to your email!");
        } catch (err) {
            alert("Error sending OTP. Please try again.");
            console.error(err);
        }
        setLoadingOtp(false);
    };


    const verifyOtp = async () => {
        if (!otp) {
            alert("Please enter the OTP");
            return;
        }
        try {
            
            await axios.post("http://localhost:5000/api/auth/verify-otp", { email, otp });

            if (isGoogleSignup) {
                
                const res = await axios.post("http://localhost:5000/api/auth/register", {
                    username: name,
                    email,
                    password: Math.random().toString(36).slice(-8) 
                });
                login(res.data.token, res.data.user);
            } else {
                
                const result = await signup({ username: name, email, password });
                if (!result.success) {
                    alert(result.msg);
                    return;
                }
            }
            navigate("/");
        } catch (err) {
            alert(err.response?.data?.msg || "Invalid OTP. Please try again.");
        }
    };

    // Google Login handler
    const handleGoogleSuccess = async (credentialResponse) => {
        const decoded = jwtDecode(credentialResponse.credential);
        const googleEmail = decoded.email;
        const googleName = decoded.name;

        setEmail(googleEmail);
        setName(googleName);
        setIsGoogleSignup(true);

        try {
            await axios.post("http://localhost:5000/api/auth/send-otp", { email: googleEmail });
            setShowOtp(true);
            alert("OTP sent to your email!");
        } catch (err) {
            console.log(err);
            alert("Error sending OTP");
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
                             backgroundImage: "url('/Signup.jpg')",
                             backgroundSize: "cover",
                             backgroundPosition: "center",
                             position: "relative"
                         }}>
                        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.4)" }}></div>
                        <div className="h-100 d-flex flex-column justify-content-center p-5 text-white" style={{ position: "relative", zIndex: 2 }}>
                            <h1 className="fw-bold display-2 mb-4">JOIN US</h1>
                            <p className="fs-3 fw-light" style={{ maxWidth: "500px" }}>
                                "The more that you learn, the more places you'll go."
                            </p>
                        </div>
                    </div>

                    <div className="col-lg-5 d-flex align-items-center">
                        <div className="card-body p-5">
                            <div className="mb-4">
                                <h2 className="fw-bold display-5 text-dark mb-2">Register</h2>
                                <p className="text-muted fs-5">Start your journey with Learnova today.</p>
                            </div>

                            {!showOtp ? (
                                <>
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Full Name</label>
                                            <input type="text" className="form-control form-control-lg border-0 shadow-sm py-3"
                                                   style={{ borderRadius: "15px", background: "#fff" }} required
                                                   value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Email Address</label>
                                            <input type="email" className="form-control form-control-lg border-0 shadow-sm py-3"
                                                   style={{ borderRadius: "15px", background: "#fff" }} required
                                                   value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Password</label>
                                            <input type="password" className="form-control form-control-lg border-0 shadow-sm py-3"
                                                   style={{ borderRadius: "15px", background: "#fff" }} required
                                                   onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                                        </div>
                                        <button type="submit" className="btn btn-dark btn-lg w-100 py-3 mt-3 fw-bold"
                                                style={{ borderRadius: "15px", background: "#2c3e50" }} disabled={loadingOtp}>
                                            {loadingOtp ? "Sending OTP..." : "Sign Up"}
                                        </button>
                                    </form>

                                   <p className="text-center mt-4">
                                        Already have an account? <Link to="/login" className="fw-bold text-decoration-none" style={{color: "#C5A059"}}>Login</Link>
                                    </p>

                                    <div className="text-center my-3 text-muted small">OR</div>

                                    <div className="d-flex justify-content-center">
                                        <GoogleLogin
                                            onSuccess={handleGoogleSuccess}
                                            onError={() => console.log('Google signup failed')}
                                            shape="pill"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <h3 className="fw-bold mb-4">Verify OTP</h3>
                                    <p className="text-muted mb-4">We sent a code to <strong>{email}</strong></p>
                                    <input type="text" className="form-control form-control-lg text-center mb-4 border-0 shadow-sm py-3"
                                           style={{ letterSpacing: "8px", fontSize: "1.5rem", borderRadius: "15px" }}
                                           onChange={(e) => setOtp(e.target.value)} placeholder="000000" maxLength={6} />
                                    <button className="btn btn-lg w-100 py-3 fw-bold"
                                            onClick={verifyOtp} style={{ borderRadius: "15px", background: "#C5A059", border: "none", color: "white" }}>
                                        Verify & Register
                                    </button>
                                    <button className="btn btn-link mt-3 text-muted"
                                            onClick={() => setShowOtp(false)}>
                                        ← Go Back
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

export default Signup;
