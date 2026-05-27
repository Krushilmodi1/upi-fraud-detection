import { useState, useEffect } from 'react';
import API from '../api/axios';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [modelStats, setModelStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, txRes, statsRes] = await Promise.all([
                    API.get('/admin/users'),
                    API.get('/admin/transactions'),
                    API.get('/admin/model-stats')
                ]);
                setUsers(usersRes.data.data);
                setTransactions(txRes.data.data);
                setModelStats(statsRes.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
            Loading admin data...
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-2 text-red-400">🔧 Admin Dashboard</h1>
                <p className="text-gray-400 mb-8">System overview and management</p>

                {modelStats && (
                    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-8">
                        <h2 className="text-xl font-bold mb-4">🤖 ML Model Performance</h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                                { label: 'Model', value: modelStats.model },
                                { label: 'Accuracy', value: `${modelStats.accuracy}%` },
                                { label: 'Precision', value: `${modelStats.precision}%` },
                                { label: 'Recall', value: `${modelStats.recall}%` },
                                { label: 'ROC-AUC', value: modelStats.rocAuc }
                            ].map((s, i) => (
                                <div key={i} className="bg-gray-800 rounded-xl p-4 text-center">
                                    <div className="text-xl font-bold text-blue-400">{s.value}</div>
                                    <div className="text-gray-400 text-sm mt-1">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                        <h2 className="text-xl font-bold mb-4 p-2">👥 Users ({users.length})</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-800">
                                    <tr>
                                        {['Name', 'Email', 'Role'].map(h => (
                                            <th key={h} className="px-4 py-2 text-left text-gray-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u, i) => (
                                        <tr key={i} className="border-t border-gray-800">
                                            <td className="px-4 py-3">{u.name}</td>
                                            <td className="px-4 py-3 text-gray-400">{u.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-red-900 text-red-300' : 'bg-blue-900 text-blue-300'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                        <h2 className="text-xl font-bold mb-4 p-2">💳 Transactions ({transactions.length})</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-800">
                                    <tr>
                                        {['Amount', 'Status', 'Risk'].map(h => (
                                            <th key={h} className="px-4 py-2 text-left text-gray-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((t, i) => (
                                        <tr key={i} className="border-t border-gray-800">
                                            <td className="px-4 py-3">₹{t.amount?.toLocaleString()}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs ${t.isFraud ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                                                    {t.isFraud ? 'Fraud' : 'Safe'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">{t.riskTier}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;