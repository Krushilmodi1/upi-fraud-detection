import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const AnimatedNumber = ({ value, duration = 1000 }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = value / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= value) { setDisplay(value); clearInterval(timer); }
            else setDisplay(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [value]);
    return <span>{display}</span>;
};

const RiskMeter = ({ score }) => {
    const color = score >= 70 ? '#ef4444' : score >= 30 ? '#f59e0b' : '#22c55e';
    const rotation = -90 + (score / 100) * 180;
    return (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <svg width="160" height="90" viewBox="0 0 160 90">
                <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="#1f2937" strokeWidth="12" strokeLinecap="round" />
                <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={`${(score / 100) * 220} 220`} />
                <g transform={`rotate(${rotation}, 80, 80)`}>
                    <line x1="80" y1="80" x2="80" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="80" cy="80" r="5" fill="white" />
                </g>
                <text x="80" y="75" textAnchor="middle" fill={color} fontSize="22" fontWeight="bold">{score}</text>
            </svg>
            <div style={{ color: color, fontWeight: 600, fontSize: '14px', marginTop: '-10px' }}>
                {score >= 70 ? '🔴 High Risk' : score >= 30 ? '🟡 Medium Risk' : '🟢 Low Risk'}
            </div>
        </div>
    );
};

const SecurityScore = ({ transactions }) => {
    const fraud = transactions.filter(t => t.isFraud).length;
    const total = transactions.length;
    const score = total === 0 ? 100 : Math.max(0, Math.round(100 - (fraud / total) * 100));
    const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
    const label = score >= 80 ? 'Excellent' : score >= 50 ? 'Fair' : 'At Risk';
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto' }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#1f2937" strokeWidth="10" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="10"
                        strokeDasharray={`${(score / 100) * 314} 314`}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)" />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color }}>{score}</div>
                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>/ 100</div>
                </div>
            </div>
            <div style={{ color, fontWeight: 600, marginTop: '8px', fontSize: '14px' }}>{label}</div>
            <div style={{ color: '#9ca3af', fontSize: '12px' }}>Security Score</div>
        </div>
    );
};

