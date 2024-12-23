import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './styles/global.css';
import Homepage from "./pages/Homepage/Homepage";
import Login from './pages/Login/Login';
import Features from "./pages/Features/Features";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/features" element={<Features />} />
            </Routes>
        </Router>
    );
};

export default App;
