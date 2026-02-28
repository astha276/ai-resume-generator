import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import GenerateResume from './pages/GenerateResume';
import ResumePreview from './pages/ResumePreview'; // Make sure this import exists
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from './pages/Services';
import NavBar from './components/NavBar';
import ResumeHistory from './pages/ResumeHistory';

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <Router>
            <NavBar />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/services" element={<Services />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route path="/generate-resume" element={
                    <ProtectedRoute>
                        <GenerateResume />
                    </ProtectedRoute>
                } />
                
                {/* Add this route - IMPORTANT */}
                <Route path="/resume-preview" element={
                    <ProtectedRoute>
                        <ResumePreview />
                    </ProtectedRoute>
                } />

                <Route path="/resume-history" element={
                    <ProtectedRoute>
                        <ResumeHistory />
                    </ProtectedRoute>
                } />
                
                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;