const MiniBarChart = ({ transactions }) => {
    if (transactions.length === 0) return <div style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No data yet</div>;
    const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toLocaleDateString('en-IN', { weekday: 'short' });
        const dayTx = transactions.filter(t => new Date(t.createdAt).toDateString() === d.toDateString());
        return { label: dateStr, total: dayTx.length, fraud: dayTx.filter(t => t.isFraud).length };
    });
    const max = Math.max(...last7.map(d => d.total), 1);
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px', padding: '0 4px' }}>
            {last7.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '60px', gap: '2px' }}>
                        {d.fraud > 0 && <div style={{ width: '100%', height: `${(d.fraud / max) * 60}px`, background: '#ef4444', borderRadius: '3px 3px 0 0' }} />}
                        {d.total - d.fraud > 0 && <div style={{ width: '100%', height: `${((d.total - d.fraud) / max) * 60}px`, background: '#3b82f6', borderRadius: d.fraud === 0 ? '3px 3px 0 0' : '0' }} />}
                    </div>
                    <div style={{ fontSize: '10px', color: '#6b7280' }}>{d.label}</div>
                </div>
            ))}
        </div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        API.get('/transactions/my').then(res => {
            setTransactions(res.data.data);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const fraudCount = transactions.filter(t => t.isFraud).length;
    const safeCount = transactions.length - fraudCount;
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const fraudAmount = transactions.filter(t => t.isFraud).reduce((sum, t) => sum + t.amount, 0);
    const avgRiskScore = transactions.length > 0
        ? Math.round(transactions.reduce((sum, t) => sum + t.riskScore, 0) / transactions.length) : 0;

    const filtered = activeTab === 'fraud' ? transactions.filter(t => t.isFraud)
        : activeTab === 'safe' ? transactions.filter(t => !t.isFraud)
        : transactions;

    const tierBadge = (tier) => {
        const styles = {
            High: { background: '#7f1d1d', color: '#fca5a5', border: '1px solid #dc2626' },
            Medium: { background: '#78350f', color: '#fcd34d', border: '1px solid #d97706' },
            Low: { background: '#14532d', color: '#86efac', border: '1px solid #16a34a' }
        };
        return <span style={{ ...styles[tier], padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>{tier}</span>;
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', border: '3px solid #1f2937', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ color: '#6b7280' }}>Loading your dashboard...</div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#030712', color: 'white', padding: '24px' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in { animation: fadeIn 0.4s ease forwards; }
                .card { background: #0d1117; border: 1px solid #1f2937; border-radius: 16px; padding: 20px; }
                .hover-card:hover { border-color: #3b82f6; transform: translateY(-2px); transition: all 0.2s; cursor: pointer; }
                .tab-btn { padding: 6px 16px; border-radius: 20px; border: none; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; }
                .stat-card { background: #0d1117; border: 1px solid #1f2937; border-radius: 16px; padding: 20px; }
            `}</style>

            <div className="fade-in">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700 }}>
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Welcome back, {user?.name} 👋</h1>
                                <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Here's your fraud protection overview</p>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Link to="/detect" style={{ background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            🔍 Analyze Transaction
                        </Link>
                        <Link to="/upi-scanner" style={{ background: '#1f2937', color: 'white', padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
                            🔎 UPI Scanner
                        </Link>
                    </div>
                </div>

                {/* Alert Banner - show if fraud detected */}
                {fraudCount > 0 && (
                    <div style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: '12px', padding: '14px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '24px' }}>🚨</span>
                            <div>
                                <div style={{ fontWeight: 600, color: '#fca5a5' }}>{fraudCount} Fraudulent Transaction{fraudCount > 1 ? 's' : ''} Detected</div>
                                <div style={{ fontSize: '13px', color: '#f87171' }}>Review your recent transactions and take action immediately</div>
                            </div>
                        </div>
                        <Link to="/assistance" style={{ background: '#dc2626', color: 'white', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                            Get Help →
                        </Link>
                    </div>
                )}

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    {[
                        { icon: '💳', label: 'Total Analyzed', value: transactions.length, sub: 'transactions', color: '#3b82f6' },
                        { icon: '🚨', label: 'Fraud Detected', value: fraudCount, sub: `₹${fraudAmount.toLocaleString('en-IN')} at risk`, color: '#ef4444' },
                        { icon: '✅', label: 'Safe Transactions', value: safeCount, sub: 'verified clean', color: '#22c55e' },
                        { icon: '📊', label: 'Avg Risk Score', value: avgRiskScore, sub: 'out of 100', color: avgRiskScore >= 70 ? '#ef4444' : avgRiskScore >= 30 ? '#f59e0b' : '#22c55e' }
                    ].map((s, i) => (
                        <div key={i} className="stat-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>{s.label}</div>
                                    <div style={{ fontSize: '32px', fontWeight: 700, color: s.color, lineHeight: 1 }}>
                                        <AnimatedNumber value={s.value} />
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px' }}>{s.sub}</div>
                                </div>
                                <div style={{ fontSize: '28px' }}>{s.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Middle Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    {/* Security Score */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px', fontWeight: 500 }}>🛡️ Your Security Score</div>
                        <SecurityScore transactions={transactions} />
                        <div style={{ marginTop: '12px', fontSize: '12px', color: '#4b5563', textAlign: 'center' }}>
                            Based on your transaction history
                        </div>
                    </div>

                    {/* Average Risk Meter */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px', fontWeight: 500 }}>⚡ Average Risk Meter</div>
                        <RiskMeter score={avgRiskScore} />
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#4b5563', textAlign: 'center' }}>
                            Across all your transactions
                        </div>
                    </div>

                    {/* 7 day activity */}
                    <div className="card">
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px', fontWeight: 500 }}>📅 Last 7 Days Activity</div>
                        <MiniBarChart transactions={transactions} />
                        <div style={{ display: 'flex', gap: '12px', marginTop: '10px', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#6b7280' }}>
                                <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '2px' }} /> Safe
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#6b7280' }}>
                                <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '2px' }} /> Fraud
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {[
                        { icon: '🔍', label: 'Detect Fraud', desc: 'Analyze a transaction', link: '/detect', color: '#1d4ed8' },
                        { icon: '🔎', label: 'UPI Scanner', desc: 'Check UPI ID safety', link: '/upi-scanner', color: '#7c3aed' },
                        { icon: '🆘', label: 'Dispute Help', desc: 'Money not received?', link: '/dispute', color: '#b45309' },
                        { icon: '📞', label: 'Assistance', desc: 'Recovery steps', link: '/assistance', color: '#065f46' }
                    ].map((a, i) => (
                        <Link key={i} to={a.link} style={{ textDecoration: 'none' }}>
                            <div className="hover-card" style={{ background: '#0d1117', border: '1px solid #1f2937', borderRadius: '12px', padding: '16px', transition: 'all 0.2s' }}>
                                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{a.icon}</div>
                                <div style={{ fontWeight: 600, fontSize: '14px', color: 'white', marginBottom: '2px' }}>{a.label}</div>
                                <div style={{ fontSize: '12px', color: '#6b7280' }}>{a.desc}</div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Transaction History */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>📋 Transaction History</h2>
                        <div style={{ display: 'flex', gap: '6px', background: '#111827', padding: '4px', borderRadius: '24px' }}>
                            {['all', 'fraud', 'safe'].map(tab => (
                                <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)}
                                    style={{
                                        background: activeTab === tab ? (tab === 'fraud' ? '#dc2626' : tab === 'safe' ? '#16a34a' : '#2563eb') : 'transparent',
                                        color: activeTab === tab ? 'white' : '#6b7280'
                                    }}>
                                    {tab === 'all' ? `All (${transactions.length})` : tab === 'fraud' ? `🚨 Fraud (${fraudCount})` : `✅ Safe (${safeCount})`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                            <div>No transactions yet.</div>
                            <Link to="/detect" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '14px' }}>
                                Analyze your first transaction →
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {filtered.map((t, i) => (
                                <div key={i}
                                    onClick={() => setSelected(selected?._id === t._id ? null : t)}
                                    style={{
                                        background: '#111827', border: `1px solid ${t.isFraud ? '#7f1d1d' : '#1f2937'}`,
                                        borderRadius: '12px', padding: '14px 18px', cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        borderLeft: `4px solid ${t.isFraud ? '#dc2626' : '#16a34a'}`
                                    }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '10px',
                                                background: t.isFraud ? '#450a0a' : '#052e16',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                                            }}>
                                                {t.isFraud ? '🚨' : '✅'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '15px' }}>₹{t.amount.toLocaleString('en-IN')}</div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                    {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {tierBadge(t.riskTier)}
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '18px', fontWeight: 700, color: t.riskScore >= 70 ? '#ef4444' : t.riskScore >= 30 ? '#f59e0b' : '#22c55e' }}>
                                                    {t.riskScore}
                                                </div>
                                                <div style={{ fontSize: '10px', color: '#4b5563' }}>risk score</div>
                                            </div>
                                            <div style={{ color: '#4b5563', fontSize: '18px' }}>
                                                {selected?._id === t._id ? '▲' : '▼'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded details */}
                                    {selected?._id === t._id && (
                                        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #1f2937' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
                                                {[
                                                    { label: 'Fraud Probability', value: `${(t.fraudProbability * 100).toFixed(1)}%` },
                                                    { label: 'Risk Score', value: `${t.riskScore}/100` },
                                                    { label: 'Risk Tier', value: t.riskTier }
                                                ].map((d, j) => (
                                                    <div key={j} style={{ background: '#0d1117', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                                                        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>{d.label}</div>
                                                        <div style={{ fontWeight: 600, fontSize: '15px' }}>{d.value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            {t.isFraud && t.recommendations?.length > 0 && (
                                                <div style={{ background: '#450a0a', borderRadius: '10px', padding: '12px' }}>
                                                    <div style={{ color: '#fca5a5', fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>⚠️ Recommended Actions:</div>
                                                    {t.recommendations.slice(0, 3).map((r, j) => (
                                                        <div key={j} style={{ color: '#f87171', fontSize: '12px', marginBottom: '4px' }}>• {r}</div>
                                                    ))}
                                                    <Link to="/assistance" style={{ color: '#3b82f6', fontSize: '12px', textDecoration: 'none' }}>
                                                        View all recovery steps →
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer tip */}
                <div style={{ marginTop: '20px', background: '#0d1117', border: '1px solid #1f2937', borderRadius: '12px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>💡</span>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        <strong style={{ color: '#9ca3af' }}>Safety Tip:</strong> Always verify the receiver name shown in your UPI app before confirming any payment. Send ₹1 first to unknown UPI IDs.
                        <Link to="/assistance" style={{ color: '#3b82f6', marginLeft: '8px', textDecoration: 'none' }}>Learn more →</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;