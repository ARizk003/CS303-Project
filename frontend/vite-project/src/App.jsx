import 'bootstrap/dist/css/bootstrap.min.css';
import {Routes, Route} from "react-router-dom";
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Books from "./pages/Books";
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Footer from './components/Footer';
import UserLists from "./pages/UserLists.jsx";

function App() {
    return (
        <>
            <Navbar/>
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path='/register' element={<Signup/>}/>
                <Route path='/login' element={<Login/>}/>
                {/* <Route path='/dashboard' element={<DashBoard />} /> */}
                <Route path="/books" element={<Books/>}/>

                <Route path='/admin-dashboard' element={
                    <ProtectedRoute adminOnly={true}>
                        <AdminDashboard/>
                    </ProtectedRoute>
                }/>

                <Route path='/my-lists' element={
                    <ProtectedRoute adminOnly={false}>
                        <UserLists/>
                    </ProtectedRoute>
                }
                />

            </Routes>
            <Footer/>
        </>
    )
}

export default App;