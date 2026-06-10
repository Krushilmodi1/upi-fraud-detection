import { useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

// ── Config ────────────────────────────────────────────────────────────────────
const STATUS = {
  pending: {
    bg: "#422006",
    color: "#fb923c",
    dot: "#f97316",
    label: "Pending",
    icon: "⏳",
  },
  reviewing: {
    bg: "#172554",
    color: "#60a5fa",
    dot: "#3b82f6",
    label: "Reviewing",
    icon: "🔍",
  },
  resolved: {
    bg: "#052e16",
    color: "#4ade80",
    dot: "#22c55e",
    label: "Resolved",
    icon: "✅",
  },
  rejected: {
    bg: "#450a0a",
    color: "#f87171",
    dot: "#ef4444",
    label: "Rejected",
    icon: "❌",
  },
};

const PRIORITY = {
  high: { color: "#ef4444", bg: "#450a0a", dot: "#dc2626", label: "🔴 HIGH" },
  medium: {
    color: "#f59e0b",
    bg: "#422006",
    dot: "#d97706",
    label: "🟡 MEDIUM",
  },
  low: { color: "#22c55e", bg: "#052e16", dot: "#16a34a", label: "🟢 LOW" },
};

// ── Sub-components ────────────────────────────────────────────────────────────
const Dot = ({ color, size = 8 }) => (
  <span
    style={{
      display: "inline-block",
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      boxShadow: `0 0 ${size}px ${color}88`,
      flexShrink: 0,
    }}
  />
);

const KPICard = ({ icon, label, value, sub, color, trend, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: "#0a0f1a",
      border: `1px solid ${color}33`,
      borderRadius: "16px",
      padding: "20px",
      borderTop: `3px solid ${color}`,
      cursor: onClick ? "pointer" : "default",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
    onMouseEnter={(e) => {
      if (onClick) {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = `0 8px 24px ${color}22`;
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "12px",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "11px",
            color: "#4b5563",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            marginBottom: "8px",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "38px",
            fontWeight: 900,
            color,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: "12px", color: "#4b5563", marginTop: "6px" }}>
            {sub}
          </div>
        )}
      </div>
      <span style={{ fontSize: "30px", opacity: 0.6 }}>{icon}</span>
    </div>
    {trend !== undefined && (
      <div
        style={{
          height: "3px",
          background: "#1f2937",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(Math.max(trend, 0), 100)}%`,
            background: `linear-gradient(90deg,${color}88,${color})`,
            borderRadius: "4px",
            transition: "width 1.2s ease",
          }}
        />
      </div>
    )}
  </div>
);

const EmptyState = ({ icon, text, sub }) => (
  <div style={{ padding: "60px", textAlign: "center" }}>
    <div style={{ fontSize: "48px", marginBottom: "12px" }}>{icon}</div>
    <div
      style={{
        color: "#9ca3af",
        fontSize: "16px",
        fontWeight: 600,
        marginBottom: "6px",
      }}
    >
      {text}
    </div>
    {sub && <div style={{ color: "#4b5563", fontSize: "13px" }}>{sub}</div>}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [tab, setTab] = useState("overview");
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState("resolved");
  const [replying, setReplying] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [searchUser, setSearchUser] = useState("");
  const [searchTx, setSearchTx] = useState("");
  const [time, setTime] = useState(new Date());
  const [lastSync, setLastSync] = useState(new Date());

  // ── Handle hash navigation from Navbar links ──
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (
      ["overview", "complaints", "users", "transactions", "model"].includes(
        hash,
      )
    ) {
      setTab(hash);
      if (hash === "complaints") setFilterStatus("pending");
    }
  }, [location.hash]);

  // ── Initial fetch + intervals ──
  useEffect(() => {
    fetchAll();
    const clock = setInterval(() => setTime(new Date()), 1000);
    const refresh = setInterval(() => fetchAll(true), 60000);
    return () => {
      clearInterval(clock);
      clearInterval(refresh);
    };
  }, []);

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [cR, uR, tR] = await Promise.all([
        API.get("/complaints/all"),
        API.get("/admin/users"),
        API.get("/admin/transactions"),
      ]);
      setComplaints(cR.data.data || []);
      setUsers(uR.data.data || []);
      setTransactions(tR.data.data || []);
      setLastSync(new Date());
    } catch {
      if (!silent) toast.error("Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleReply = async (id) => {
    if (!replyText.trim()) return toast.error("Please write a reply first");
    setReplying(true);
    try {
      await API.put(`/complaints/${id}/reply`, {
        reply: replyText,
        status: replyStatus,
      });
      toast.success("✅ Reply sent successfully!");
      setReplyText("");
      setSelectedId(null);
      fetchAll(true);
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setReplying(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await API.put(`/complaints/${id}/status`, { status });
      toast.success(`Status updated to ${status}`);
      fetchAll(true);
    } catch {
      toast.error("Failed to update status");
    }
  };

  // ── Computed ──
  const pendingCount = complaints.filter((c) => c.status === "pending").length;
  const reviewingCount = complaints.filter(
    (c) => c.status === "reviewing",
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === "resolved",
  ).length;
  const highPriority = complaints.filter(
    (c) => c.priority === "high" && c.status !== "resolved",
  ).length;
  const fraudTx = transactions.filter((t) => t.isFraud);
  const fraudRate =
    transactions.length > 0
      ? ((fraudTx.length / transactions.length) * 100).toFixed(1)
      : 0;
  const fraudAmount = fraudTx.reduce((s, t) => s + (t.amount || 0), 0);
  const avgRisk =
    transactions.length > 0
      ? Math.round(
          transactions.reduce((s, t) => s + t.riskScore, 0) /
            transactions.length,
        )
      : 0;

  const filteredComplaints = complaints.filter((c) => {
    const sOk = filterStatus === "all" || c.status === filterStatus;
    const pOk = filterPriority === "all" || c.priority === filterPriority;
    return sOk && pOk;
  });

  const filteredUsers = users.filter(
    (u) =>
      !searchUser ||
      u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchUser.toLowerCase()),
  );

  const filteredTx = transactions.filter(
    (t) =>
      !searchTx ||
      t.amount?.toString().includes(searchTx) ||
      (t.userId?.name || "").toLowerCase().includes(searchTx.toLowerCase()),
  );

  // ── Style helpers ──
  const inp = {
    background: "#0a0f1a",
    color: "white",
    border: "1px solid #1f2937",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };
  const btn = (bg = "#2563eb", clr = "white") => ({
    background: bg,
    color: clr,
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "13px",
    transition: "opacity 0.15s, transform 0.1s",
  });
  const filterBtn = (active, bg, color, border) => ({
    ...btn(active ? bg : "#0a0f1a", active ? color : "#6b7280"),
    border: `1px solid ${active ? border : "#1f2937"}`,
    padding: "5px 12px",
    fontSize: "12px",
  });

  // ── Loading ──
  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#030712",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "3px solid #1f2937",
            borderTop: "3px solid #dc2626",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <div style={{ color: "#6b7280", fontSize: "14px" }}>
          Loading Admin Control Room...
        </div>
      </div>
    );

  return (
    <div style={{ minHeight: "100vh", background: "#030712", color: "white" }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;max-height:0} to{opacity:1;max-height:800px} }
        .fade { animation: fadeIn 0.25s ease forwards; }
        .hrow:hover { background:#0f1929!important; }
        .ntab { padding:11px 16px; border:none; cursor:pointer; font-size:13px; font-weight:600; transition:all 0.2s; border-bottom:2px solid transparent; background:transparent; white-space:nowrap; }
        .ntab:hover { color:#f87171!important; }
        .kpi:hover { transform:translateY(-2px); }
        select option { background:#0a0f1a; color:white; }
      `}</style>

      {/* ══ STICKY TAB BAR ══════════════════════════════════════════════════ */}
      <div
        style={{
          background: "#050a14",
          borderBottom: "1px solid #1a2332",
          position: "sticky",
          top: "60px",
          zIndex: 100,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            gap: "4px",
            overflowX: "auto",
          }}
        >
          {/* Tabs */}
          {[
            { id: "overview", label: "📊 Overview" },
            {
              id: "complaints",
              label: `📋 Complaints${pendingCount > 0 ? ` (${pendingCount})` : ""}`,
            },
            { id: "users", label: `👥 Users (${users.length})` },
            {
              id: "transactions",
              label: `💳 Transactions (${transactions.length})`,
            },
            { id: "model", label: "🤖 ML Model" },
          ].map((t) => (
            <button
              key={t.id}
              className="ntab"
              onClick={() => setTab(t.id)}
              style={{
                color: tab === t.id ? "#f87171" : "#6b7280",
                borderBottom:
                  tab === t.id ? "2px solid #dc2626" : "2px solid transparent",
              }}
            >
              {t.label}
            </button>
          ))}

          {/* Right side — alerts, clock, refresh */}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              paddingLeft: "16px",
              flexShrink: 0,
            }}
          >
            {pendingCount > 0 && (
              <button
                onClick={() => {
                  setTab("complaints");
                  setFilterStatus("pending");
                }}
                style={{
                  ...btn("#422006", "#fb923c"),
                  border: "1px solid #d97706",
                  fontSize: "11px",
                  padding: "4px 10px",
                  animation: "pulse 2s infinite",
                }}
              >
                🔔 {pendingCount} pending
              </button>
            )}
            {highPriority > 0 && (
              <button
                onClick={() => {
                  setTab("complaints");
                  setFilterPriority("high");
                }}
                style={{
                  ...btn("#450a0a", "#f87171"),
                  border: "1px solid #dc2626",
                  fontSize: "11px",
                  padding: "4px 10px",
                  animation: "pulse 1.5s infinite",
                }}
              >
                🚨 {highPriority} urgent
              </button>
            )}
            <div
              style={{
                textAlign: "right",
                borderLeft: "1px solid #1f2937",
                paddingLeft: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  color: "#374151",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Synced
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  fontFamily: "monospace",
                }}
              >
                {lastSync.toLocaleTimeString("en-IN")}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "9px",
                  color: "#374151",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Time
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#22c55e",
                  fontFamily: "monospace",
                  fontWeight: 700,
                }}
              >
                {time.toLocaleTimeString("en-IN")}
              </div>
            </div>
            <button
              onClick={() => fetchAll(true)}
              disabled={refreshing}
              style={{
                ...btn("#1f2937"),
                fontSize: "12px",
                padding: "6px 12px",
                opacity: refreshing ? 0.5 : 1,
              }}
            >
              {refreshing ? "⟳" : "🔄"}
            </button>
          </div>
        </div>
      </div>

      {/* ══ PAGE CONTENT ════════════════════════════════════════════════════ */}
      <div style={{ padding: "28px", maxWidth: "1400px", margin: "0 auto" }}>
        {/* ── OVERVIEW ──────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="fade">
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "28px",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    margin: "0 0 4px",
                    color: "white",
                  }}
                >
                  System Overview
                </h1>
                <p style={{ color: "#4b5563", fontSize: "13px", margin: 0 }}>
                  Real-time platform monitoring • Auto-refreshes every 60
                  seconds
                </p>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    background: "#0a0f1a",
                    border: "1px solid #1f2937",
                    borderRadius: "10px",
                    padding: "10px 16px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "9px",
                      color: "#4b5563",
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                    }}
                  >
                    Fraud Rate
                  </div>
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: 800,
                      color: parseFloat(fraudRate) > 20 ? "#ef4444" : "#22c55e",
                    }}
                  >
                    {fraudRate}%
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <KPICard
                icon="👥"
                label="Total Users"
                value={users.length}
                sub="registered accounts"
                color="#3b82f6"
                trend={(users.length / 100) * 100}
                onClick={() => setTab("users")}
              />
              <KPICard
                icon="💳"
                label="Transactions"
                value={transactions.length}
                sub="ML analyzed"
                color="#8b5cf6"
                trend={(transactions.length / 200) * 100}
                onClick={() => setTab("transactions")}
              />
              <KPICard
                icon="🚨"
                label="Fraud Detected"
                value={fraudTx.length}
                sub={`₹${fraudAmount.toLocaleString("en-IN")} total`}
                color="#ef4444"
                trend={parseFloat(fraudRate)}
                onClick={() => setTab("transactions")}
              />
              <KPICard
                icon="📋"
                label="Open Complaints"
                value={pendingCount + reviewingCount}
                sub={`${highPriority} high priority`}
                color="#f59e0b"
                trend={
                  ((pendingCount + reviewingCount) /
                    Math.max(complaints.length, 1)) *
                  100
                }
                onClick={() => setTab("complaints")}
              />
            </div>

            {/* High priority banner */}
            {highPriority > 0 && (
              <div
                onClick={() => {
                  setTab("complaints");
                  setFilterPriority("high");
                }}
                style={{
                  background: "linear-gradient(135deg,#450a0a,#7f1d1d)",
                  border: "1px solid #dc2626",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  marginBottom: "24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "14px" }}
                >
                  <span
                    style={{ fontSize: "28px", animation: "pulse 1s infinite" }}
                  >
                    🚨
                  </span>
                  <div>
                    <div
                      style={{
                        fontWeight: 800,
                        color: "#fca5a5",
                        fontSize: "15px",
                      }}
                    >
                      {highPriority} HIGH PRIORITY complaint
                      {highPriority > 1 ? "s" : ""} need immediate response
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#f87171",
                        marginTop: "2px",
                      }}
                    >
                      Click to view — these are critical user issues requiring
                      your attention
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    color: "#f87171",
                    fontSize: "24px",
                    fontWeight: 700,
                  }}
                >
                  →
                </div>
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              {/* Recent Complaints */}
              <div
                style={{
                  background: "#0a0f1a",
                  border: "1px solid #1f2937",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
                    📋 Recent Complaints
                  </h3>
                  <button
                    onClick={() => setTab("complaints")}
                    style={{
                      ...btn("#1f2937"),
                      fontSize: "12px",
                      padding: "5px 12px",
                    }}
                  >
                    View all →
                  </button>
                </div>
                {complaints.length === 0 ? (
                  <EmptyState icon="📭" text="No complaints yet" />
                ) : (
                  complaints.slice(0, 6).map((c, i) => (
                    <div
                      key={i}
                      className="hrow"
                      onClick={() => {
                        setTab("complaints");
                        setSelectedId(c._id);
                      }}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 10px",
                        borderRadius: "8px",
                        borderBottom: "1px solid #0f172a",
                        cursor: "pointer",
                        transition: "background 0.15s",
                        borderLeft: `3px solid ${PRIORITY[c.priority]?.color || "#6b7280"}`,
                        marginLeft: "-10px",
                        paddingLeft: "13px",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: "white",
                          }}
                        >
                          {c.subject}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#4b5563",
                            marginTop: "2px",
                          }}
                        >
                          {c.userName} •{" "}
                          {new Date(c.createdAt).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          flexShrink: 0,
                        }}
                      >
                        <Dot color={STATUS[c.status]?.dot || "#6b7280"} />
                        <span
                          style={{
                            fontSize: "11px",
                            color: STATUS[c.status]?.color,
                          }}
                        >
                          {STATUS[c.status]?.label}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Recent Transactions */}
              <div
                style={{
                  background: "#0a0f1a",
                  border: "1px solid #1f2937",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>
                    💳 Recent Transactions
                  </h3>
                  <button
                    onClick={() => setTab("transactions")}
                    style={{
                      ...btn("#1f2937"),
                      fontSize: "12px",
                      padding: "5px 12px",
                    }}
                  >
                    View all →
                  </button>
                </div>
                {transactions.length === 0 ? (
                  <EmptyState icon="💳" text="No transactions yet" />
                ) : (
                  transactions.slice(0, 6).map((t, i) => (
                    <div
                      key={i}
                      className="hrow"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 8px",
                        borderRadius: "8px",
                        borderBottom: "1px solid #0f172a",
                        transition: "background 0.15s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span style={{ fontSize: "18px" }}>
                          {t.isFraud ? "🚨" : "✅"}
                        </span>
                        <div>
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "white",
                            }}
                          >
                            ₹{t.amount?.toLocaleString("en-IN")}
                          </div>
                          <div style={{ fontSize: "11px", color: "#4b5563" }}>
                            {new Date(t.createdAt).toLocaleDateString("en-IN")}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: 800,
                            color:
                              t.riskScore >= 70
                                ? "#ef4444"
                                : t.riskScore >= 30
                                  ? "#f59e0b"
                                  : "#22c55e",
                          }}
                        >
                          {t.riskScore}/100
                        </div>
                        <div style={{ fontSize: "10px", color: "#4b5563" }}>
                          risk
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              {/* Status breakdown */}
              <div
                style={{
                  background: "#0a0f1a",
                  border: "1px solid #1f2937",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 16px",
                    fontSize: "15px",
                    fontWeight: 700,
                  }}
                >
                  📊 Complaint Breakdown
                </h3>
                {Object.entries(STATUS).map(([key, cfg]) => {
                  const count = complaints.filter(
                    (c) => c.status === key,
                  ).length;
                  const pct =
                    complaints.length > 0
                      ? (count / complaints.length) * 100
                      : 0;
                  return (
                    <div
                      key={key}
                      style={{ marginBottom: "14px", cursor: "pointer" }}
                      onClick={() => {
                        setTab("complaints");
                        setFilterStatus(key);
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "5px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Dot color={cfg.dot} />
                          <span
                            style={{
                              fontSize: "13px",
                              color: cfg.color,
                              fontWeight: 500,
                            }}
                          >
                            {cfg.icon} {cfg.label}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 800,
                            color: "white",
                          }}
                        >
                          {count}
                        </span>
                      </div>
                      <div
                        style={{
                          height: "5px",
                          background: "#1f2937",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: `linear-gradient(90deg,${cfg.dot}88,${cfg.dot})`,
                            borderRadius: "4px",
                            transition: "width 1.2s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Platform stats */}
              <div
                style={{
                  background: "#0a0f1a",
                  border: "1px solid #1f2937",
                  borderRadius: "16px",
                  padding: "20px",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 16px",
                    fontSize: "15px",
                    fontWeight: 700,
                  }}
                >
                  📈 Platform Statistics
                </h3>
                {[
                  {
                    label: "Total Users",
                    value: users.length,
                    color: "#3b82f6",
                  },
                  {
                    label: "Regular Users",
                    value: users.filter((u) => u.role === "user").length,
                    color: "#60a5fa",
                  },
                  {
                    label: "Admin Accounts",
                    value: users.filter((u) => u.role === "admin").length,
                    color: "#ef4444",
                  },
                  {
                    label: "Safe Transactions",
                    value: transactions.filter((t) => !t.isFraud).length,
                    color: "#22c55e",
                  },
                  {
                    label: "Fraud Transactions",
                    value: fraudTx.length,
                    color: "#ef4444",
                  },
                  {
                    label: "Total Fraud Amount",
                    value: `₹${fraudAmount.toLocaleString("en-IN")}`,
                    color: "#ef4444",
                  },
                  {
                    label: "Avg Risk Score",
                    value: `${avgRisk}/100`,
                    color:
                      avgRisk >= 70
                        ? "#ef4444"
                        : avgRisk >= 30
                          ? "#f59e0b"
                          : "#22c55e",
                  },
                  {
                    label: "Complaints Resolved",
                    value: resolvedCount,
                    color: "#22c55e",
                  },
                  {
                    label: "Users with Complaints",
                    value: [...new Set(complaints.map((c) => c.userEmail))]
                      .length,
                    color: "#f59e0b",
                  },
                ].map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "9px 0",
                      borderBottom: "1px solid #0f172a",
                    }}
                  >
                    <span style={{ color: "#6b7280", fontSize: "13px" }}>
                      {r.label}
                    </span>
                    <span
                      style={{
                        color: r.color,
                        fontWeight: 800,
                        fontSize: "15px",
                      }}
                    >
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── COMPLAINTS ────────────────────────────────────────────────── */}
        {tab === "complaints" && (
          <div className="fade">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    margin: "0 0 4px",
                    color: "white",
                  }}
                >
                  Complaint Management
                </h1>
                <p style={{ color: "#4b5563", fontSize: "13px", margin: 0 }}>
                  {filteredComplaints.length} complaint
                  {filteredComplaints.length !== 1 ? "s" : ""} shown
                </p>
              </div>
              <button
                onClick={() => fetchAll(true)}
                style={{ ...btn("#1f2937"), fontSize: "12px" }}
              >
                🔄 Refresh
              </button>
            </div>

            {/* Filters */}
            <div
              style={{
                background: "#0a0f1a",
                border: "1px solid #1f2937",
                borderRadius: "12px",
                padding: "14px 16px",
                marginBottom: "20px",
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    color: "#4b5563",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Status:
                </span>
                {["all", "pending", "reviewing", "resolved", "rejected"].map(
                  (f) => (
                    <button
                      key={f}
                      onClick={() => setFilterStatus(f)}
                      style={filterBtn(
                        filterStatus === f,
                        STATUS[f]?.bg || "#374151",
                        STATUS[f]?.color || "white",
                        STATUS[f]?.dot || "#374151",
                      )}
                    >
                      {f === "all"
                        ? `All (${complaints.length})`
                        : `${STATUS[f]?.icon} ${STATUS[f]?.label} (${complaints.filter((c) => c.status === f).length})`}
                    </button>
                  ),
                )}
              </div>
              <div
                style={{ width: "1px", height: "20px", background: "#1f2937" }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    color: "#4b5563",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Priority:
                </span>
                {["all", "high", "medium", "low"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    style={filterBtn(
                      filterPriority === p,
                      PRIORITY[p]?.bg || "#374151",
                      PRIORITY[p]?.color || "white",
                      PRIORITY[p]?.dot || "#374151",
                    )}
                  >
                    {p === "all" ? "All" : PRIORITY[p]?.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredComplaints.length === 0 ? (
              <div
                style={{
                  background: "#0a0f1a",
                  border: "1px solid #1f2937",
                  borderRadius: "16px",
                }}
              >
                <EmptyState
                  icon="📭"
                  text="No complaints match this filter"
                  sub="Try a different status or priority filter"
                />
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {filteredComplaints.map((c) => {
                  const isOpen = selectedId === c._id;
                  const pCfg = PRIORITY[c.priority] || PRIORITY.low;
                  const sCfg = STATUS[c.status] || STATUS.pending;
                  return (
                    <div
                      key={c._id}
                      style={{
                        background: "#0a0f1a",
                        border: `1px solid ${isOpen ? "#2563eb" : pCfg.color + "33"}`,
                        borderRadius: "16px",
                        padding: "18px 20px",
                        borderLeft: `4px solid ${pCfg.color}`,
                        transition: "border 0.2s",
                      }}
                    >
                      {/* Card header */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "12px",
                          marginBottom: "10px",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              flexWrap: "wrap",
                              marginBottom: "6px",
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: "15px",
                                color: "white",
                              }}
                            >
                              {c.subject}
                            </span>
                            <span
                              style={{
                                background: sCfg.bg,
                                color: sCfg.color,
                                padding: "2px 10px",
                                borderRadius: "20px",
                                fontSize: "11px",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <Dot color={sCfg.dot} size={6} />
                              {sCfg.label}
                            </span>
                            <span
                              style={{
                                background: pCfg.bg,
                                color: pCfg.color,
                                padding: "2px 9px",
                                borderRadius: "10px",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              {pCfg.label}
                            </span>
                            {c.adminReply && (
                              <span
                                style={{
                                  background: "#052e16",
                                  color: "#4ade80",
                                  border: "1px solid #16a34a44",
                                  padding: "2px 9px",
                                  borderRadius: "10px",
                                  fontSize: "11px",
                                }}
                              >
                                ✅ Replied
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              color: "#6b7280",
                              fontSize: "12px",
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "6px",
                              alignItems: "center",
                            }}
                          >
                            <span>
                              👤{" "}
                              <strong style={{ color: "#9ca3af" }}>
                                {c.userName}
                              </strong>
                            </span>
                            <span style={{ color: "#374151" }}>•</span>
                            <span>{c.userEmail}</span>
                            {c.amount > 0 && (
                              <>
                                <span style={{ color: "#374151" }}>•</span>
                                <span
                                  style={{ color: "#f59e0b", fontWeight: 600 }}
                                >
                                  ₹{c.amount.toLocaleString("en-IN")}
                                </span>
                              </>
                            )}
                            <span style={{ color: "#374151" }}>•</span>
                            <span>
                              {c.category.replace("_", " ").toUpperCase()}
                            </span>
                            <span style={{ color: "#374151" }}>•</span>
                            <span>
                              {new Date(c.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <select
                            value={c.status}
                            onChange={(e) =>
                              handleStatusChange(c._id, e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              ...inp,
                              width: "auto",
                              padding: "6px 10px",
                              fontSize: "12px",
                            }}
                          >
                            <option value="pending">⏳ Pending</option>
                            <option value="reviewing">🔍 Reviewing</option>
                            <option value="resolved">✅ Resolved</option>
                            <option value="rejected">❌ Rejected</option>
                          </select>
                          <button
                            onClick={() => {
                              setSelectedId(isOpen ? null : c._id);
                              setReplyText("");
                            }}
                            style={btn(isOpen ? "#374151" : "#1d4ed8")}
                          >
                            {isOpen ? "✕ Close" : "💬 Reply"}
                          </button>
                        </div>
                      </div>

                      {/* Description preview */}
                      <div
                        style={{
                          color: "#6b7280",
                          fontSize: "13px",
                          lineHeight: 1.6,
                        }}
                      >
                        {c.description.substring(0, 180)}
                        {c.description.length > 180 ? "..." : ""}
                      </div>

                      {/* ── Expanded reply panel ── */}
                      {isOpen && (
                        <div
                          style={{
                            marginTop: "16px",
                            paddingTop: "16px",
                            borderTop: "1px solid #1f2937",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "16px",
                              marginBottom: "16px",
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  color: "#4b5563",
                                  fontSize: "11px",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  marginBottom: "8px",
                                }}
                              >
                                Full Complaint
                              </div>
                              <div
                                style={{
                                  background: "#050a14",
                                  borderRadius: "10px",
                                  padding: "14px",
                                  fontSize: "13px",
                                  color: "#d1d5db",
                                  lineHeight: 1.7,
                                  maxHeight: "180px",
                                  overflowY: "auto",
                                  whiteSpace: "pre-wrap",
                                  border: "1px solid #1f2937",
                                }}
                              >
                                {c.description}
                              </div>
                              {c.transactionId && (
                                <div
                                  style={{
                                    marginTop: "8px",
                                    fontSize: "12px",
                                    color: "#4b5563",
                                  }}
                                >
                                  Tx ID:{" "}
                                  <span
                                    style={{
                                      fontFamily: "monospace",
                                      color: "#9ca3af",
                                    }}
                                  >
                                    {c.transactionId}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div>
                              {c.adminReply ? (
                                <>
                                  <div
                                    style={{
                                      color: "#4b5563",
                                      fontSize: "11px",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.5px",
                                      marginBottom: "8px",
                                    }}
                                  >
                                    Previous Reply — {c.repliedBy}
                                    {c.repliedAt &&
                                      ` • ${new Date(c.repliedAt).toLocaleDateString("en-IN")}`}
                                  </div>
                                  <div
                                    style={{
                                      background: "#0f2942",
                                      border: "1px solid #1e3a5f",
                                      borderRadius: "10px",
                                      padding: "14px",
                                      fontSize: "13px",
                                      color: "#93c5fd",
                                      lineHeight: 1.7,
                                      maxHeight: "180px",
                                      overflowY: "auto",
                                      whiteSpace: "pre-wrap",
                                    }}
                                  >
                                    {c.adminReply}
                                  </div>
                                </>
                              ) : (
                                <div
                                  style={{
                                    background: "#050a14",
                                    border: "1px solid #1f2937",
                                    borderRadius: "10px",
                                    padding: "20px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: "100%",
                                    color: "#374151",
                                    fontSize: "13px",
                                  }}
                                >
                                  No previous reply
                                </div>
                              )}
                            </div>
                          </div>

                          <div
                            style={{
                              color: "#4b5563",
                              fontSize: "11px",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              marginBottom: "8px",
                            }}
                          >
                            Write Your Reply
                          </div>
                          <textarea
                            autoFocus
                            style={{
                              ...inp,
                              minHeight: "100px",
                              resize: "vertical",
                              marginBottom: "10px",
                              lineHeight: 1.6,
                            }}
                            placeholder="Write a clear, helpful reply to the user..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              alignItems: "center",
                            }}
                          >
                            <select
                              value={replyStatus}
                              onChange={(e) => setReplyStatus(e.target.value)}
                              style={{ ...inp, width: "auto" }}
                            >
                              <option value="resolved">
                                ✅ Mark as Resolved
                              </option>
                              <option value="reviewing">
                                🔍 Mark as Reviewing
                              </option>
                              <option value="rejected">
                                ❌ Mark as Rejected
                              </option>
                            </select>
                            <button
                              onClick={() => handleReply(c._id)}
                              disabled={replying || !replyText.trim()}
                              style={{
                                ...btn("#16a34a"),
                                opacity:
                                  replying || !replyText.trim() ? 0.5 : 1,
                              }}
                            >
                              {replying ? "⏳ Sending..." : "📤 Send Reply"}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedId(null);
                                setReplyText("");
                              }}
                              style={btn("#374151")}
                            >
                              Cancel
                            </button>
                            <span
                              style={{
                                color: "#374151",
                                fontSize: "12px",
                                marginLeft: "auto",
                              }}
                            >
                              {replyText.length} chars
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── USERS ─────────────────────────────────────────────────────── */}
        {tab === "users" && (
          <div className="fade">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    margin: "0 0 4px",
                    color: "white",
                  }}
                >
                  User Management
                </h1>
                <p style={{ color: "#4b5563", fontSize: "13px", margin: 0 }}>
                  {filteredUsers.length} of {users.length} accounts
                </p>
              </div>
              <input
                style={{ ...inp, width: "260px" }}
                placeholder="🔍 Search name or email..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
              />
            </div>

            {/* Summary */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              {[
                { label: "Total", value: users.length, color: "#3b82f6" },
                {
                  label: "Users",
                  value: users.filter((u) => u.role === "user").length,
                  color: "#22c55e",
                },
                {
                  label: "Admins",
                  value: users.filter((u) => u.role === "admin").length,
                  color: "#ef4444",
                },
                {
                  label: "With Complaints",
                  value: [...new Set(complaints.map((c) => c.userEmail))]
                    .length,
                  color: "#f59e0b",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: "#0a0f1a",
                    border: `1px solid ${s.color}33`,
                    borderRadius: "12px",
                    padding: "16px",
                    textAlign: "center",
                    borderTop: `2px solid ${s.color}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: 800,
                      color: s.color,
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#4b5563",
                      marginTop: "4px",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                background: "#0a0f1a",
                border: "1px solid #1f2937",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr",
                  padding: "12px 20px",
                  background: "#050a14",
                  borderBottom: "1px solid #1f2937",
                  fontSize: "11px",
                  color: "#4b5563",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                <span>User</span>
                <span>Email</span>
                <span>Role</span>
                <span>Complaints</span>
                <span>Fraud Tx</span>
                <span>Joined</span>
              </div>
              {filteredUsers.length === 0 ? (
                <EmptyState icon="👥" text="No users found" />
              ) : (
                filteredUsers.map((u, i) => {
                  const userComplaints = complaints.filter(
                    (c) => c.userEmail === u.email,
                  ).length;
                  const userFraud = transactions.filter(
                    (t) =>
                      t.userId?.toString() === u._id?.toString() && t.isFraud,
                  ).length;
                  return (
                    <div
                      key={i}
                      className="hrow"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr",
                        padding: "14px 20px",
                        borderBottom: "1px solid #0f172a",
                        alignItems: "center",
                        transition: "background 0.15s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background:
                              u.role === "admin"
                                ? "linear-gradient(135deg,#450a0a,#7f1d1d)"
                                : "linear-gradient(135deg,#0f2942,#1e3a5f)",
                            border: `2px solid ${u.role === "admin" ? "#dc2626" : "#2563eb"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "14px",
                            color: u.role === "admin" ? "#f87171" : "#60a5fa",
                            flexShrink: 0,
                          }}
                        >
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: "14px" }}>
                          {u.name}
                        </span>
                      </div>
                      <span style={{ color: "#6b7280", fontSize: "13px" }}>
                        {u.email}
                      </span>
                      <span
                        style={{
                          background:
                            u.role === "admin" ? "#450a0a" : "#0f2942",
                          color: u.role === "admin" ? "#f87171" : "#60a5fa",
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: 700,
                          width: "fit-content",
                        }}
                      >
                        {u.role.toUpperCase()}
                      </span>
                      <span
                        style={{
                          color: userComplaints > 0 ? "#f59e0b" : "#374151",
                          fontWeight: userComplaints > 0 ? 700 : 400,
                          fontSize: "14px",
                        }}
                      >
                        {userComplaints}
                      </span>
                      <span
                        style={{
                          color: userFraud > 0 ? "#ef4444" : "#374151",
                          fontWeight: userFraud > 0 ? 700 : 400,
                          fontSize: "14px",
                        }}
                      >
                        {userFraud}
                      </span>
                      <span style={{ color: "#4b5563", fontSize: "12px" }}>
                        {new Date(u.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── TRANSACTIONS ──────────────────────────────────────────────── */}
        {tab === "transactions" && (
          <div className="fade">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    margin: "0 0 4px",
                    color: "white",
                  }}
                >
                  Transaction Monitor
                </h1>
                <p style={{ color: "#4b5563", fontSize: "13px", margin: 0 }}>
                  All ML-analyzed transactions • Fraud rate: {fraudRate}%
                </p>
              </div>
              <input
                style={{ ...inp, width: "240px" }}
                placeholder="🔍 Search amount or user..."
                value={searchTx}
                onChange={(e) => setSearchTx(e.target.value)}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
              <KPICard
                icon="💳"
                label="Total"
                value={transactions.length}
                color="#3b82f6"
              />
              <KPICard
                icon="🚨"
                label="Fraud"
                value={fraudTx.length}
                color="#ef4444"
                sub={`${fraudRate}% rate`}
              />
              <KPICard
                icon="✅"
                label="Safe"
                value={transactions.length - fraudTx.length}
                color="#22c55e"
              />
              <KPICard
                icon="💰"
                label="Fraud Amount"
                value={`₹${(fraudAmount / 1000).toFixed(0)}K`}
                color="#f59e0b"
              />
            </div>

            <div
              style={{
                background: "#0a0f1a",
                border: "1px solid #1f2937",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 2fr 1fr 1fr 1fr 1fr",
                  padding: "12px 20px",
                  background: "#050a14",
                  borderBottom: "1px solid #1f2937",
                  fontSize: "11px",
                  color: "#4b5563",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                <span>Amount</span>
                <span>User</span>
                <span>Risk Score</span>
                <span>Risk Tier</span>
                <span>Status</span>
                <span>Date</span>
              </div>
              {filteredTx.length === 0 ? (
                <EmptyState icon="💳" text="No transactions found" />
              ) : (
                filteredTx.map((t, i) => (
                  <div
                    key={i}
                    className="hrow"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.2fr 2fr 1fr 1fr 1fr 1fr",
                      padding: "14px 20px",
                      borderBottom: "1px solid #0f172a",
                      alignItems: "center",
                      borderLeft: `3px solid ${t.isFraud ? "#dc2626" : "#16a34a"}`,
                      transition: "background 0.15s",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: "16px",
                        color: "white",
                      }}
                    >
                      ₹{t.amount?.toLocaleString("en-IN")}
                    </span>
                    <span style={{ color: "#9ca3af", fontSize: "13px" }}>
                      {t.userId?.name || "Unknown"}
                    </span>
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: "15px",
                        color:
                          t.riskScore >= 70
                            ? "#ef4444"
                            : t.riskScore >= 30
                              ? "#f59e0b"
                              : "#22c55e",
                      }}
                    >
                      {t.riskScore}/100
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color:
                          t.riskTier === "High"
                            ? "#ef4444"
                            : t.riskTier === "Medium"
                              ? "#f59e0b"
                              : "#22c55e",
                      }}
                    >
                      {t.riskTier || "-"}
                    </span>
                    <span
                      style={{
                        background: t.isFraud ? "#450a0a" : "#052e16",
                        color: t.isFraud ? "#f87171" : "#4ade80",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 700,
                        width: "fit-content",
                      }}
                    >
                      {t.isFraud ? "🚨 FRAUD" : "✅ SAFE"}
                    </span>
                    <span style={{ color: "#4b5563", fontSize: "12px" }}>
                      {new Date(t.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── ML MODEL ──────────────────────────────────────────────────── */}
        {tab === "model" && (
          <div className="fade">
            <div style={{ marginBottom: "24px" }}>
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  margin: "0 0 4px",
                  color: "white",
                }}
              >
                ML Model Performance
              </h1>
              <p style={{ color: "#4b5563", fontSize: "13px", margin: 0 }}>
                XGBoost classifier — trained on 26,393 Indian UPI transactions
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              {/* Metrics */}
              <div
                style={{
                  background: "#0a0f1a",
                  border: "1px solid #1f2937",
                  borderRadius: "16px",
                  padding: "24px",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px",
                    fontSize: "15px",
                    fontWeight: 700,
                  }}
                >
                  📊 Performance Metrics
                </h3>
                {[
                  {
                    label: "Accuracy",
                    value: 97.04,
                    color: "#22c55e",
                    icon: "🎯",
                  },
                  {
                    label: "Precision",
                    value: 95.42,
                    color: "#3b82f6",
                    icon: "🔬",
                  },
                  {
                    label: "Recall",
                    value: 87.02,
                    color: "#f59e0b",
                    icon: "📡",
                  },
                  {
                    label: "F1 Score",
                    value: 91.02,
                    color: "#8b5cf6",
                    icon: "⚡",
                  },
                  {
                    label: "ROC-AUC",
                    value: 95.91,
                    color: "#ec4899",
                    icon: "📈",
                  },
                ].map((m, i) => (
                  <div key={i} style={{ marginBottom: "18px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "7px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span>{m.icon}</span>
                        <span
                          style={{
                            color: "#9ca3af",
                            fontSize: "13px",
                            fontWeight: 500,
                          }}
                        >
                          {m.label}
                        </span>
                      </div>
                      <span
                        style={{
                          color: m.color,
                          fontWeight: 800,
                          fontSize: "16px",
                        }}
                      >
                        {m.value}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: "8px",
                        background: "#1f2937",
                        borderRadius: "6px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${m.value}%`,
                          background: `linear-gradient(90deg,${m.color}88,${m.color})`,
                          borderRadius: "6px",
                          transition: "width 1.5s ease",
                          boxShadow: `0 0 8px ${m.color}44`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {/* Model details */}
                <div
                  style={{
                    background: "#0a0f1a",
                    border: "1px solid #1f2937",
                    borderRadius: "16px",
                    padding: "20px",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px",
                      fontSize: "15px",
                      fontWeight: 700,
                    }}
                  >
                    🤖 Model Details
                  </h3>
                  {[
                    {
                      label: "Algorithm",
                      value: "XGBoost Classifier",
                      color: "#60a5fa",
                    },
                    {
                      label: "Dataset Size",
                      value: "26,393 transactions",
                      color: "#9ca3af",
                    },
                    {
                      label: "Features Used",
                      value: "18 engineered features",
                      color: "#9ca3af",
                    },
                    {
                      label: "Train/Test Split",
                      value: "80% / 20%",
                      color: "#9ca3af",
                    },
                    {
                      label: "Fraud Rate in Data",
                      value: "17.22%",
                      color: "#f59e0b",
                    },
                    {
                      label: "Imbalance Handling",
                      value: "scale_pos_weight",
                      color: "#9ca3af",
                    },
                    {
                      label: "Anomaly Detection",
                      value: "Isolation Forest",
                      color: "#60a5fa",
                    },
                  ].map((d, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "9px 0",
                        borderBottom: "1px solid #0f172a",
                      }}
                    >
                      <span style={{ color: "#4b5563", fontSize: "13px" }}>
                        {d.label}
                      </span>
                      <span
                        style={{
                          color: d.color,
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Live usage */}
                <div
                  style={{
                    background: "#0a0f1a",
                    border: "1px solid #1f2937",
                    borderRadius: "16px",
                    padding: "20px",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px",
                      fontSize: "15px",
                      fontWeight: 700,
                    }}
                  >
                    📈 Live Model Usage
                  </h3>
                  {[
                    {
                      label: "Total Predictions",
                      value: transactions.length,
                      color: "#3b82f6",
                    },
                    {
                      label: "Fraud Flagged",
                      value: fraudTx.length,
                      color: "#ef4444",
                    },
                    {
                      label: "Safe Cleared",
                      value: transactions.length - fraudTx.length,
                      color: "#22c55e",
                    },
                    {
                      label: "Average Risk Score",
                      value: `${avgRisk}/100`,
                      color:
                        avgRisk >= 70
                          ? "#ef4444"
                          : avgRisk >= 30
                            ? "#f59e0b"
                            : "#22c55e",
                    },
                  ].map((d, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "9px 0",
                        borderBottom: "1px solid #0f172a",
                      }}
                    >
                      <span style={{ color: "#4b5563", fontSize: "13px" }}>
                        {d.label}
                      </span>
                      <span
                        style={{
                          color: d.color,
                          fontWeight: 800,
                          fontSize: "16px",
                        }}
                      >
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
