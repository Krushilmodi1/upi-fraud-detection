import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post('/auth/login', form);
            login(res.data.data, res.data.data.token);
            toast.success('Login successful!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md border border-gray-800">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
                <p className="text-gray-400 mb-8">Login to your account</p>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-gray-300 text-sm mb-1 block">Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={e => setForm({...form, email: e.target.value})}
                            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-gray-300 text-sm mb-1 block">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={e => setForm({...form, password: e.target.value})}
                            className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="text-gray-400 text-center mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-400 hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;