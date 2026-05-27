import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FraudDetection from './pages/FraudDetection';
import Analytics from './pages/Analytics';
import FraudAssistance from './pages/FraudAssistance';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <Toaster position="top-right" />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={
                        <ProtectedRoute><Dashboard /></ProtectedRoute>
                    } />
                    <Route path="/detect" element={
                        <ProtectedRoute><FraudDetection /></ProtectedRoute>
                    } />
                    <Route path="/analytics" element={
                        <ProtectedRoute><Analytics /></ProtectedRoute>
                    } />
                    <Route path="/assistance" element={
                        <ProtectedRoute><FraudAssistance /></ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute><Profile /></ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                        <ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;