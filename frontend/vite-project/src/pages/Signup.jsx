import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { signup } = useContext(AuthContext);
    const navigate = useNavigate();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!emailRegex.test(email)) {
            alert("Enter a valid email address");
            return;
        }

        const result = await signup({ username: name, email, password });

        if (result.success) {
            navigate("/");
        } else {
            alert(result.msg);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
            <div className="bg-white p-3 rounded w-25">
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

                {/* Google Signup Button */}
                <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
                    <div className="mt-3">
                        <GoogleLogin
                            onSuccess={credentialResponse => {
                                console.log('Google signup success:', credentialResponse);
                            }}
                            onError={() => {
                                console.log('Google signup failed');
                            }}
                        />
                    </div>
                </GoogleOAuthProvider>
            </div>
        </div>
    );
}

export default Signup;