import React, { useContext, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import * as jwtDecode from "jwt-decode";

function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const emailRegex = /^[^\s@]+@admin\.com$/;

    // LOGIN NORMAL
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post("http://localhost:5000/api/auth/login", {
                email,
                password
            });

            login(res.data.token);

            if (emailRegex.test(email)) {
                navigate("/dashboard");
            } else {
                navigate("/");
            }

        } catch (err) {
            alert(err.response?.data?.msg || "Login failed");
        }
    };

    // GOOGLE LOGIN
    const handleGoogleSuccess = async (credentialResponse) => {

        // هنا استخدمنا jwtDecode بالشكل الصحيح
        const decoded = jwtDecode.default ? jwtDecode.default(credentialResponse.credential) : jwtDecode(credentialResponse.credential);
        const googleEmail = decoded.email;

        try {

            await axios.post("http://localhost:5000/api/auth/google-send-otp", {
                email: googleEmail
            });

            setEmail(googleEmail);
            setShowOtp(true);

            alert("OTP sent to your email");

        } catch (err) {
            console.log(err);
        }
    };

    // VERIFY OTP
    const verifyOtp = async () => {

        try {

            const res = await axios.post("http://localhost:5000/api/auth/google-verify-otp", {
                email,
                otp
            });

            login(res.data.token);
            navigate("/");

        } catch (err) {
            alert("Invalid OTP");
        }

    };

    return (

        <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">

            <div className="bg-white p-3 rounded w-25">

                <h2>Login</h2>

                {/* NORMAL LOGIN */}

                <form onSubmit={handleSubmit} className="p-4">

                    <div className="mb-3">
                        <label><strong>Email</strong></label>
                        <input
                            type="text"
                            className="form-control"
                            required
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label><strong>Password</strong></label>
                        <input
                            type="password"
                            className="form-control"
                            required
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button className="btn btn-success w-100">
                        Login
                    </button>

                </form>

                <p>Don't have an account?</p>

                <Link to="/register" className="btn btn-light border w-100">
                    Register
                </Link>

                {/* GOOGLE LOGIN */}

                <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">

                    <div className="mt-3">

                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => console.log("Google Login Failed")}
                        />

                    </div>

                </GoogleOAuthProvider>


                {/* OTP INPUT */}

                {showOtp && (

                    <div className="mt-3">

                        <input
                            type="text"
                            placeholder="Enter OTP"
                            className="form-control mb-2"
                            onChange={(e) => setOtp(e.target.value)}
                        />

                        <button
                            className="btn btn-primary w-100"
                            onClick={verifyOtp}
                        >
                            Verify OTP
                        </button>

                    </div>

                )}

            </div>

        </div>
    );
}

export default Login;