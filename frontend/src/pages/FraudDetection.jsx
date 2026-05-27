import { useState } from 'react';
import API from '../api/axios';
import RiskBadge from '../components/RiskBadge';
import toast from 'react-hot-toast';

const FraudDetection = () => {
    const [form, setForm] = useState({
        amount: '', transaction_type: 0, device_id: 0,
        location: 0, session_duration: 30, authentication_status: 1,
        pin_entry_method: 0, authentication_attempt_count: 1,
        hour_of_day: 12, day_of_week: 1, is_weekend: 0,
        is_night: 0, month: 5
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post('/transactions/analyze', {
                ...form,
                amount: parseFloat(form.amount)
            });
            setResult(res.data.data.mlResult);
            toast.success('Transaction analyzed!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Analysis failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-2 text-blue-400">🔍 Fraud Detection</h1>
                <p className="text-gray-400 mb-8">Enter transaction details to analyze fraud risk</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
                        <div>
                            <label className="text-gray-300 text-sm mb-1 block">Transaction Amount (₹)</label>
                            <input
                                type="number"
                                placeholder="e.g. 5000"
                                value={form.amount}
                                onChange={e => setForm({...form, amount: e.target.value})}
                                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-gray-300 text-sm mb-1 block">Hour of Day</label>
                                <input type="number" min="0" max="23"
                                    value={form.hour_of_day}
                                    onChange={e => setForm({...form, hour_of_day: parseInt(e.target.value)})}
                                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-gray-300 text-sm mb-1 block">Auth Attempts</label>
                                <input type="number" min="1" max="10"
                                    value={form.authentication_attempt_count}
                                    onChange={e => setForm({...form, authentication_attempt_count: parseInt(e.target.value)})}
                                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-gray-300 text-sm mb-1 block">Is Night?</label>
                                <select value={form.is_night}
                                    onChange={e => setForm({...form, is_night: parseInt(e.target.value)})}
                                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500">
                                    <option value={0}>No</option>
                                    <option value={1}>Yes</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-gray-300 text-sm mb-1 block">Is Weekend?</label>
                                <select value={form.is_weekend}
                                    onChange={e => setForm({...form, is_weekend: parseInt(e.target.value)})}
                                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500">
                                    <option value={0}>No</option>
                                    <option value={1}>Yes</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-gray-300 text-sm mb-1 block">Session Duration (seconds)</label>
                            <input type="number"
                                value={form.session_duration}
                                onChange={e => setForm({...form, session_duration: parseFloat(e.target.value)})}
                                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                        >
                            {loading ? '🔄 Analyzing...' : '🔍 Analyze Transaction'}
                        </button>
                    </form>

                    {result && (
                        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                            <h2 className="text-xl font-bold mb-6">Analysis Result</h2>
                            <div className={`rounded-xl p-6 mb-6 text-center ${result.is_fraud ? 'bg-red-900 border border-red-700' : 'bg-green-900 border border-green-700'}`}>
                                <div className="text-5xl mb-3">{result.is_fraud ? '🚨' : '✅'}</div>
                                <div className="text-2xl font-bold">
                                    {result.is_fraud ? 'FRAUD DETECTED' : 'TRANSACTION SAFE'}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-gray-800 rounded-xl p-4 text-center">
                                    <div className="text-2xl font-bold text-blue-400">{result.risk_score}</div>
                                    <div className="text-gray-400 text-sm">Risk Score</div>
                                </div>
                                <div className="bg-gray-800 rounded-xl p-4 text-center">
                                    <div className="text-2xl font-bold text-yellow-400">
                                        {(result.fraud_probability * 100).toFixed(1)}%
                                    </div>
                                    <div className="text-gray-400 text-sm">Probability</div>
                                </div>
                                <div className="bg-gray-800 rounded-xl p-4 text-center">
                                    <RiskBadge tier={result.risk_tier} />
                                    <div className="text-gray-400 text-sm mt-1">Risk Tier</div>
                                </div>
                            </div>
                            {result.is_fraud && (
                                <div>
                                    <h3 className="font-semibold mb-3 text-red-400">⚠️ Recovery Steps:</h3>
                                    <ul className="space-y-2">
                                        {result.recommendations.map((r, i) => (
                                            <li key={i} className="flex gap-2 text-sm text-gray-300">
                                                <span className="text-red-400 font-bold">{i+1}.</span> {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FraudDetection;