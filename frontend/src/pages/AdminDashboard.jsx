import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
    pending: { bg: '#422006', color: '#fb923c', dot: '#f97316', label: 'Pending' },
    reviewing: { bg: '#172554', color: '#60a5fa', dot: '#3b82f6', label: 'Reviewing' },
    resolved: { bg: '#052e16', color: '#4ade80', dot: '#22c55e', label: 'Resolved' },
    rejected: { bg: '#450a0a', color: '#f87171', dot: '#ef4444', label: 'Rejected' }
};

const priorityConfig = {
    high: { color: '#ef4444', bg: '#450a0a', label: '🔴 HIGH' },
    medium: { color: '#f59e0b', bg: '#422006', label: '🟡 MEDIUM' },
    low: { color: '#22c55e', bg: '#052e16', label: '🟢 LOW' }
};

const LiveDot = ({ color }) => (
    <span style={{
        display: 'inline-block', width: '8px', height: '8px',
        borderRadius: '50%', background: color, marginRight: '6px',
        boxShadow: `0 0 6px ${color}`
    }} />
);

const StatCard = ({ icon, label, value, sub, color, trend }) => (
    <div style={{
        background: '#0a0f1a', border: `1px solid ${color}33`,
        borderRadius: '14px', padding: '18px 20px',
        borderTop: `3px solid ${color}`
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                <div style={{ fontSize: '36px', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                {sub && <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '6px' }}>{sub}</div>}
            </div>
            <div style={{ fontSize: '32px', opacity: 0.8 }}>{icon}</div>
        </div>
        {trend !== undefined && (
            <div style={{ marginTop: '12px', height: '4px', background: '#1f2937', borderRadius: '4px' }}>
                <div style={{ height: '100%', width: `${Math.min(trend, 100)}%`, background: color, borderRadius: '4px', transition: 'width 1s ease' }} />
            </div>
        )}
    </div>
);

const AdminDashboard = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState('overview');
    const [complaints, setComplaints] = useState([]);
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replyStatus, setReplyStatus] = useState('resolved');
    const [replying, setReplying] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchUser, setSearchUser] = useState('');
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        fetchAll();
        const clock = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(clock);
    }, []);

    const fetchAll = async () => {
        try {
            const [cRes, uRes, tRes] = await Promise.all([
                API.get('/complaints/all'),
                API.get('/admin/users'),
                API.get('/admin/transactions')
            ]);
            setComplaints(cRes.data.data);
            setUsers(uRes.data.data);
            setTransactions(tRes.data.data);
        } catch (err) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (id) => {
        if (!replyText.trim()) return toast.error('Write a reply first');
        setReplying(true);
        try {
            await API.put(`/complaints/${id}/reply`, { reply: replyText, status: replyStatus });
            toast.success('Reply sent!');
            setReplyText(''); setSelected(null);
            fetchAll();
        } catch { toast.error('Failed to send reply'); }
        finally { setReplying(false); }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await API.put(`/complaints/${id}/status`, { status });
            toast.success('Status updated');
            fetchAll();
        } catch { toast.error('Failed'); }
    };

    const pendingCount = complaints.filter(c => c.status === 'pending').length;
    const highPriority = complaints.filter(c => c.priority === 'high' && c.status === 'pending').length;
    const fraudRate = transactions.length > 0 ? ((transactions.filter(t => t.isFraud).length / transactions.length) * 100).toFixed(1) : 0;
    const filteredComplaints = filterStatus === 'all' ? complaints : complaints.filter(c => c.status === filterStatus);
    const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(searchUser.toLowerCase()) || u.email?.toLowerCase().includes(searchUser.toLowerCase()));

    const s = {
        input: { background: '#0a0f1a', color: 'white', border: '1px solid #1f2937', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
        btn: (bg = '#2563eb', color = 'white') => ({ background: bg, color, border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' })
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', border: '3px solid #1f2937', borderTop: '3px solid #dc2626', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ color: '#6b7280' }}>Loading Admin Control Room...</div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#030712', color: 'white' }}>
            <style>{`
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
                @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
                .fade { animation: fadeIn 0.3s ease forwards; }
                .hover-row:hover { background: #0f1929 !important; }
                .nav-tab { padding: 10px 18px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s; border-bottom: 2px solid transparent; background: transparent; }
                .nav-tab:hover { color: white !important; }
            `}</style>

            {/* Top Bar */}
            <div style={{ background: '#050a14', borderBottom: '1px solid #1f2937', padding: '12px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#dc2626', fontSize: '20px' }}>🔧</span>
                        <span style={{ fontWeight: 800, fontSize: '16px', color: '#f87171' }}>ADMIN CONTROL ROOM</span>
                        <span style={{ background: '#450a0a', color: '#f87171', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>RESTRICTED</span>
                    </div>
                    {pendingCount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#422006', border: '1px solid #d97706', borderRadius: '20px', padding: '4px 12px' }}>
                            <span style={{ animation: 'pulse 1s infinite', fontSize: '10px' }}>🔔</span>
                            <span style={{ color: '#fb923c', fontSize: '12px', fontWeight: 600 }}>{pendingCount} pending complaint{pendingCount > 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#9ca3af', fontSize: '11px' }}>SYSTEM TIME</div>
                        <div style={{ color: '#22c55e', fontSize: '14px', fontWeight: 700, fontFamily: 'monospace' }}>
                            {time.toLocaleTimeString('en-IN')}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#450a0a', border: '2px solid #dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#f87171' }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: 600 }}>{user?.name}</div>
                            <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>ADMINISTRATOR</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div style={{ background: '#050a14', borderBottom: '1px solid #0f172a', padding: '0 28px', display: 'flex', gap: '4px' }}>
                {[
                    { id: 'overview', label: '📊 Overview' },
                    { id: 'complaints', label: `📋 Complaints ${pendingCount > 0 ? `(${pendingCount})` : ''}` },
                    { id: 'users', label: `👥 Users (${users.length})` },
                    { id: 'transactions', label: `💳 Transactions (${transactions.length})` },
                    { id: 'model', label: '🤖 ML Model' }
                ].map(t => (
                    <button key={t.id} className="nav-tab" onClick={() => setTab(t.id)}
                        style={{
                            color: tab === t.id ? '#f87171' : '#6b7280',
                            borderBottom: tab === t.id ? '2px solid #dc2626' : '2px solid transparent'
                        }}>
                        {t.label}
                    </button>
                ))}
            </div>

            <div style={{ padding: '24px 28px' }}>

                {/* OVERVIEW TAB */}
                {tab === 'overview' && (
                    <div className="fade">
                        <div style={{ marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px' }}>System Overview</h2>
                            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Real-time platform monitoring</p>
                        </div>

                        {/* KPI Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                            <StatCard icon="👥" label="Total Users" value={users.length} sub="registered accounts" color="#3b82f6" trend={(users.length / 100) * 100} />
                            <StatCard icon="💳" label="Transactions" value={transactions.length} sub="analyzed by ML" color="#8b5cf6" trend={(transactions.length / 200) * 100} />
                            <StatCard icon="🚨" label="Fraud Detected" value={transactions.filter(t => t.isFraud).length} sub={`${fraudRate}% fraud rate`} color="#ef4444" trend={parseFloat(fraudRate)} />
                            <StatCard icon="📋" label="Open Complaints" value={pendingCount} sub={`${highPriority} high priority`} color="#f59e0b" trend={(pendingCount / Math.max(complaints.length, 1)) * 100} />
                        </div>

                        {/* Alert Row */}
                        {highPriority > 0 && (
                            <div onClick={() => setTab('complaints')} style={{ background: '#450a0a', border: '1px solid #dc2626', borderRadius: '12px', padding: '14px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '24px', animation: 'pulse 1s infinite' }}>🚨</span>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#fca5a5' }}>{highPriority} HIGH PRIORITY complaint{highPriority > 1 ? 's' : ''} need attention</div>
                                        <div style={{ fontSize: '13px', color: '#f87171' }}>Click to view and respond immediately</div>
                                    </div>
                                </div>
                                <span style={{ color: '#f87171', fontSize: '20px' }}>→</span>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {/* Recent Complaints */}
                            <div style={{ background: '#0a0f1a', border: '1px solid #1f2937', borderRadius: '14px', padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>📋 Recent Complaints</h3>
                                    <button onClick={() => setTab('complaints')} style={s.btn('#1f2937')}>View all</button>
                                </div>
                                {complaints.slice(0, 5).map((c, i) => (
                                    <div key={i} className="hover-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 8px', borderRadius: '8px', borderBottom: '1px solid #0f172a', cursor: 'pointer' }} onClick={() => { setTab('complaints'); setSelected(c); }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.subject}</div>
                                            <div style={{ fontSize: '11px', color: '#6b7280' }}>{c.userName} • {new Date(c.createdAt).toLocaleDateString('en-IN')}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                                            <LiveDot color={statusConfig[c.status].dot} />
                                            <span style={{ fontSize: '11px', color: statusConfig[c.status].color }}>{statusConfig[c.status].label}</span>
                                        </div>
                                    </div>
                                ))}
                                {complaints.length === 0 && <div style={{ color: '#4b5563', textAlign: 'center', padding: '20px', fontSize: '13px' }}>No complaints yet</div>}
                            </div>

                            {/* Recent Transactions */}
                            <div style={{ background: '#0a0f1a', border: '1px solid #1f2937', borderRadius: '14px', padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>💳 Recent Transactions</h3>
                                    <button onClick={() => setTab('transactions')} style={s.btn('#1f2937')}>View all</button>
                                </div>
                                {transactions.slice(0, 5).map((t, i) => (
                                    <div key={i} className="hover-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 8px', borderRadius: '8px', borderBottom: '1px solid #0f172a' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span>{t.isFraud ? '🚨' : '✅'}</span>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: 500 }}>₹{t.amount?.toLocaleString('en-IN')}</div>
                                                <div style={{ fontSize: '11px', color: '#6b7280' }}>{new Date(t.createdAt).toLocaleDateString('en-IN')}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: t.riskScore >= 70 ? '#ef4444' : t.riskScore >= 30 ? '#f59e0b' : '#22c55e' }}>
                                            {t.riskScore}/100
                                        </div>
                                    </div>
                                ))}
                                {transactions.length === 0 && <div style={{ color: '#4b5563', textAlign: 'center', padding: '20px', fontSize: '13px' }}>No transactions yet</div>}
                            </div>

                            {/* Complaint Status Breakdown */}
                            <div style={{ background: '#0a0f1a', border: '1px solid #1f2937', borderRadius: '14px', padding: '20px' }}>
                                <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 600 }}>📊 Complaint Status Breakdown</h3>
                                {Object.entries(statusConfig).map(([key, cfg]) => {
                                    const count = complaints.filter(c => c.status === key).length;
                                    const pct = complaints.length > 0 ? (count / complaints.length) * 100 : 0;
                                    return (
                                        <div key={key} style={{ marginBottom: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <LiveDot color={cfg.dot} />
                                                    <span style={{ fontSize: '13px', color: cfg.color }}>{cfg.label}</span>
                                                </div>
                                                <span style={{ fontSize: '13px', fontWeight: 600 }}>{count}</span>
                                            </div>
                                            <div style={{ height: '6px', background: '#1f2937', borderRadius: '4px' }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: cfg.dot, borderRadius: '4px', transition: 'width 1s ease' }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* User Stats */}
                            <div style={{ background: '#0a0f1a', border: '1px solid #1f2937', borderRadius: '14px', padding: '20px' }}>
                                <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 600 }}>👥 User Statistics</h3>
                                {[
                                    { label: 'Total Users', value: users.length, color: '#3b82f6' },
                                    { label: 'Admin Accounts', value: users.filter(u => u.role === 'admin').length, color: '#ef4444' },
                                    { label: 'Regular Users', value: users.filter(u => u.role === 'user').length, color: '#22c55e' },
                                    { label: 'Users with Complaints', value: [...new Set(complaints.map(c => c.userEmail))].length, color: '#f59e0b' },
                                    { label: 'Users with Fraud', value: [...new Set(transactions.filter(t => t.isFraud).map(t => t.userId))].length, color: '#ef4444' }
                                ].map((s2, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #0f172a' }}>
                                        <span style={{ color: '#9ca3af', fontSize: '13px' }}>{s2.label}</span>
                                        <span style={{ color: s2.color, fontWeight: 700, fontSize: '16px' }}>{s2.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* COMPLAINTS TAB */}
                {tab === 'complaints' && (
                    <div className="fade">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px' }}>Complaint Management</h2>
                                <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Review, respond and resolve user complaints</p>
                            </div>
                            <button onClick={fetchAll} style={s.btn('#1f2937')}>🔄 Refresh</button>
                        </div>

                        {/* Filter Tabs */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                            {['all', 'pending', 'reviewing', 'resolved', 'rejected'].map(f => (
                                <button key={f} onClick={() => setFilterStatus(f)}
                                    style={{
                                        ...s.btn(filterStatus === f ? (f === 'pending' ? '#422006' : f === 'resolved' ? '#052e16' : f === 'rejected' ? '#450a0a' : '#172554') : '#0a0f1a'),
                                        color: filterStatus === f ? (statusConfig[f]?.color || 'white') : '#6b7280',
                                        border: `1px solid ${filterStatus === f ? (statusConfig[f]?.dot || '#374151') : '#1f2937'}`,
                                        padding: '6px 14px', fontSize: '12px'
                                    }}>
                                    {f === 'all' ? `All (${complaints.length})` : `${statusConfig[f]?.label} (${complaints.filter(c => c.status === f).length})`}
                                </button>
                            ))}
                        </div>

                        {filteredComplaints.length === 0 ? (
                            <div style={{ background: '#0a0f1a', border: '1px solid #1f2937', borderRadius: '14px', padding: '60px', textAlign: 'center' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                                <div style={{ color: '#6b7280' }}>No complaints in this category</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {filteredComplaints.map((c, i) => (
                                    <div key={i} style={{
                                        background: '#0a0f1a',
                                        border: `1px solid ${selected?._id === c._id ? '#2563eb' : priorityConfig[c.priority].color + '44'}`,
                                        borderRadius: '14px', padding: '18px 20px',
                                        borderLeft: `4px solid ${priorityConfig[c.priority].color}`
                                    }}>
                                        {/* Header */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '15px' }}>{c.subject}</span>
                                                    <span style={{ background: statusConfig[c.status].bg, color: statusConfig[c.status].color, padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                                                        <LiveDot color={statusConfig[c.status].dot} />{statusConfig[c.status].label}
                                                    </span>
                                                    <span style={{ background: priorityConfig[c.priority].bg, color: priorityConfig[c.priority].color, padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
                                                        {priorityConfig[c.priority].label}
                                                    </span>
                                                </div>
                                                <div style={{ color: '#6b7280', fontSize: '12px' }}>
                                                    👤 <strong style={{ color: '#9ca3af' }}>{c.userName}</strong> ({c.userEmail}) •
                                                    {c.amount > 0 ? ` ₹${c.amount.toLocaleString('en-IN')} • ` : ' '}
                                                    {c.category.replace('_', ' ').toUpperCase()} •
                                                    {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                                                <select value={c.status} onChange={e => handleStatusChange(c._id, e.target.value)}
                                                    onClick={e => e.stopPropagation()}
                                                    style={{ ...s.input, width: 'auto', padding: '6px 10px', fontSize: '12px' }}>
                                                    <option value="pending">Pending</option>
                                                    <option value="reviewing">Reviewing</option>
                                                    <option value="resolved">Resolved</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                                <button onClick={() => { setSelected(selected?._id === c._id ? null : c); setReplyText(''); }}
                                                    style={s.btn(selected?._id === c._id ? '#374151' : '#1d4ed8')}>
                                                    {selected?._id === c._id ? '✕ Close' : '💬 Reply'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Description preview */}
                                        <div style={{ color: '#9ca3af', fontSize: '13px', lineHeight: 1.6 }}>
                                            {c.description.substring(0, 180)}{c.description.length > 180 ? '...' : ''}
                                        </div>

                                        {/* Expanded Reply Panel */}
                                        {selected?._id === c._id && (
                                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #1f2937' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                                    <div>
                                                        <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase' }}>Full complaint</div>
                                                        <div style={{ background: '#050a14', borderRadius: '10px', padding: '12px', fontSize: '13px', color: '#d1d5db', lineHeight: 1.7, maxHeight: '150px', overflowY: 'auto' }}>
                                                            {c.description}
                                                        </div>
                                                        {c.transactionId && (
                                                            <div style={{ marginTop: '8px', color: '#6b7280', fontSize: '12px' }}>
                                                                Tx ID: <span style={{ color: '#9ca3af', fontFamily: 'monospace' }}>{c.transactionId}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        {c.adminReply && (
                                                            <>
                                                                <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase' }}>Previous reply by {c.repliedBy}</div>
                                                                <div style={{ background: '#0f2942', border: '1px solid #1e3a5f', borderRadius: '10px', padding: '12px', fontSize: '13px', color: '#93c5fd', lineHeight: 1.6 }}>
                                                                    {c.adminReply}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase' }}>Your reply</div>
                                                <textarea
                                                    style={{ ...s.input, minHeight: '90px', resize: 'vertical', marginBottom: '10px' }}
                                                    placeholder="Write your reply to the user..."
                                                    value={replyText}
                                                    onChange={e => setReplyText(e.target.value)}
                                                />
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <select value={replyStatus} onChange={e => setReplyStatus(e.target.value)}
                                                        style={{ ...s.input, width: 'auto' }}>
                                                        <option value="resolved">✅ Mark Resolved</option>
                                                        <option value="reviewing">🔍 Mark Reviewing</option>
                                                        <option value="rejected">❌ Mark Rejected</option>
                                                    </select>
                                                    <button onClick={() => handleReply(c._id)} disabled={replying}
                                                        style={{ ...s.btn('#16a34a'), opacity: replying ? 0.6 : 1 }}>
                                                        {replying ? 'Sending...' : '📤 Send Reply'}
                                                    </button>
                                                    <button onClick={() => setSelected(null)} style={s.btn('#374151')}>Cancel</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* USERS TAB */}
                {tab === 'users' && (
                    <div className="fade">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px' }}>User Management</h2>
                                <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>{users.length} registered accounts</p>
                            </div>
                            <input
                                style={{ ...s.input, width: '260px' }}
                                placeholder="🔍 Search users..."
                                value={searchUser}
                                onChange={e => setSearchUser(e.target.value)}
                            />
                        </div>
                        <div style={{ background: '#0a0f1a', border: '1px solid #1f2937', borderRadius: '14px', overflow: 'hidden' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', padding: '12px 20px', background: '#050a14', borderBottom: '1px solid #1f2937', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <span>User</span><span>Email</span><span>Role</span><span>Complaints</span><span>Joined</span>
                            </div>
                            {filteredUsers.map((u, i) => (
                                <div key={i} className="hover-row" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid #0f172a', alignItems: 'center', transition: 'background 0.15s' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: u.role === 'admin' ? '#450a0a' : '#0f2942', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', color: u.role === 'admin' ? '#f87171' : '#60a5fa', flexShrink: 0 }}>
                                            {u.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span style={{ fontWeight: 500, fontSize: '14px' }}>{u.name}</span>
                                    </div>
                                    <span style={{ color: '#9ca3af', fontSize: '13px' }}>{u.email}</span>
                                    <span style={{ background: u.role === 'admin' ? '#450a0a' : '#0f2942', color: u.role === 'admin' ? '#f87171' : '#60a5fa', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, width: 'fit-content' }}>
                                        {u.role.toUpperCase()}
                                    </span>
                                    <span style={{ color: complaints.filter(c => c.userEmail === u.email).length > 0 ? '#f59e0b' : '#6b7280', fontWeight: 600 }}>
                                        {complaints.filter(c => c.userEmail === u.email).length}
                                    </span>
                                    <span style={{ color: '#6b7280', fontSize: '12px' }}>
                                        {new Date(u.createdAt).toLocaleDateString('en-IN')}
                                    </span>
                                </div>
                            ))}
                            {filteredUsers.length === 0 && (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#4b5563' }}>No users found</div>
                            )}
                        </div>
                    </div>
                )}

                {/* TRANSACTIONS TAB */}
                {tab === 'transactions' && (
                    <div className="fade">
                        <div style={{ marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px' }}>Transaction Monitor</h2>
                            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>All ML-analyzed transactions across the platform</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                            <StatCard icon="💳" label="Total" value={transactions.length} color="#3b82f6" />
                            <StatCard icon="🚨" label="Fraud" value={transactions.filter(t => t.isFraud).length} sub={`${fraudRate}% rate`} color="#ef4444" />
                            <StatCard icon="✅" label="Safe" value={transactions.filter(t => !t.isFraud).length} color="#22c55e" />
                        </div>
                        <div style={{ background: '#0a0f1a', border: '1px solid #1f2937', borderRadius: '14px', overflow: 'hidden' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr', padding: '12px 20px', background: '#050a14', borderBottom: '1px solid #1f2937', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>
                                <span>Amount</span><span>User</span><span>Risk Score</span><span>Status</span><span>Date</span>
                            </div>
                            {transactions.map((t, i) => (
                                <div key={i} className="hover-row" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid #0f172a', alignItems: 'center', borderLeft: `3px solid ${t.isFraud ? '#dc2626' : '#16a34a'}`, transition: 'background 0.15s' }}>
                                    <span style={{ fontWeight: 700, fontSize: '15px' }}>₹{t.amount?.toLocaleString('en-IN')}</span>
                                    <span style={{ color: '#9ca3af', fontSize: '13px' }}>{t.userId?.name || t.userId || 'Unknown'}</span>
                                    <span style={{ fontWeight: 700, fontSize: '16px', color: t.riskScore >= 70 ? '#ef4444' : t.riskScore >= 30 ? '#f59e0b' : '#22c55e' }}>
                                        {t.riskScore}/100
                                    </span>
                                    <span style={{ background: t.isFraud ? '#450a0a' : '#052e16', color: t.isFraud ? '#f87171' : '#4ade80', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, width: 'fit-content' }}>
                                        {t.isFraud ? '🚨 FRAUD' : '✅ SAFE'}
                                    </span>
                                    <span style={{ color: '#6b7280', fontSize: '12px' }}>{new Date(t.createdAt).toLocaleDateString('en-IN')}</span>
                                </div>
                            ))}
                            {transactions.length === 0 && (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#4b5563' }}>No transactions yet</div>
                            )}
                        </div>
                    </div>
                )}

                {/* ML MODEL TAB */}
                {tab === 'model' && (
                    <div className="fade">
                        <div style={{ marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px' }}>ML Model Performance</h2>
                            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>XGBoost classifier — trained on 26,393 transactions</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ background: '#0a0f1a', border: '1px solid #1f2937', borderRadius: '14px', padding: '24px' }}>
                                <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: 600 }}>📊 Performance Metrics</h3>
                                {[
                                    { label: 'Accuracy', value: 97.04, color: '#22c55e' },
                                    { label: 'Precision', value: 95.42, color: '#3b82f6' },
                                    { label: 'Recall', value: 87.02, color: '#f59e0b' },
                                    { label: 'F1 Score', value: 91.02, color: '#8b5cf6' },
                                    { label: 'ROC-AUC', value: 95.91, color: '#ec4899' }
                                ].map((m, i) => (
                                    <div key={i} style={{ marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ color: '#9ca3af', fontSize: '13px' }}>{m.label}</span>
                                            <span style={{ color: m.color, fontWeight: 700 }}>{m.value}%</span>
                                        </div>
                                        <div style={{ height: '8px', background: '#1f2937', borderRadius: '4px' }}>
                                            <div style={{ height: '100%', width: `${m.value}%`, background: m.color, borderRadius: '4px', transition: 'width 1.5s ease' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ background: '#0a0f1a', border: '1px solid #1f2937', borderRadius: '14px', padding: '24px' }}>
                                <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: 600 }}>🤖 Model Details</h3>
                                {[
                                    { label: 'Algorithm', value: 'XGBoost Classifier' },
                                    { label: 'Dataset Size', value: '26,393 transactions' },
                                    { label: 'Features Used', value: '18 engineered features' },
                                    { label: 'Train/Test Split', value: '80% / 20%' },
                                    { label: 'Fraud Rate in Data', value: '17.22%' },
                                    { label: 'Imbalance Handling', value: 'scale_pos_weight' },
                                    { label: 'Anomaly Detection', value: 'Isolation Forest' },
                                    { label: 'Model File', value: 'xgboost_model.pkl' }
                                ].map((d, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #0f172a' }}>
                                        <span style={{ color: '#6b7280', fontSize: '13px' }}>{d.label}</span>
                                        <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 500 }}>{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;