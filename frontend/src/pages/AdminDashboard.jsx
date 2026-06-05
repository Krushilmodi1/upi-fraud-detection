import { useState, useEffect, useCallback } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

const statusConfig = {
  pending: {
    bg: "#422006",
    color: "#fb923c",
    dot: "#f97316",
    label: "Pending",
  },
  reviewing: {
    bg: "#172554",
    color: "#60a5fa",
    dot: "#3b82f6",
    label: "Reviewing",
  },
  resolved: {
    bg: "#052e16",
    color: "#4ade80",
    dot: "#22c55e",
    label: "Resolved",
  },
  rejected: {
    bg: "#450a0a",
    color: "#f87171",
    dot: "#ef4444",
    label: "Rejected",
  },
};

const priorityConfig = {
  high: { color: "#ef4444", bg: "#450a0a", label: "🔴 HIGH" },
  medium: { color: "#f59e0b", bg: "#422006", label: "🟡 MEDIUM" },
  low: { color: "#22c55e", bg: "#052e16", label: "🟢 LOW" },
};

const LiveDot = ({ color }) => (
  <span
    style={{
      display: "inline-block",
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: color,
      marginRight: "6px",
      boxShadow: `0 0 6px ${color}`,
    }}
  />
);

const StatCard = ({ icon, label, value, sub, color, trend, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: "#0a0f1a",
      border: `1px solid ${color}33`,
      borderRadius: "14px",
      padding: "18px 20px",
      borderTop: `3px solid ${color}`,
      cursor: onClick ? "pointer" : "default",
      transition: "transform 0.15s",
    }}
    onMouseEnter={(e) => {
      if (onClick) e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "12px",
            color: "#6b7280",
            marginBottom: "8px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {label}
        </div>
        <div
          style={{ fontSize: "36px", fontWeight: 800, color, lineHeight: 1 }}
        >
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: "12px", color: "#4b5563", marginTop: "6px" }}>
            {sub}
          </div>
        )}
      </div>
      <div style={{ fontSize: "32px", opacity: 0.8 }}>{icon}</div>
    </div>
    {trend !== undefined && (
      <div
        style={{
          marginTop: "12px",
          height: "4px",
          background: "#1f2937",
          borderRadius: "4px",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(trend, 100)}%`,
            background: color,
            borderRadius: "4px",
            transition: "width 1s ease",
          }}
        />
      </div>
    )}
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [tab, setTab] = useState("overview");
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState("resolved");
  const [replying, setReplying] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [searchUser, setSearchUser] = useState("");
  const [searchTx, setSearchTx] = useState("");
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Handle tab from navbar hash
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (
      ["overview", "complaints", "users", "transactions", "model"].includes(
        hash,
      )
    ) {
      setTab(hash);
    }
  }, [location.hash]);

  useEffect(() => {
    fetchAll();
    const clock = setInterval(() => setTime(new Date()), 1000);
    // Auto-refresh every 60 seconds only
    const refresh = setInterval(() => {
      fetchAll(true);
    }, 60000);
    return () => {
      clearInterval(clock);
      clearInterval(refresh);
    };
  }, []);

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [cRes, uRes, tRes] = await Promise.all([
        API.get("/complaints/all"),
        API.get("/admin/users"),
        API.get("/admin/transactions"),
      ]);
      setComplaints(cRes.data.data || []);
      setUsers(uRes.data.data || []);
      setTransactions(tRes.data.data || []);
      setLastRefresh(new Date());
    } catch (err) {
      if (!silent) toast.error("Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleReply = async (id) => {
    if (!replyText.trim()) return toast.error("Write a reply first");
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
      toast.success("Status updated");
      fetchAll(true);
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Computed values
  const pendingCount = complaints.filter((c) => c.status === "pending").length;
  const reviewingCount = complaints.filter(
    (c) => c.status === "reviewing",
  ).length;
  const highPriority = complaints.filter(
    (c) => c.priority === "high" && c.status !== "resolved",
  ).length;
  const fraudCount = transactions.filter((t) => t.isFraud).length;
  const fraudRate =
    transactions.length > 0
      ? ((fraudCount / transactions.length) * 100).toFixed(1)
      : 0;
  const totalFraudAmt = transactions
    .filter((t) => t.isFraud)
    .reduce((s, t) => s + (t.amount || 0), 0);

  const filteredComplaints = complaints.filter((c) => {
    const statusOk = filterStatus === "all" || c.status === filterStatus;
    const priorityOk =
      filterPriority === "all" || c.priority === filterPriority;
    return statusOk && priorityOk;
  });

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchUser.toLowerCase()),
  );

  const filteredTx = transactions.filter(
    (t) =>
      !searchTx ||
      t.amount?.toString().includes(searchTx) ||
      (t.userId?.name || "").toLowerCase().includes(searchTx.toLowerCase()),
  );

  const s = {
    inp: {
      background: "#0a0f1a",
      color: "white",
      border: "1px solid #1f2937",
      borderRadius: "10px",
      padding: "10px 14px",
      fontSize: "14px",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
    },
    btn: (bg = "#2563eb", clr = "white") => ({
      background: bg,
      color: clr,
      border: "none",
      borderRadius: "8px",
      padding: "8px 16px",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "13px",
      transition: "opacity 0.15s",
    }),
  };

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
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "3px solid #1f2937",
            borderTop: "3px solid #dc2626",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} .fade{animation:fadeIn 0.3s ease forwards} .hr:hover{background:#0f1929!important}`}</style>
        <div style={{ color: "#6b7280" }}>Loading Admin Control Room...</div>
      </div>
    );

  return (
    <div style={{ minHeight: "100vh", background: "#030712", color: "white" }}>
      <style>{`
                @keyframes spin{to{transform:rotate(360deg)}}
                @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
                @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
                .fade{animation:fadeIn 0.3s ease forwards}
                .hr:hover{background:#0f1929!important}
                .nav-tab{padding:10px 18px;border:none;cursor:pointer;font-size:13px;font-weight:600;transition:all 0.2s;border-bottom:2px solid transparent;background:transparent;}
                .nav-tab:hover{color:white!important}
            `}</style>

      {/* ── Top Status Bar ── */}
      <div
        style={{
          background: "#050a14",
          borderBottom: "1px solid #1f2937",
          padding: "10px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#dc2626", fontSize: "18px" }}>🔧</span>
            <span
              style={{ fontWeight: 800, fontSize: "15px", color: "#f87171" }}
            >
              ADMIN CONTROL ROOM
            </span>
            <span
              style={{
                background: "#450a0a",
                color: "#f87171",
                fontSize: "10px",
                padding: "2px 8px",
                borderRadius: "4px",
                fontWeight: 700,
              }}
            >
              RESTRICTED
            </span>
          </div>

          {/* Live alerts */}
          {pendingCount > 0 && (
            <div
              onClick={() => {
                setTab("complaints");
                setFilterStatus("pending");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "#422006",
                border: "1px solid #d97706",
                borderRadius: "20px",
                padding: "3px 12px",
                cursor: "pointer",
              }}
            >
              <span
                style={{ animation: "pulse 1s infinite", fontSize: "10px" }}
              >
                🔔
              </span>
              <span
                style={{ color: "#fb923c", fontSize: "12px", fontWeight: 600 }}
              >
                {pendingCount} pending
              </span>
            </div>
          )}
          {highPriority > 0 && (
            <div
              onClick={() => {
                setTab("complaints");
                setFilterPriority("high");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "#450a0a",
                border: "1px solid #dc2626",
                borderRadius: "20px",
                padding: "3px 12px",
                cursor: "pointer",
                animation: "pulse 2s infinite",
              }}
            >
              <span style={{ fontSize: "10px" }}>🚨</span>
              <span
                style={{ color: "#f87171", fontSize: "12px", fontWeight: 600 }}
              >
                {highPriority} high priority
              </span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* Last refresh */}
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#4b5563", fontSize: "10px" }}>LAST SYNC</div>
            <div
              style={{
                color: "#6b7280",
                fontSize: "12px",
                fontFamily: "monospace",
              }}
            >
              {lastRefresh.toLocaleTimeString("en-IN")}
            </div>
          </div>
          {/* Clock */}
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#4b5563", fontSize: "10px" }}>
              SYSTEM TIME
            </div>
            <div
              style={{
                color: "#22c55e",
                fontSize: "14px",
                fontWeight: 700,
                fontFamily: "monospace",
              }}
            >
              {time.toLocaleTimeString("en-IN")}
            </div>
          </div>
          {/* Admin info */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "#450a0a",
                border: "2px solid #dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color: "#f87171",
                fontSize: "13px",
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600 }}>
                {user?.name}
              </div>
              <div
                style={{ fontSize: "10px", color: "#dc2626", fontWeight: 700 }}
              >
                ADMINISTRATOR
              </div>
            </div>
          </div>
          {/* Manual refresh */}
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            style={{
              ...s.btn("#1f2937"),
              opacity: refreshing ? 0.6 : 1,
              fontSize: "12px",
              padding: "6px 12px",
            }}
          >
            {refreshing ? "⟳" : "🔄"} Refresh
          </button>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div
        style={{
          background: "#050a14",
          borderBottom: "1px solid #0f172a",
          padding: "0 28px",
          display: "flex",
          gap: "4px",
        }}
      >
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
            className="nav-tab"
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
      </div>

      <div style={{ padding: "24px 28px" }}>
        {/* ══ OVERVIEW TAB ══════════════════════════════════════════════ */}
        {tab === "overview" && (
          <div className="fade">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    margin: "0 0 4px",
                  }}
                >
                  System Overview
                </h2>
                <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
                  Real-time platform monitoring • Auto-refreshes every 60s
                </p>
              </div>
            </div>

            {/* KPI Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <StatCard
                icon="👥"
                label="Total Users"
                value={users.length}
                sub="registered accounts"
                color="#3b82f6"
                trend={(users.length / 100) * 100}
                onClick={() => setTab("users")}
              />
              <StatCard
                icon="💳"
                label="Transactions"
                value={transactions.length}
                sub="ML analyzed"
                color="#8b5cf6"
                trend={(transactions.length / 200) * 100}
                onClick={() => setTab("transactions")}
              />
              <StatCard
                icon="🚨"
                label="Fraud Detected"
                value={fraudCount}
                sub={`₹${totalFraudAmt.toLocaleString("en-IN")} total`}
                color="#ef4444"
                trend={parseFloat(fraudRate)}
                onClick={() => setTab("transactions")}
              />
              <StatCard
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

            {/* High priority alert */}
            {highPriority > 0 && (
              <div
                onClick={() => {
                  setTab("complaints");
                  setFilterPriority("high");
                }}
                style={{
                  background: "#450a0a",
                  border: "1px solid #dc2626",
                  borderRadius: "12px",
                  padding: "14px 20px",
                  marginBottom: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <span
                    style={{ fontSize: "24px", animation: "pulse 1s infinite" }}
                  >
                    🚨
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, color: "#fca5a5" }}>
                      {highPriority} HIGH PRIORITY complaint
                      {highPriority > 1 ? "s" : ""} need immediate attention
                    </div>
                    <div style={{ fontSize: "13px", color: "#f87171" }}>
                      Click to view and respond — these are critical user issues
                    </div>
                  </div>
                </div>
                <span style={{ color: "#f87171", fontSize: "20px" }}>→</span>
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
                  borderRadius: "14px",
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
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>
                    📋 Recent Complaints
                  </h3>
                  <button
                    onClick={() => setTab("complaints")}
                    style={s.btn("#1f2937")}
                  >
                    View all →
                  </button>
                </div>
                {complaints.length === 0 ? (
                  <div
                    style={{
                      color: "#4b5563",
                      textAlign: "center",
                      padding: "20px",
                      fontSize: "13px",
                    }}
                  >
                    No complaints yet
                  </div>
                ) : (
                  complaints.slice(0, 6).map((c, i) => (
                    <div
                      key={i}
                      className="hr"
                      onClick={() => {
                        setTab("complaints");
                        setSelectedId(c._id);
                      }}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 8px",
                        borderRadius: "8px",
                        borderBottom: "1px solid #0f172a",
                        cursor: "pointer",
                        transition: "background 0.15s",
                        borderLeft: `3px solid ${priorityConfig[c.priority]?.color || "#6b7280"}`,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, marginLeft: "8px" }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.subject}
                        </div>
                        <div style={{ fontSize: "11px", color: "#6b7280" }}>
                          {c.userName} •{" "}
                          {new Date(c.createdAt).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          alignItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        <LiveDot
                          color={statusConfig[c.status]?.dot || "#6b7280"}
                        />
                        <span
                          style={{
                            fontSize: "11px",
                            color: statusConfig[c.status]?.color,
                          }}
                        >
                          {statusConfig[c.status]?.label}
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
                  borderRadius: "14px",
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
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>
                    💳 Recent Transactions
                  </h3>
                  <button
                    onClick={() => setTab("transactions")}
                    style={s.btn("#1f2937")}
                  >
                    View all →
                  </button>
                </div>
                {transactions.length === 0 ? (
                  <div
                    style={{
                      color: "#4b5563",
                      textAlign: "center",
                      padding: "20px",
                      fontSize: "13px",
                    }}
                  >
                    No transactions yet
                  </div>
                ) : (
                  transactions.slice(0, 6).map((t, i) => (
                    <div
                      key={i}
                      className="hr"
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
                        <span style={{ fontSize: "16px" }}>
                          {t.isFraud ? "🚨" : "✅"}
                        </span>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600 }}>
                            ₹{t.amount?.toLocaleString("en-IN")}
                          </div>
                          <div style={{ fontSize: "11px", color: "#6b7280" }}>
                            {new Date(t.createdAt).toLocaleDateString("en-IN")}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
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
                  borderRadius: "14px",
                  padding: "20px",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 16px",
                    fontSize: "15px",
                    fontWeight: 600,
                  }}
                >
                  📊 Complaint Status
                </h3>
                {Object.entries(statusConfig).map(([key, cfg]) => {
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
                          marginBottom: "5px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <LiveDot color={cfg.dot} />
                          <span style={{ fontSize: "13px", color: cfg.color }}>
                            {cfg.label}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "white",
                          }}
                        >
                          {count}
                        </span>
                      </div>
                      <div
                        style={{
                          height: "6px",
                          background: "#1f2937",
                          borderRadius: "4px",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: cfg.dot,
                            borderRadius: "4px",
                            transition: "width 1s ease",
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
                  borderRadius: "14px",
                  padding: "20px",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 16px",
                    fontSize: "15px",
                    fontWeight: 600,
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
                    label: "Admin Accounts",
                    value: users.filter((u) => u.role === "admin").length,
                    color: "#ef4444",
                  },
                  {
                    label: "Fraud Rate",
                    value: `${fraudRate}%`,
                    color: "#ef4444",
                  },
                  {
                    label: "Safe Transactions",
                    value: transactions.filter((t) => !t.isFraud).length,
                    color: "#22c55e",
                  },
                  {
                    label: "Total Fraud Amount",
                    value: `₹${totalFraudAmt.toLocaleString("en-IN")}`,
                    color: "#ef4444",
                  },
                  {
                    label: "Complaints Resolved",
                    value: complaints.filter((c) => c.status === "resolved")
                      .length,
                    color: "#22c55e",
                  },
                  {
                    label: "Users with Complaints",
                    value: [...new Set(complaints.map((c) => c.userEmail))]
                      .length,
                    color: "#f59e0b",
                  },
                ].map((row, i) => (
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
                    <span style={{ color: "#9ca3af", fontSize: "13px" }}>
                      {row.label}
                    </span>
                    <span
                      style={{
                        color: row.color,
                        fontWeight: 700,
                        fontSize: "15px",
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ COMPLAINTS TAB ════════════════════════════════════════════ */}
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
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    margin: "0 0 4px",
                  }}
                >
                  Complaint Management
                </h2>
                <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
                  {filteredComplaints.length} complaint
                  {filteredComplaints.length !== 1 ? "s" : ""} shown
                </p>
              </div>
              <button onClick={() => fetchAll(true)} style={s.btn("#1f2937")}>
                🔄 Refresh
              </button>
            </div>

            {/* Filters */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "16px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span
                style={{ color: "#6b7280", fontSize: "12px", fontWeight: 600 }}
              >
                STATUS:
              </span>
              {["all", "pending", "reviewing", "resolved", "rejected"].map(
                (f) => (
                  <button
                    key={f}
                    onClick={() => setFilterStatus(f)}
                    style={{
                      ...s.btn(
                        filterStatus === f
                          ? f === "pending"
                            ? "#422006"
                            : f === "resolved"
                              ? "#052e16"
                              : f === "rejected"
                                ? "#450a0a"
                                : f === "reviewing"
                                  ? "#172554"
                                  : "#374151"
                          : "#0a0f1a",
                      ),
                      color:
                        filterStatus === f
                          ? statusConfig[f]?.color || "white"
                          : "#6b7280",
                      border: `1px solid ${filterStatus === f ? statusConfig[f]?.dot || "#374151" : "#1f2937"}`,
                      padding: "5px 12px",
                      fontSize: "12px",
                    }}
                  >
                    {f === "all"
                      ? `All (${complaints.length})`
                      : `${statusConfig[f]?.label} (${complaints.filter((c) => c.status === f).length})`}
                  </button>
                ),
              )}
              <span
                style={{
                  color: "#6b7280",
                  fontSize: "12px",
                  fontWeight: 600,
                  marginLeft: "8px",
                }}
              >
                PRIORITY:
              </span>
              {["all", "high", "medium", "low"].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  style={{
                    ...s.btn(
                      filterPriority === p
                        ? priorityConfig[p]?.bg || "#374151"
                        : "#0a0f1a",
                    ),
                    color:
                      filterPriority === p
                        ? priorityConfig[p]?.color || "white"
                        : "#6b7280",
                    border: `1px solid ${filterPriority === p ? (priorityConfig[p]?.color || "#374151") + "88" : "#1f2937"}`,
                    padding: "5px 12px",
                    fontSize: "12px",
                  }}
                >
                  {p === "all" ? "All" : priorityConfig[p]?.label}
                </button>
              ))}
            </div>

            {filteredComplaints.length === 0 ? (
              <div
                style={{
                  background: "#0a0f1a",
                  border: "1px solid #1f2937",
                  borderRadius: "14px",
                  padding: "60px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
                <div style={{ color: "#6b7280" }}>
                  No complaints match this filter
                </div>
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
                  const pCfg = priorityConfig[c.priority] || priorityConfig.low;
                  const sCfg = statusConfig[c.status] || statusConfig.pending;

                  return (
                    <div
                      key={c._id}
                      style={{
                        background: "#0a0f1a",
                        border: `1px solid ${isOpen ? "#2563eb" : pCfg.color + "44"}`,
                        borderRadius: "14px",
                        padding: "18px 20px",
                        borderLeft: `4px solid ${pCfg.color}`,
                        transition: "border 0.2s",
                      }}
                    >
                      {/* Header */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
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
                            <span style={{ fontWeight: 700, fontSize: "15px" }}>
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
                              }}
                            >
                              <LiveDot color={sCfg.dot} />
                              {sCfg.label}
                            </span>
                            <span
                              style={{
                                background: pCfg.bg,
                                color: pCfg.color,
                                padding: "2px 8px",
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
                                  padding: "2px 8px",
                                  borderRadius: "10px",
                                  fontSize: "11px",
                                }}
                              >
                                ✅ Replied
                              </span>
                            )}
                          </div>
                          <div style={{ color: "#6b7280", fontSize: "12px" }}>
                            👤{" "}
                            <strong style={{ color: "#9ca3af" }}>
                              {c.userName}
                            </strong>{" "}
                            ({c.userEmail})
                            {c.amount > 0
                              ? ` • ₹${c.amount.toLocaleString("en-IN")}`
                              : ""}
                            {` • ${c.category.replace("_", " ").toUpperCase()}`}
                            {` • ${new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexShrink: 0,
                            alignItems: "center",
                          }}
                        >
                          <select
                            value={c.status}
                            onChange={(e) =>
                              handleStatusChange(c._id, e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              ...s.inp,
                              width: "auto",
                              padding: "6px 10px",
                              fontSize: "12px",
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          <button
                            onClick={() => {
                              setSelectedId(isOpen ? null : c._id);
                              setReplyText("");
                            }}
                            style={s.btn(isOpen ? "#374151" : "#1d4ed8")}
                          >
                            {isOpen ? "✕ Close" : "💬 Reply"}
                          </button>
                        </div>
                      </div>

                      {/* Preview */}
                      <div
                        style={{
                          color: "#9ca3af",
                          fontSize: "13px",
                          lineHeight: 1.6,
                        }}
                      >
                        {c.description.substring(0, 180)}
                        {c.description.length > 180 ? "..." : ""}
                      </div>

                      {/* ── Expanded Reply Panel ── */}
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
                                  color: "#6b7280",
                                  fontSize: "11px",
                                  marginBottom: "6px",
                                  textTransform: "uppercase",
                                }}
                              >
                                Full Complaint
                              </div>
                              <div
                                style={{
                                  background: "#050a14",
                                  borderRadius: "10px",
                                  padding: "12px",
                                  fontSize: "13px",
                                  color: "#d1d5db",
                                  lineHeight: 1.7,
                                  maxHeight: "160px",
                                  overflowY: "auto",
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {c.description}
                              </div>
                              {c.transactionId && (
                                <div
                                  style={{
                                    marginTop: "8px",
                                    fontSize: "12px",
                                    color: "#6b7280",
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
                                      color: "#6b7280",
                                      fontSize: "11px",
                                      marginBottom: "6px",
                                      textTransform: "uppercase",
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
                                      padding: "12px",
                                      fontSize: "13px",
                                      color: "#93c5fd",
                                      lineHeight: 1.6,
                                      maxHeight: "160px",
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
                                    color: "#4b5563",
                                    fontSize: "13px",
                                    padding: "20px",
                                    textAlign: "center",
                                    background: "#050a14",
                                    borderRadius: "10px",
                                  }}
                                >
                                  No previous reply
                                </div>
                              )}
                            </div>
                          </div>

                          <div
                            style={{
                              color: "#6b7280",
                              fontSize: "11px",
                              marginBottom: "6px",
                              textTransform: "uppercase",
                            }}
                          >
                            Write Reply
                          </div>
                          <textarea
                            style={{
                              ...s.inp,
                              minHeight: "90px",
                              resize: "vertical",
                              marginBottom: "10px",
                            }}
                            placeholder="Write your reply to the user... Be clear and helpful."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            autoFocus
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
                              style={{ ...s.inp, width: "auto" }}
                            >
                              <option value="resolved">✅ Mark Resolved</option>
                              <option value="reviewing">
                                🔍 Mark Reviewing
                              </option>
                              <option value="rejected">❌ Mark Rejected</option>
                            </select>
                            <button
                              onClick={() => handleReply(c._id)}
                              disabled={replying || !replyText.trim()}
                              style={{
                                ...s.btn("#16a34a"),
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
                              style={s.btn("#374151")}
                            >
                              Cancel
                            </button>
                            <span
                              style={{
                                color: "#4b5563",
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

        {/* ══ USERS TAB ════════════════════════════════════════════════ */}
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
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    margin: "0 0 4px",
                  }}
                >
                  User Management
                </h2>
                <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
                  {filteredUsers.length} of {users.length} users
                </p>
              </div>
              <input
                style={{ ...s.inp, width: "260px" }}
                placeholder="🔍 Search by name or email..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
              />
            </div>

            <div
              style={{
                background: "#0a0f1a",
                border: "1px solid #1f2937",
                borderRadius: "14px",
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
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
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
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#4b5563",
                  }}
                >
                  No users found
                </div>
              ) : (
                filteredUsers.map((u, i) => {
                  const userComplaints = complaints.filter(
                    (c) => c.userEmail === u.email,
                  ).length;
                  const userFraud = transactions.filter(
                    (t) => t.userId === u._id?.toString() && t.isFraud,
                  ).length;
                  return (
                    <div
                      key={i}
                      className="hr"
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
                              u.role === "admin" ? "#450a0a" : "#0f2942",
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
                        <span style={{ fontWeight: 500, fontSize: "14px" }}>
                          {u.name}
                        </span>
                      </div>
                      <span style={{ color: "#9ca3af", fontSize: "13px" }}>
                        {u.email}
                      </span>
                      <span
                        style={{
                          background:
                            u.role === "admin" ? "#450a0a" : "#0f2942",
                          color: u.role === "admin" ? "#f87171" : "#60a5fa",
                          padding: "2px 10px",
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
                          color: userComplaints > 0 ? "#f59e0b" : "#4b5563",
                          fontWeight: userComplaints > 0 ? 700 : 400,
                        }}
                      >
                        {userComplaints}
                      </span>
                      <span
                        style={{
                          color: userFraud > 0 ? "#ef4444" : "#4b5563",
                          fontWeight: userFraud > 0 ? 700 : 400,
                        }}
                      >
                        {userFraud}
                      </span>
                      <span style={{ color: "#6b7280", fontSize: "12px" }}>
                        {new Date(u.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ══ TRANSACTIONS TAB ═════════════════════════════════════════ */}
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
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    margin: "0 0 4px",
                  }}
                >
                  Transaction Monitor
                </h2>
                <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
                  All ML-analyzed transactions • Fraud rate: {fraudRate}%
                </p>
              </div>
              <input
                style={{ ...s.inp, width: "240px" }}
                placeholder="🔍 Search amount or user..."
                value={searchTx}
                onChange={(e) => setSearchTx(e.target.value)}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <StatCard
                icon="💳"
                label="Total"
                value={transactions.length}
                color="#3b82f6"
              />
              <StatCard
                icon="🚨"
                label="Fraud"
                value={fraudCount}
                sub={`${fraudRate}%`}
                color="#ef4444"
              />
              <StatCard
                icon="✅"
                label="Safe"
                value={transactions.filter((t) => !t.isFraud).length}
                color="#22c55e"
              />
              <StatCard
                icon="💰"
                label="Fraud Amount"
                value={`₹${(totalFraudAmt / 1000).toFixed(0)}K`}
                color="#f59e0b"
              />
            </div>

            <div
              style={{
                background: "#0a0f1a",
                border: "1px solid #1f2937",
                borderRadius: "14px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr 1fr",
                  padding: "12px 20px",
                  background: "#050a14",
                  borderBottom: "1px solid #1f2937",
                  fontSize: "11px",
                  color: "#6b7280",
                  textTransform: "uppercase",
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
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#4b5563",
                  }}
                >
                  No transactions found
                </div>
              ) : (
                filteredTx.map((t, i) => (
                  <div
                    key={i}
                    className="hr"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr 1fr",
                      padding: "14px 20px",
                      borderBottom: "1px solid #0f172a",
                      alignItems: "center",
                      borderLeft: `3px solid ${t.isFraud ? "#dc2626" : "#16a34a"}`,
                      transition: "background 0.15s",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: "15px" }}>
                      ₹{t.amount?.toLocaleString("en-IN")}
                    </span>
                    <span style={{ color: "#9ca3af", fontSize: "13px" }}>
                      {t.userId?.name || "Unknown"}
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
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
                        color:
                          t.riskTier === "High"
                            ? "#ef4444"
                            : t.riskTier === "Medium"
                              ? "#f59e0b"
                              : "#22c55e",
                        fontSize: "13px",
                        fontWeight: 600,
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
                    <span style={{ color: "#6b7280", fontSize: "12px" }}>
                      {new Date(t.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ══ ML MODEL TAB ═════════════════════════════════════════════ */}
        {tab === "model" && (
          <div className="fade">
            <div style={{ marginBottom: "20px" }}>
              <h2
                style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 4px" }}
              >
                ML Model Performance
              </h2>
              <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
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
              <div
                style={{
                  background: "#0a0f1a",
                  border: "1px solid #1f2937",
                  borderRadius: "14px",
                  padding: "24px",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px",
                    fontSize: "15px",
                    fontWeight: 600,
                  }}
                >
                  📊 Performance Metrics
                </h3>
                {[
                  { label: "Accuracy", value: 97.04, color: "#22c55e" },
                  { label: "Precision", value: 95.42, color: "#3b82f6" },
                  { label: "Recall", value: 87.02, color: "#f59e0b" },
                  { label: "F1 Score", value: 91.02, color: "#8b5cf6" },
                  { label: "ROC-AUC", value: 95.91, color: "#ec4899" },
                ].map((m, i) => (
                  <div key={i} style={{ marginBottom: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                      }}
                    >
                      <span style={{ color: "#9ca3af", fontSize: "13px" }}>
                        {m.label}
                      </span>
                      <span style={{ color: m.color, fontWeight: 700 }}>
                        {m.value}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: "8px",
                        background: "#1f2937",
                        borderRadius: "4px",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${m.value}%`,
                          background: m.color,
                          borderRadius: "4px",
                          transition: "width 1.5s ease",
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
                <div
                  style={{
                    background: "#0a0f1a",
                    border: "1px solid #1f2937",
                    borderRadius: "14px",
                    padding: "20px",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px",
                      fontSize: "15px",
                      fontWeight: 600,
                    }}
                  >
                    🤖 Model Details
                  </h3>
                  {[
                    { label: "Algorithm", value: "XGBoost Classifier" },
                    { label: "Dataset Size", value: "26,393 transactions" },
                    { label: "Features Used", value: "18 engineered features" },
                    { label: "Train/Test Split", value: "80% / 20%" },
                    { label: "Fraud Rate in Data", value: "17.22%" },
                    { label: "Imbalance Handling", value: "scale_pos_weight" },
                    { label: "Anomaly Detection", value: "Isolation Forest" },
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
                      <span style={{ color: "#6b7280", fontSize: "13px" }}>
                        {d.label}
                      </span>
                      <span
                        style={{
                          color: "#e2e8f0",
                          fontSize: "13px",
                          fontWeight: 500,
                        }}
                      >
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    background: "#0a0f1a",
                    border: "1px solid #1f2937",
                    borderRadius: "14px",
                    padding: "20px",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 12px",
                      fontSize: "15px",
                      fontWeight: 600,
                    }}
                  >
                    📈 Live Model Usage
                  </h3>
                  {[
                    {
                      label: "Predictions Made",
                      value: transactions.length,
                      color: "#3b82f6",
                    },
                    {
                      label: "Fraud Flagged",
                      value: fraudCount,
                      color: "#ef4444",
                    },
                    {
                      label: "Safe Cleared",
                      value: transactions.length - fraudCount,
                      color: "#22c55e",
                    },
                    {
                      label: "Avg Risk Score",
                      value:
                        transactions.length > 0
                          ? Math.round(
                              transactions.reduce(
                                (s, t) => s + t.riskScore,
                                0,
                              ) / transactions.length,
                            )
                          : 0,
                      color: "#f59e0b",
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
                      <span style={{ color: "#6b7280", fontSize: "13px" }}>
                        {d.label}
                      </span>
                      <span
                        style={{
                          color: d.color,
                          fontSize: "15px",
                          fontWeight: 700,
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
