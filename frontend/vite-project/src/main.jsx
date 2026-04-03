import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import {AuthProvider} from './context/AuthContext.jsx';
import {GoogleOAuthProvider} from "@react-oauth/google";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                    <App/>
                </GoogleOAuthProvider>
                <Toaster/>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);
