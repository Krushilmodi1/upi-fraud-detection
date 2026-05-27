import { useState, useEffect } from 'react';
import API from '../api/axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
         Tooltip, LineChart, Line, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b'];

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await API.get('/analytics/dashboard');
                setData(res.data.data);
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
            Loading analytics...
        </div>
    );

    if (!data) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
            No data available yet. Analyze some transactions first.
        </div>
    );

    const pieData = [
        { name: 'Safe', value: data.summary.safeCount },
        { name: 'Fraud', value: data.summary.fraudCount }
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-2 text-blue-400">📊 Fraud Analytics</h1>
                <p className="text-gray-400 mb-8">Real-time fraud analysis dashboard</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Total', value: data.summary.total, color: 'text-blue-400' },
                        { label: 'Fraud', value: data.summary.fraudCount, color: 'text-red-400' },
                        { label: 'Fraud %', value: `${data.summary.fraudPercent}%`, color: 'text-yellow-400' },
                        { label: 'Fraud Amount', value: `₹${data.summary.totalFraudAmount.toLocaleString()}`, color: 'text-red-400' }
                    ].map((s, i) => (
                        <div key={i} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center">
                            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                            <div className="text-gray-400 mt-1 text-sm">{s.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                        <h3 className="text-lg font-semibold mb-4">Fraud vs Safe</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name"
                                     cx="50%" cy="50%" outerRadius={90} label>
                                    {pieData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                        <h3 className="text-lg font-semibold mb-4">Risk Tier Distribution</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={data.byRiskTier}>
                                <XAxis dataKey="_id" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {data.trend.length > 0 && (
                    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                        <h3 className="text-lg font-semibold mb-4">Fraud Trend Over Time</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={data.trend}>
                                <XAxis dataKey="_id" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total" />
                                <Line type="monotone" dataKey="fraud" stroke="#ef4444" name="Fraud" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;