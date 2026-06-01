import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    AreaChart, Area, PieChart, Pie, Cell,
    ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

const Dashboard = () => {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        API.get('/transactions/my')
            .then(res => setTransactions(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const fraudCount = transactions.filter(t => t.isFraud).length;
    const safeCount = transactions.length - fraudCount;
    const fraudAmount = transactions.filter(t => t.isFraud).reduce((s, t) => s + t.amount, 0);
    const avgRisk = transactions.length > 0
        ? Math.round(transactions.reduce((s, t) => s + t.riskScore, 0) / transactions.length) : 0;
    const secScore = transactions.length === 0 ? 100
        : Math.max(0, Math.round(100 - (fraudCount / transactions.length) * 100));

    const pieData = [
        { name: 'Safe', value: safeCount || 1 },
        { name: 'Fraud', value: fraudCount }
    ];

    const trendData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        const day = transactions.filter(t => new Date(t.createdAt).toDateString() === d.toDateString());
        return {
            day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
            safe: day.filter(t => !t.isFraud).length,
            fraud: day.filter(t => t.isFraud).length
        };
    });

    const filtered = activeTab === 'fraud' ? transactions.filter(t => t.isFraud)
        : activeTab === 'safe' ? transactions.filter(t => !t.isFraud)
            : transactions;

    const c = {
        page: { minHeight: '100vh', background: 'var(--bg-secondary)', padding: '24px' },
        card: {
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,.08)',
            transition: 'all .3s ease'
        },
        label: { fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
        val: (color = 'var(--text-primary)') => ({ fontSize: '32px', fontWeight: 800, color, lineHeight: 1 }),
        sub: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' },
        badge: (fraud) => ({
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
            background: fraud ? 'var(--danger-light)' : 'var(--success-light)',
            color: fraud ? 'var(--danger)' : 'var(--success)',
            border: `1px solid ${fraud ? 'var(--danger)' : 'var(--success)'}44`
        }),
        tierBadge: (tier) => {
            const cfg = { High: ['var(--danger-light)', 'var(--danger)'], Medium: ['var(--warning-light)', 'var(--warning)'], Low: ['var(--success-light)', 'var(--success)'] };
            return { padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: cfg[tier]?.[0], color: cfg[tier]?.[1] };
        },
        tabBtn: (active, color = 'var(--accent)') => ({
            padding: '7px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, transition: 'all 0.15s',
            background: active ? color : 'transparent',
            color: active ? 'white' : 'var(--text-muted)'
        }),
        quickAction: {
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '14px', padding: '18px', textDecoration: 'none',
            display: 'flex', flexDirection: 'column', gap: '8px',
            transition: 'all 0.15s', boxShadow: 'var(--shadow)',
            cursor: 'pointer'
        }
    };

    if (loading) return (
        <div style={{ ...c.page, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTop: `3px solid var(--accent)`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading your dashboard...</span>
        </div>
    );

    return (
        <div style={c.page}>
            <style>{`
                .qa:hover { border-color: var(--accent) !important; transform: translateY(-2px); box-shadow: var(--shadow-md) !important; }
                .tx-row:hover { background: var(--bg-hover) !important; }
                @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
                .fade { animation: fadeUp 0.3s ease forwards; }
            `}</style>

            <div className="fade" style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header */}
                <div
                    style={{
                        background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                        borderRadius: '24px',
                        padding: '32px',
                        color: 'white',
                        marginBottom: '24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: 800, margin: 0 }}>
                            🛡️ Security Center
                        </h1>

                        <p style={{ marginTop: '8px', opacity: .9 }}>
                            Welcome back, {user?.name}
                        </p>

                        <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
                            <div>
                                <div style={{ fontSize: '28px', fontWeight: 800 }}>
                                    {secScore}
                                </div>
                                <small>Security Score</small>
                            </div>

                            <div>
                                <div style={{ fontSize: '28px', fontWeight: 800 }}>
                                    {transactions.length}
                                </div>
                                <small>Transactions</small>
                            </div>

                            <div>
                                <div style={{ fontSize: '28px', fontWeight: 800 }}>
                                    {fraudCount}
                                </div>
                                <small>Threats Found</small>
                            </div>
                        </div>
                    </div>

                    <div style={{ fontSize: '90px' }}>
                        🛡️
                    </div>
                </div>

                {/* Fraud Alert */}
                {fraudCount > 0 && (
                    <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '22px' }}>🚨</span>
                            <div>
                                <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '14px' }}>{fraudCount} Fraudulent Transaction{fraudCount > 1 ? 's' : ''} Detected</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Take action immediately to protect your account</div>
                            </div>
                        </div>
                        <Link to="/assistance" style={{ background: 'var(--danger)', color: 'white', padding: '8px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                            Get Help →
                        </Link>
                    </div>
                )}

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    {[
                        { label: 'Total Analyzed', value: transactions.length, color: 'var(--accent)', sub: 'transactions', icon: '💳' },
                        { label: 'Fraud Detected', value: fraudCount, color: 'var(--danger)', sub: `₹${fraudAmount.toLocaleString('en-IN')} at risk`, icon: '🚨' },
                        { label: 'Safe Transactions', value: safeCount, color: 'var(--success)', sub: 'verified clean', icon: '✅' },
                        { label: 'Security Score', value: `${secScore}/100`, color: secScore >= 80 ? 'var(--success)' : secScore >= 50 ? 'var(--warning)' : 'var(--danger)', sub: secScore >= 80 ? 'Excellent' : secScore >= 50 ? 'Fair' : 'At Risk', icon: '🛡️' }
                    ].map((s, i) => (
                        <div key={i} style={c.card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={c.label}>{s.label}</div>
                                    <div style={c.val(s.color)}>{s.value}</div>
                                    <div style={c.sub}>{s.sub}</div>
                                </div>
                                <span style={{ fontSize: '28px', opacity: 0.7 }}>{s.icon}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div style={c.card}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                            📈 7-Day Transaction Activity
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="safeGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="fraudGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)' }} />
                                <Area type="monotone" dataKey="safe" stroke="#22c55e" fill="url(#safeGrad)" strokeWidth={2} name="Safe" />
                                <Area type="monotone" dataKey="fraud" stroke="#ef4444" fill="url(#fraudGrad)" strokeWidth={2} name="Fraud" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{
                        ...c.card,
                        marginBottom: '20px'
                    }}>
                        <h3 style={{
                            marginTop: 0,
                            color: 'var(--text-primary)'
                        }}>
                            🤖 AI Security Assistant
                        </h3>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3,1fr)',
                            gap: '15px'
                        }}>
                            <div>
                                ✅ No suspicious UPI IDs detected
                            </div>

                            <div>
                                🛡️ Security Score: {secScore}/100
                            </div>

                            <div>
                                ⚠️ Avoid sending money to unknown users
                            </div>
                        </div>
                    </div>
                    <div style={c.card}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                            🥧 Fraud vs Safe
                        </div>
                        <ResponsiveContainer width="100%" height={140}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" paddingAngle={3}>
                                    <Cell fill="#22c55e" />
                                    <Cell fill="#ef4444" />
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '4px' }}>
                            {[['#22c55e', 'Safe', safeCount], ['#ef4444', 'Fraud', fraudCount]].map(([col, label, val]) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: col }} />
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}: <strong style={{ color: 'var(--text-primary)' }}>{val}</strong></span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{
                    display: 'grid', gridTemplateColumns:
                        'repeat(auto-fit,minmax(220px,1fr))', gap: '12px', marginBottom: '20px'
                }}>
                    {[
                        { icon: '🔍', label: 'Detect Fraud', desc: 'Analyze transaction', to: '/detect' },
                        { icon: '🔎', label: 'UPI Scanner', desc: 'Check UPI ID', to: '/upi-scanner' },
                        { icon: '🆘', label: 'Dispute Help', desc: 'Money issues', to: '/dispute' },
                        { icon: '📋', label: 'My Complaints', desc: 'Track issues', to: '/complaints' },
                        { icon: '📞', label: 'Assistance', desc: 'Recovery steps', to: '/assistance' },
                    ].map((a, i) => (
                        <Link key={i} to={a.to} style={{ textDecoration: 'none' }}>
                            <div className="qa" style={c.quickAction}>
                                <span style={{ fontSize: '26px' }}>{a.icon}</span>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{a.label}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{a.desc}</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                <div
                    style={{
                        background: '#fee2e2',
                        border: '2px solid #ef4444',
                        borderRadius: '18px',
                        padding: '20px',
                        marginBottom: '20px'
                    }}
                >
                    <h3 style={{
                        margin: '0 0 10px',
                        color: '#dc2626'
                    }}>
                        🚨 Emergency Fraud Help
                    </h3>

                    <p>
                        Lost money due to fraud?
                        Immediately contact cybercrime helpline.
                    </p>

                    <div style={{
                        display: 'flex',
                        gap: '12px'
                    }}>
                        <a
                            href="tel:1930"
                            style={{
                                background: '#ef4444',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '10px',
                                textDecoration: 'none'
                            }}
                        >
                            📞 Call 1930
                        </a>

                        <Link
                            to="/assistance"
                            style={{
                                background: '#2563eb',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '10px',
                                textDecoration: 'none'
                            }}
                        >
                            Get Help
                        </Link>
                    </div>
                </div>
                <div style={{
                    ...c.card,
                    marginBottom: '20px'
                }}>
                    <h3>📊 Security Insights</h3>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '15px'
                    }}>
                        <div>
                            🔴 Fraud Cases: {fraudCount}
                        </div>

                        <div>
                            🟢 Safe Transactions: {safeCount}
                        </div>

                        <div>
                            💰 Amount At Risk:
                            ₹{fraudAmount.toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>
                {/* Transaction History */}
                <div style={c.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                            📋 Transaction History
                        </h2>
                        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '24px' }}>
                            {[
                                { id: 'all', label: `All (${transactions.length})` },
                                { id: 'fraud', label: `🚨 Fraud (${fraudCount})` },
                                { id: 'safe', label: `✅ Safe (${safeCount})` }
                            ].map(t => (
                                <button key={t.id} onClick={() => setActiveTab(t.id)}
                                    style={c.tabBtn(activeTab === t.id, t.id === 'fraud' ? 'var(--danger)' : t.id === 'safe' ? 'var(--success)' : 'var(--accent)')}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                            <div style={{ fontSize: '14px', marginBottom: '8px' }}>No transactions yet</div>
                            <Link to="/detect" style={{ color: 'var(--accent)', fontSize: '13px', textDecoration: 'none' }}>
                                Analyze your first transaction →
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {filtered.map((t, i) => (
                                <div key={i}>
                                    <div className="tx-row"
                                        onClick={() => setExpanded(expanded === i ? null : i)}
                                        style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                                            background: 'var(--bg-secondary)', transition: 'all 0.15s',
                                            borderLeft: `4px solid ${t.isFraud ? 'var(--danger)' : 'var(--success)'}`
                                        }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: t.isFraud ? 'var(--danger-light)' : 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                                                {t.isFraud ? '🚨' : '✅'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                                                    ₹{t.amount.toLocaleString('en-IN')}
                                                </div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                    {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={c.badge(t.isFraud)}>{t.isFraud ? '🚨 Fraud' : '✅ Safe'}</span>
                                            <span style={c.tierBadge(t.riskTier)}>{t.riskTier} Risk</span>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '18px', fontWeight: 800, color: t.riskScore >= 70 ? 'var(--danger)' : t.riskScore >= 30 ? 'var(--warning)' : 'var(--success)' }}>
                                                    {t.riskScore}
                                                </div>
                                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>risk</div>
                                            </div>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>{expanded === i ? '▲' : '▼'}</span>
                                        </div>
                                    </div>

                                    {expanded === i && (
                                        <div style={{ background: 'var(--bg-secondary)', borderRadius: '0 0 12px 12px', padding: '14px 16px', marginTop: '-4px', borderLeft: `4px solid ${t.isFraud ? 'var(--danger)' : 'var(--success)'}` }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: t.isFraud ? '12px' : '0' }}>
                                                {[
                                                    { label: 'Fraud Probability', value: `${(t.fraudProbability * 100).toFixed(1)}%` },
                                                    { label: 'Risk Score', value: `${t.riskScore}/100` },
                                                    { label: 'Risk Tier', value: t.riskTier }
                                                ].map((d, j) => (
                                                    <div key={j} style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{d.label}</div>
                                                        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{d.value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            {t.isFraud && t.recommendations?.length > 0 && (
                                                <div style={{ background: 'var(--danger-light)', borderRadius: '10px', padding: '12px', border: '1px solid var(--danger)44' }}>
                                                    <div style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>⚠️ Recommended Actions:</div>
                                                    {t.recommendations.slice(0, 3).map((r, j) => (
                                                        <div key={j} style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>• {r}</div>
                                                    ))}
                                                    <Link to="/assistance" style={{ color: 'var(--accent)', fontSize: '12px', textDecoration: 'none' }}>View all steps →</Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Safety tip */}
                <div style={{ ...c.card, marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--accent-light)', border: '1px solid var(--accent)44' }}>
                    <span style={{ fontSize: '20px' }}>💡</span>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Safety Tip:</strong> Always verify the receiver name shown in your UPI app before confirming payment. Send ₹1 first to unknown UPI IDs.
                        <Link to="/assistance" style={{ color: 'var(--accent)', marginLeft: '6px', textDecoration: 'none' }}>Learn more →</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;