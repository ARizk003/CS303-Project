import 'bootstrap/dist/css/bootstrap.min.css';
import {Routes, Route} from "react-router-dom";
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashBoard from "./pages/DashBoard.jsx";
import Footer from './components/Footer';

function App() {
    return (
        <>
            {}
            <Navbar/>
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path='/register' element={<Signup/>}/>
                <Route path='/login' element={<Login/>}/>
                <Route path='/dashboard' element={<DashBoard/>}/>
            </Routes>
            <Footer/>
        </>
    )
}

export default App;