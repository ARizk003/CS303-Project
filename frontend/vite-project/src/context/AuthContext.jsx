import axios from "axios";
import {createContext, useState, useEffect} from "react";

export const AuthContext = createContext()

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        if (token && userData) {
            setUser({ token, ...JSON.parse(userData) });
        } else if (token) {
            setUser({ token });
        }
        setLoading(false);
    }, []);

    const login = (token, userData) => {
        localStorage.setItem("token", token);
        if (userData) {
            localStorage.setItem("user", JSON.stringify(userData));
            setUser({ token, ...userData });
        } else {
            setUser({ token });
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    const signup = async ({username, email, password}) => {

        if (!emailRegex.test(email)) {
            setError('enter a valid email address');
            console.log("enter a valid email address");
            alert("enter a valid email address");
            return;
        } else {
            try {
                const res = await axios.post('http://localhost:5000/api/auth/register', {username, email, password})
                login(res.data.token, res.data.user)
                return {success: true}
            } catch (err) {
                console.log(err.response?.data || err.message);
                return {success: false, msg: err.response?.data?.msg || "Signup failed"};
            }
        }

    }
    return (
        <AuthContext.Provider value={{user, login, logout, loading, signup}}>
            {children}
        </AuthContext.Provider>
    );
}