import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import RiskBadge from '../components/RiskBadge';

const Dashboard = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await API.get('/transactions/my');
                setTransactions(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const fraudCount = transactions.filter(t => t.isFraud).length;
    const safeCount = transactions.length - fraudCount;

    return (
        <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-2">
                    👋 Welcome, {user?.name}
                </h1>
                <p className="text-gray-400 mb-8">Your transaction overview</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {[
                        { label: 'Total Transactions', value: transactions.length, color: 'text-blue-400' },
                        { label: 'Fraud Detected', value: fraudCount, color: 'text-red-400' },
                        { label: 'Safe Transactions', value: safeCount, color: 'text-green-400' }
                    ].map((s, i) => (
                        <div key={i} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                            <div className={`text-4xl font-bold ${s.color}`}>{s.value}</div>
                            <div className="text-gray-400 mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-800">
                        <h2 className="text-xl font-bold">Recent Transactions</h2>
                    </div>
                    {loading ? (
                        <div className="p-10 text-center text-gray-400">Loading...</div>
                    ) : transactions.length === 0 ? (
                        <div className="p-10 text-center text-gray-400">
                            No transactions yet. <a href="/detect" className="text-blue-400">Analyze one now →</a>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-800">
                                    <tr>
                                        {['Amount', 'Status', 'Risk Score', 'Risk Tier', 'Date'].map(h => (
                                            <th key={h} className="px-6 py-3 text-left text-gray-400 text-sm">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((t, i) => (
                                        <tr key={i} className="border-t border-gray-800 hover:bg-gray-800 transition">
                                            <td className="px-6 py-4 font-semibold">₹{t.amount.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${t.isFraud ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                                                    {t.isFraud ? '🚨 Fraud' : '✅ Safe'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{t.riskScore}/100</td>
                                            <td className="px-6 py-4"><RiskBadge tier={t.riskTier} /></td>
                                            <td className="px-6 py-4 text-gray-400 text-sm">
                                                {new Date(t.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;