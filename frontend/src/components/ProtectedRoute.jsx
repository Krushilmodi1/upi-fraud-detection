import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, token } = useAuth();
    if (!token) return <Navigate to="/login" />;
    if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" />;
    return children;
};

export default ProtectedRoute;