import React, {useContext, useState} from 'react';
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import {AuthContext} from '../context/AuthContext';
import {GoogleLogin} from '@react-oauth/google';
// import * as jwtDecode from "jwt-decode";
import {jwtDecode} from "jwt-decode";

function Signup() {


    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);


    const {signup} = useContext(AuthContext);
    const navigate = useNavigate();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!emailRegex.test(email)) {
            alert("Enter a valid email address");
            return;
        }

        const result = await signup({username: name, email, password});

        if (result.success) {
            navigate("/");
        } else {
            alert(result.msg);
        }
    };

    ///////////////////// GOOGLE LOGIN////////////////////////////////////////////////

    const handleGoogleSuccess = async (credentialResponse) => {
        // هنا استخدمنا jwtDecode بالشكل الصحيح

        const decoded = jwtDecode(credentialResponse.credential);
        const googleEmail = decoded.email;

        try {
            // route fix  from : google-send-otp to send/otp
            await axios.post("http://localhost:5000/api/auth/send-otp", {
                email: googleEmail
            });

            setEmail(googleEmail);
            setShowOtp(true);
            alert("OTP sent to your email");

        } catch (err) {
            console.log('i am your error **********************');
            console.log(err);
        }
    };

    ////////////////////////////////////////////////////////////////////////////////////////


    // VERIFY OTP
    const verifyOtp = async () => {
        try {

        // :5000/api/auth/google-send-otp:1  Failed to load resource: the server responded with a status of 404 (Not Found)
        //     Signup.jsx:60 AxiosError: Request failed with status code 404
        //     at settle (axios.js?v=eda01454:1319:7)
        //     at XMLHttpRequest.onloadend (axios.js?v=eda01454:1682:7)
        //     at Axios.request (axios.js?v=eda01454:2328:41)
        //     at async Object.handleGoogleSuccess [as current] (Signup.jsx:51:13)



            // Connecting to 'http://localhost:5000/.well-known/appspecific/com.chrome.devtools.json'
            // violates the following Content Security Policy directive: "default-src 'none'". The request
            // has been blocked. Note that 'connect-src' was not explicitly set, so 'default-src' is used as a fallback.






            /// fix route same problem with names of the routes
            const res = await axios.post("http://localhost:5000/api/auth/verify-otp", {
                email,
                otp
            });
            signup(res.data.token);
            navigate("/");

        } catch (err) {
            alert("Invalid OTP");
        }
    };


    return (
        <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
            <div className="bg-white p-3 rounded w-25">


                {/* ////////////////// NORMAL SIGN UP //////////////////////*/}


                <h2>Register</h2>
                <form onSubmit={handleSubmit} className="p-4">
                    <div className="mb-3">
                        <label><strong>Name</strong></label>
                        <input
                            type="text"
                            placeholder="Enter Name"
                            autoComplete="off"
                            className="form-control rounded-0"
                            required
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label><strong>Email</strong></label>
                        <input
                            type="text"
                            placeholder="Enter Email"
                            autoComplete="off"
                            className="form-control rounded-0"
                            required
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label><strong>Password</strong></label>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            className="form-control rounded-0"
                            required
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-success w-100 rounded-0">
                        Register
                    </button>
                </form>

                <p className="mt-2">Already have an account?</p>
                <Link to="/login" className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none">
                    Login
                </Link>


                {/*/////////////////  GOOGLE SIGN UP /////////////////////*/}

                {/*MOVED GoogleOAuthProvider TO main.jsx and wrapped <App/> by it
                    because of the error :

                    [GSI_LOGGER]: google.accounts.id.initialize() is called multiple times.
                    This could cause unexpected behavior and only the last initialized instance will be used.
                */}

                {/*<GoogleOAuthProvider clientId={clientID}>*/}

                <div className="mt-3">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                            console.log('Google signup failed');
                        }}
                    />
                </div>

                {/*</GoogleOAuthProvider>*/}


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

export default Signup;