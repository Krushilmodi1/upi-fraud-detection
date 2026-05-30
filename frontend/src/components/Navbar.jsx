import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-lg">
            <Link to="/" className="text-xl font-bold text-blue-400">
                🛡️ UPI FraudGuard
            </Link>

            <div className="flex gap-6 items-center">
                {user ? (
                    <>
                        <Link
                            to="/dashboard"
                            className="hover:text-blue-400 transition"
                        >
                            Dashboard
                        </Link>

                        <Link
                            to="/detect"
                            className="hover:text-blue-400 transition"
                        >
                            Detect Fraud
                        </Link>

                        <Link
                            to="/analytics"
                            className="hover:text-blue-400 transition"
                        >
                            Analytics
                        </Link>

                        <Link
                            to="/assistance"
                            className="hover:text-blue-400 transition"
                        >
                            Assistance
                        </Link>

                        <Link
                            to="/upi-scanner"
                            className="hover:text-green-400 transition"
                        >
                            UPI Scanner
                        </Link>
                        <Link to="/complaints" className="hover:text-blue-400 transition">My Complaints</Link>
                        <Link
                            to="/dispute"
                            className="hover:text-yellow-400 transition"
                        >
                            Dispute Helper
                        </Link>

                        {user.role === 'admin' && (
                            <Link
                                to="/admin"
                                className="hover:text-red-400 transition"
                            >
                                Admin
                            </Link>
                        )}

                        <Link
                            to="/profile"
                            className="hover:text-blue-400 transition"
                        >
                            👤 {user.name}
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="hover:text-blue-400 transition"
                        >
                            Login
                        </Link>
                        
                        <Link
                            to="/register"
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
                        >
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;