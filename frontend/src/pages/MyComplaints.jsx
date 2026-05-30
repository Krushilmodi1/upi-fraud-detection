import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const statusColors = {
    pending: { bg: '#78350f', color: '#fcd34d', label: '⏳ Pending' },
    reviewing: { bg: '#1e3a5f', color: '#93c5fd', label: '🔍 Under Review' },
    resolved: { bg: '#14532d', color: '#86efac', label: '✅ Resolved' },
    rejected: { bg: '#7f1d1d', color: '#fca5a5', label: '❌ Rejected' }
};

const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e'
};

const MyComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selected, setSelected] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        subject: '',
        category: 'fraud',
        description: '',
        transactionId: '',
        amount: ''
    });

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const res = await API.get('/complaints/my');
            setComplaints(res.data.data);
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
            await API.post('/complaints', {
                ...form,
                amount: parseFloat(form.amount) || 0
            });
            toast.success('Complaint submitted successfully!');
            setShowForm(false);
            setForm({ subject: '', category: 'fraud', description: '', transactionId: '', amount: '' });
            fetchComplaints();
        } catch (err) {
            toast.error('Failed to submit complaint');
        } finally {
            setSubmitting(false);
        }
    };

    const s = {
        page: { minHeight: '100vh', background: '#030712', color: 'white', padding: '24px' },
        card: { background: '#0d1117', border: '1px solid #1f2937', borderRadius: '16px', padding: '20px' },
        input: { width: '100%', background: '#111827', color: 'white', border: '1px solid #374151', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
        label: { display: 'block', color: '#9ca3af', fontSize: '13px', marginBottom: '6px' },
        btn: { background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }
    };

    return (
        <div style={s.page}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0 }}>📋 My Complaints</h1>
                        <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0' }}>
                            Track and manage your fraud complaints
                        </p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} style={s.btn}>
                        {showForm ? '✕ Cancel' : '+ New Complaint'}
                    </button>
                </div>

                {/* New Complaint Form */}
                {showForm && (
                    <div style={{ ...s.card, marginBottom: '24px', border: '1px solid #2563eb' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
                            🆕 Submit New Complaint
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={s.label}>Subject *</label>
                                    <input
                                        style={s.input}
                                        placeholder="Brief description of your issue"
                                        value={form.subject}
                                        onChange={e => setForm({ ...form, subject: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={s.label}>Category *</label>
                                    <select
                                        style={s.input}
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                    >
                                        <option value="fraud">UPI Fraud</option>
                                        <option value="dispute">Transaction Dispute</option>
                                        <option value="upi_issue">UPI Issue</option>
                                        <option value="account">Account Issue</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={s.label}>Transaction ID (if any)</label>
                                    <input
                                        style={s.input}
                                        placeholder="UTR/Reference number"
                                        value={form.transactionId}
                                        onChange={e => setForm({ ...form, transactionId: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={s.label}>Amount Involved (₹)</label>
                                    <input
                                        type="number"
                                        style={s.input}
                                        placeholder="0"
                                        value={form.amount}
                                        onChange={e => setForm({ ...form, amount: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={s.label}>Detailed Description *</label>
                                <textarea
                                    style={{ ...s.input, minHeight: '120px', resize: 'vertical' }}
                                    placeholder="Describe your issue in detail. Include what happened, when it happened, and any other relevant information..."
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" disabled={submitting} style={{ ...s.btn, opacity: submitting ? 0.6 : 1 }}>
                                    {submitting ? 'Submitting...' : '📤 Submit Complaint'}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)}
                                    style={{ ...s.btn, background: '#1f2937' }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {[
                        { label: 'Total', value: complaints.length, color: '#3b82f6' },
                        { label: 'Pending', value: complaints.filter(c => c.status === 'pending').length, color: '#f59e0b' },
                        { label: 'Reviewing', value: complaints.filter(c => c.status === 'reviewing').length, color: '#60a5fa' },
                        { label: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length, color: '#22c55e' }
                    ].map((s2, i) => (
                        <div key={i} style={{ background: '#0d1117', border: '1px solid #1f2937', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                            <div style={{ fontSize: '28px', fontWeight: 700, color: s2.color }}>{s2.value}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{s2.label}</div>
                        </div>
                    ))}
                </div>

                {/* Complaints List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading...</div>
                ) : complaints.length === 0 ? (
                    <div style={{ ...s.card, textAlign: 'center', padding: '60px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                        <div style={{ color: '#9ca3af', fontSize: '16px', marginBottom: '8px' }}>No complaints submitted yet</div>
                        <div style={{ color: '#6b7280', fontSize: '14px' }}>Click "New Complaint" to report an issue</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {complaints.map((c, i) => (
                            <div key={i}
                                onClick={() => setSelected(selected?._id === c._id ? null : c)}
                                style={{
                                    ...s.card,
                                    cursor: 'pointer',
                                    borderLeft: `4px solid ${priorityColors[c.priority]}`,
                                    transition: 'all 0.2s'
                                }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                            <span style={{ fontWeight: 600, fontSize: '15px' }}>{c.subject}</span>
                                            <span style={{
                                                background: statusColors[c.status].bg,
                                                color: statusColors[c.status].color,
                                                padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600
                                            }}>
                                                {statusColors[c.status].label}
                                            </span>
                                        </div>
                                        <div style={{ color: '#6b7280', fontSize: '13px' }}>
                                            {c.category.replace('_', ' ').toUpperCase()} •
                                            {c.amount > 0 ? ` ₹${c.amount.toLocaleString('en-IN')} • ` : ' '}
                                            {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ background: priorityColors[c.priority] + '33', color: priorityColors[c.priority], padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 600 }}>
                                            {c.priority.toUpperCase()} PRIORITY
                                        </span>
                                        <span style={{ color: '#4b5563' }}>{selected?._id === c._id ? '▲' : '▼'}</span>
                                    </div>
                                </div>

                                {selected?._id === c._id && (
                                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #1f2937' }}>
                                        <div style={{ marginBottom: '12px' }}>
                                            <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '6px' }}>YOUR COMPLAINT:</div>
                                            <div style={{ background: '#111827', borderRadius: '10px', padding: '12px', fontSize: '14px', color: '#d1d5db', lineHeight: 1.6 }}>
                                                {c.description}
                                            </div>
                                        </div>
                                        {c.transactionId && (
                                            <div style={{ marginBottom: '12px' }}>
                                                <span style={{ color: '#6b7280', fontSize: '12px' }}>Transaction ID: </span>
                                                <span style={{ color: '#9ca3af', fontSize: '13px', fontFamily: 'monospace' }}>{c.transactionId}</span>
                                            </div>
                                        )}
                                        {c.adminReply ? (
                                            <div>
                                                <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '6px' }}>
                                                    ADMIN REPLY — {c.repliedBy} • {new Date(c.repliedAt).toLocaleDateString('en-IN')}:
                                                </div>
                                                <div style={{ background: '#0f2942', border: '1px solid #1e3a5f', borderRadius: '10px', padding: '12px', fontSize: '14px', color: '#93c5fd', lineHeight: 1.6 }}>
                                                    💬 {c.adminReply}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ background: '#111827', borderRadius: '10px', padding: '12px', fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>
                                                ⏳ Awaiting admin response...
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyComplaints;