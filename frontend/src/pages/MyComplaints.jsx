import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const statusConfig = {
    pending:   { bg: '#422006', color: '#fb923c', border: '#d97706', label: '⏳ Pending' },
    reviewing: { bg: '#172554', color: '#60a5fa', border: '#3b82f6', label: '🔍 Reviewing' },
    resolved:  { bg: '#052e16', color: '#4ade80', border: '#16a34a', label: '✅ Resolved' },
    rejected:  { bg: '#450a0a', color: '#f87171', border: '#ef4444', label: '❌ Rejected' }
};

const priorityConfig = {
    high:   { color: '#ef4444', bg: '#450a0a', label: '🔴 HIGH' },
    medium: { color: '#f59e0b', bg: '#422006', label: '🟡 MEDIUM' },
    low:    { color: '#22c55e', bg: '#052e16', label: '🟢 LOW' }
};

const MyComplaints = () => {
    const { isDark } = useTheme();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selected, setSelected] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        subject: '', category: 'fraud', description: '',
        transactionId: '', amount: ''
    });

    useEffect(() => { fetchComplaints(); }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const res = await API.get('/complaints/my');
            if (res.data && res.data.success) {
                setComplaints(res.data.data || []);
            }
        } catch (err) {
            toast.error('Failed to load complaints');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await API.post('/complaints', {
                ...form,
                amount: parseFloat(form.amount) || 0
            });
            if (res.data.autoResolved) {
                toast.success('✅ Auto-resolved! Check your complaint for guidance.');
            } else if (res.data.priority === 'high') {
                toast.success('🚨 Critical complaint flagged to admin urgently!');
            } else {
                toast.success('📋 Complaint submitted successfully!');
            }
            setShowForm(false);
            setForm({ subject: '', category: 'fraud', description: '', transactionId: '', amount: '' });
            fetchComplaints();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to submit');
        } finally {
            setSubmitting(false);
        }
    };

    // ── styles using CSS variables so they work in both light and dark mode ──
    const bg = isDark ? '#030712' : '#f8fafc';
    const cardBg = isDark ? '#0d1117' : '#ffffff';
    const cardBorder = isDark ? '#1f2937' : '#e2e8f0';
    const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
    const textSecondary = isDark ? '#94a3b8' : '#475569';
    const textMuted = isDark ? '#4b5563' : '#94a3b8';
    const inputBg = isDark ? '#0a0f1a' : '#f8fafc';
    const inputBorder = isDark ? '#374151' : '#e2e8f0';
    const rowBg = isDark ? '#111827' : '#f8fafc';

    const inp = {
        width: '100%', background: inputBg, color: textPrimary,
        border: `1px solid ${inputBorder}`, borderRadius: '10px',
        padding: '10px 14px', fontSize: '14px', outline: 'none',
        boxSizing: 'border-box', transition: 'border 0.15s'
    };

    const btn = (bg2 = '#2563eb', color2 = 'white') => ({
        background: bg2, color: color2, border: 'none', borderRadius: '8px',
        padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
        transition: 'opacity 0.15s'
    });

    const statNumbers = [
        { label: 'Total', value: complaints.length, color: '#3b82f6' },
        { label: 'Pending', value: complaints.filter(c => c.status === 'pending').length, color: '#f59e0b' },
        { label: 'Reviewing', value: complaints.filter(c => c.status === 'reviewing').length, color: '#60a5fa' },
        { label: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length, color: '#22c55e' },
        { label: 'Rejected', value: complaints.filter(c => c.status === 'rejected').length, color: '#ef4444' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: bg, padding: '24px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>

                {/* ── Header ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 4px', color: textPrimary }}>
                            📋 My Complaints
                        </h1>
                        <p style={{ color: textMuted, fontSize: '14px', margin: 0 }}>
                            Submit and track your support requests
                        </p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)}
                        style={btn(showForm ? '#374151' : '#2563eb')}>
                        {showForm ? '✕ Cancel' : '+ New Complaint'}
                    </button>
                </div>

                {/* ── Stats ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '20px' }}>
                    {statNumbers.map((s, i) => (
                        <div key={i} style={{
                            background: cardBg, border: `1px solid ${cardBorder}`,
                            borderRadius: '12px', padding: '14px', textAlign: 'center',
                            borderTop: `3px solid ${s.color}`
                        }}>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: '12px', color: textMuted, marginTop: '3px' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* ── New Complaint Form ── */}
                {showForm && (
                    <div style={{
                        background: cardBg, border: `1px solid #3b82f6`,
                        borderRadius: '16px', padding: '24px', marginBottom: '20px',
                        boxShadow: '0 0 0 3px rgba(59,130,246,0.1)'
                    }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: textPrimary }}>
                            🆕 Submit New Complaint
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', color: textSecondary, fontSize: '13px', marginBottom: '5px' }}>Subject *</label>
                                    <input style={inp} placeholder="Brief description of your issue"
                                        value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: textSecondary, fontSize: '13px', marginBottom: '5px' }}>Category *</label>
                                    <select style={inp} value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}>
                                        <option value="fraud">UPI Fraud</option>
                                        <option value="dispute">Transaction Dispute</option>
                                        <option value="upi_issue">UPI Issue</option>
                                        <option value="account">Account Issue</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: textSecondary, fontSize: '13px', marginBottom: '5px' }}>Transaction ID (optional)</label>
                                    <input style={inp} placeholder="UTR/Reference number"
                                        value={form.transactionId} onChange={e => setForm({ ...form, transactionId: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: textSecondary, fontSize: '13px', marginBottom: '5px' }}>Amount Involved (₹)</label>
                                    <input type="number" style={inp} placeholder="0"
                                        value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', color: textSecondary, fontSize: '13px', marginBottom: '5px' }}>Description *</label>
                                <textarea style={{ ...inp, minHeight: '110px', resize: 'vertical' }}
                                    placeholder="Describe your issue in detail..."
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    required />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" disabled={submitting}
                                    style={{ ...btn('#2563eb'), opacity: submitting ? 0.6 : 1 }}>
                                    {submitting ? '⏳ Submitting...' : '📤 Submit Complaint'}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)}
                                    style={btn('#374151')}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── Complaints List ── */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: textMuted }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                        <div>Loading your complaints...</div>
                    </div>
                ) : complaints.length === 0 ? (
                    <div style={{
                        background: cardBg, border: `1px solid ${cardBorder}`,
                        borderRadius: '16px', padding: '60px', textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                        <div style={{ color: textPrimary, fontSize: '16px', marginBottom: '8px', fontWeight: 600 }}>
                            No complaints yet
                        </div>
                        <div style={{ color: textMuted, fontSize: '14px', marginBottom: '20px' }}>
                            Submit a complaint if you face any issue
                        </div>
                        <button onClick={() => setShowForm(true)} style={btn()}>
                            + Submit First Complaint
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {complaints.map((c, i) => {
                            const sCfg = statusConfig[c.status] || statusConfig.pending;
                            const pCfg = priorityConfig[c.priority] || priorityConfig.low;
                            const isOpen = selected === c._id;

                            return (
                                <div key={c._id} style={{
                                    background: cardBg,
                                    border: `1px solid ${isOpen ? '#3b82f6' : cardBorder}`,
                                    borderLeft: `4px solid ${pCfg.color}`,
                                    borderRadius: '14px',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s'
                                }}>
                                    {/* Card Header — always visible */}
                                    <div
                                        onClick={() => setSelected(isOpen ? null : c._id)}
                                        style={{
                                            padding: '16px 20px', cursor: 'pointer',
                                            display: 'flex', justifyContent: 'space-between',
                                            alignItems: 'flex-start', gap: '12px'
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            {/* Subject + badges */}
                                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                <span style={{ fontWeight: 700, fontSize: '15px', color: textPrimary }}>
                                                    {c.subject}
                                                </span>
                                                <span style={{
                                                    background: sCfg.bg, color: sCfg.color,
                                                    border: `1px solid ${sCfg.border}`,
                                                    padding: '2px 10px', borderRadius: '20px',
                                                    fontSize: '11px', fontWeight: 600
                                                }}>
                                                    {sCfg.label}
                                                </span>
                                                <span style={{
                                                    background: pCfg.bg, color: pCfg.color,
                                                    padding: '2px 8px', borderRadius: '10px',
                                                    fontSize: '11px', fontWeight: 700
                                                }}>
                                                    {pCfg.label}
                                                </span>
                                                {c.adminReply && (
                                                    <span style={{
                                                        background: '#0f2942', color: '#60a5fa',
                                                        border: '1px solid #1e3a5f',
                                                        padding: '2px 10px', borderRadius: '20px',
                                                        fontSize: '11px', fontWeight: 600
                                                    }}>
                                                        💬 Reply received
                                                    </span>
                                                )}
                                            </div>
                                            {/* Meta */}
                                            <div style={{ fontSize: '12px', color: textMuted }}>
                                                {c.category.replace('_', ' ').toUpperCase()}
                                                {c.amount > 0 && ` • ₹${c.amount.toLocaleString('en-IN')}`}
                                                {` • ${new Date(c.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}`}
                                            </div>
                                            {/* Description preview */}
                                            <div style={{
                                                fontSize: '13px', color: textSecondary,
                                                marginTop: '6px', lineHeight: 1.5
                                            }}>
                                                {c.description.substring(0, 120)}
                                                {c.description.length > 120 ? '...' : ''}
                                            </div>
                                        </div>
                                        <span style={{ color: textMuted, fontSize: '18px', flexShrink: 0 }}>
                                            {isOpen ? '▲' : '▼'}
                                        </span>
                                    </div>

                                    {/* Expanded Panel */}
                                    {isOpen && (
                                        <div style={{
                                            borderTop: `1px solid ${cardBorder}`,
                                            padding: '16px 20px',
                                            background: isDark ? '#0a0f1a' : '#f8fafc'
                                        }}>
                                            {/* Full description */}
                                            <div style={{ marginBottom: '16px' }}>
                                                <div style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                                                    Your Complaint
                                                </div>
                                                <div style={{
                                                    background: isDark ? '#111827' : '#ffffff',
                                                    border: `1px solid ${cardBorder}`,
                                                    borderRadius: '10px', padding: '14px',
                                                    fontSize: '14px', color: textSecondary,
                                                    lineHeight: 1.7, whiteSpace: 'pre-wrap'
                                                }}>
                                                    {c.description}
                                                </div>
                                                {c.transactionId && (
                                                    <div style={{ marginTop: '8px', fontSize: '13px', color: textMuted }}>
                                                        Transaction ID: <span style={{ fontFamily: 'monospace', color: textSecondary }}>{c.transactionId}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Admin Reply */}
                                            {c.adminReply ? (
                                                <div>
                                                    <div style={{ fontSize: '11px', color: textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                                                        {c.repliedBy === 'FraudGuard Smart Assistant'
                                                            ? '🤖 Auto-Generated Response'
                                                            : `💬 Response from ${c.repliedBy}`}
                                                        {c.repliedAt && ` • ${new Date(c.repliedAt).toLocaleDateString('en-IN')}`}
                                                    </div>
                                                    <div style={{
                                                        background: isDark ? '#0f2942' : '#eff6ff',
                                                        border: `1px solid ${isDark ? '#1e3a5f' : '#bfdbfe'}`,
                                                        borderRadius: '10px', padding: '14px',
                                                        fontSize: '13px',
                                                        color: isDark ? '#93c5fd' : '#1e40af',
                                                        lineHeight: 1.7, whiteSpace: 'pre-wrap'
                                                    }}>
                                                        {c.adminReply}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{
                                                    background: isDark ? '#111827' : '#fafafa',
                                                    border: `1px solid ${cardBorder}`,
                                                    borderRadius: '10px', padding: '14px',
                                                    fontSize: '13px', color: textMuted,
                                                    textAlign: 'center'
                                                }}>
                                                    ⏳ Awaiting admin response...
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyComplaints;