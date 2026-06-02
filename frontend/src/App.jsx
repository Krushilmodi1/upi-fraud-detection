import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

import FraudDetection from "./pages/FraudDetection";
import Analytics from "./pages/Analytics";
import FraudAssistance from "./pages/FraudAssistance";
import Profile from "./pages/Profile";
import { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";
import UPIScanner from "./pages/UPIScanner";
import DisputeHelper from "./pages/DisputeHelper";

import MyComplaints from "./pages/MyComplaints";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const [loading, setLoading] = useState(true);

useEffect(() => {
  const timer = setTimeout(() => {
    setLoading(false);
  }, 3000);

  return () => clearTimeout(timer);
}, []);

if (loading) {
  return (
    <SplashScreen
      onFinish={() => setLoading(false)}
    />
  );
}

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Toaster position="top-right" />

        <Chatbot />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fraud Detection */}
          <Route
            path="/detect"
            element={
              <ProtectedRoute>
                <FraudDetection />
              </ProtectedRoute>
            }
          />

          {/* Analytics */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* Assistance */}
          <Route
            path="/assistance"
            element={
              <ProtectedRoute>
                <FraudAssistance />
              </ProtectedRoute>
            }
          />

          {/* UPI Scanner */}
          <Route
            path="/upi-scanner"
            element={
              <ProtectedRoute>
                <UPIScanner />
              </ProtectedRoute>
            }
          />

          {/* Dispute Helper */}
          <Route
            path="/dispute"
            element={
              <ProtectedRoute>
                <DisputeHelper />
              </ProtectedRoute>
            }
          />

          {/* Complaints */}
          <Route
            path="/complaints"
            element={
              <ProtectedRoute>
                <MyComplaints />
              </ProtectedRoute>
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
