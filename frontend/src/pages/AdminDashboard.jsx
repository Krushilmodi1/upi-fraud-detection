import { useState, useEffect, useCallback } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

const statusConfig = {
  pending: {
    bg: { dark: "#422006", light: "#fff7ed" },
    color: { dark: "#fb923c", light: "#c2410c" },
    dot: { dark: "#f97316", light: "#ea580c" },
    label: "Pending",
  },
  reviewing: {
    bg: { dark: "#172554", light: "#eff6ff" },
    color: { dark: "#60a5fa", light: "#1d4ed8" },
    dot: { dark: "#3b82f6", light: "#2563eb" },
    label: "Reviewing",
  },
  resolved: {
    bg: { dark: "#052e16", light: "#f0fdf4" },
    color: { dark: "#4ade80", light: "#15803d" },
    dot: { dark: "#22c55e", light: "#16a34a" },
    label: "Resolved",
  },
  rejected: {
    bg: { dark: "#450a0a", light: "#fef2f2" },
    color: { dark: "#f87171", light: "#dc2626" },
    dot: { dark: "#ef4444", light: "#ef4444" },
    label: "Rejected",
  },
};

const priorityConfig = {
  high: {
    color: { dark: "#ef4444", light: "#dc2626" },
    bg: { dark: "#450a0a", light: "#fef2f2" },
    label: "🔴 HIGH",
  },
  medium: {
    color: { dark: "#f59e0b", light: "#d97706" },
    bg: { dark: "#422006", light: "#fffbeb" },
    label: "🟡 MEDIUM",
  },
  low: {
    color: { dark: "#22c55e", light: "#16a34a" },
    bg: { dark: "#052e16", light: "#f0fdf4" },
    label: "🟢 LOW",
  },
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
    }}
  />
);

const StatCard = ({ icon, label, value, sub, color, trend, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: "var(--card-bg)",
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
            color: "var(--text-muted)",
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
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-subtle)",
              marginTop: "6px",
            }}
          >
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
          background: "var(--border-color)",
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
  const [theme, setTheme] = useState("dark");
  const isDark = theme === "dark";

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

  // Theme CSS variables injected via a style tag
  const themeVars = isDark
    ? {
        "--page-bg": "#030712",
        "--topbar-bg": "#050a14",
        "--card-bg": "#0a0f1a",
        "--card-inner-bg": "#050a14",
        "--border-color": "#1f2937",
        "--border-subtle": "#0f172a",
        "--text-primary": "#ffffff",
        "--text-secondary": "#9ca3af",
        "--text-muted": "#6b7280",
        "--text-subtle": "#4b5563",
        "--accent": "#dc2626",
        "--accent-bg": "#450a0a",
        "--accent-text": "#f87171",
        "--accent-border": "#dc2626",
        "--select-bg": "#0a0f1a",
        "--input-bg": "#0a0f1a",
        "--btn-neutral-bg": "#1f2937",
        "--btn-neutral-text": "#ffffff",
        "--clock-color": "#22c55e",
        "--header-grid-bg": "#050a14",
        "--fraud-border": "#dc2626",
        "--safe-border": "#16a34a",
      }
    : {
        "--page-bg": "#f8fafc",
        "--topbar-bg": "#ffffff",
        "--card-bg": "#ffffff",
        "--card-inner-bg": "#f1f5f9",
        "--border-color": "#e2e8f0",
        "--border-subtle": "#f1f5f9",
        "--text-primary": "#0f172a",
        "--text-secondary": "#475569",
        "--text-muted": "#64748b",
        "--text-subtle": "#94a3b8",
        "--accent": "#dc2626",
        "--accent-bg": "#fef2f2",
        "--accent-text": "#dc2626",
        "--accent-border": "#fca5a5",
        "--select-bg": "#ffffff",
        "--input-bg": "#ffffff",
        "--btn-neutral-bg": "#f1f5f9",
        "--btn-neutral-text": "#0f172a",
        "--clock-color": "#16a34a",
        "--header-grid-bg": "#f8fafc",
        "--fraud-border": "#dc2626",
        "--safe-border": "#16a34a",
      };

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

  const t = (cfg) => cfg[isDark ? "dark" : "light"];

  const pendingCount = complaints.filter((c) => c.status === "pending").length;
  const reviewingCount = complaints.filter(
    (c) => c.status === "reviewing",
  ).length;
  const highPriority = complaints.filter(
    (c) => c.priority === "high" && c.status !== "resolved",
  ).length;
  const fraudCount = transactions.filter((tx) => tx.isFraud).length;
  const fraudRate =
    transactions.length > 0
      ? ((fraudCount / transactions.length) * 100).toFixed(1)
      : 0;
  const totalFraudAmt = transactions
    .filter((tx) => tx.isFraud)
    .reduce((s, tx) => s + (tx.amount || 0), 0);

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
    (tx) =>
      !searchTx ||
      tx.amount?.toString().includes(searchTx) ||
      (tx.userId?.name || "").toLowerCase().includes(searchTx.toLowerCase()),
  );

  const s = {
    inp: {
      background: "var(--input-bg)",
      color: "var(--text-primary)",
      border: "1px solid var(--border-color)",
      borderRadius: "10px",
      padding: "10px 14px",
      fontSize: "14px",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
    },
    btn: (bg, clr) => ({
      background: bg || "var(--btn-neutral-bg)",
      color: clr || "var(--btn-neutral-text)",
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
          background: "var(--page-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
          ...themeVars,
        }}
      >
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "3px solid var(--border-color)",
            borderTop: "3px solid #dc2626",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <div style={{ color: "var(--text-muted)" }}>
          Loading Admin Control Room...
        </div>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--page-bg)",
        color: "var(--text-primary)",
        ...themeVars,
      }}
    >
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fade{animation:fadeIn 0.3s ease forwards}
        .hr:hover{background:var(--card-inner-bg)!important}
        .nav-tab{padding:10px 18px;border:none;cursor:pointer;font-size:13px;font-weight:600;transition:all 0.2s;border-bottom:2px solid transparent;background:transparent;color:var(--text-muted);}
        .nav-tab:hover{color:var(--text-primary)!important}
        .theme-toggle{background:var(--btn-neutral-bg);color:var(--btn-neutral-text);border:1px solid var(--border-color);borderRadius:8px;padding:6px 12px;cursor:pointer;font-size:13px;font-weight:600;}
        .theme-toggle:hover{opacity:0.8;}
      `}</style>

      {/* ── Top Status Bar ── */}
      <div
        style={{
          background: "var(--topbar-bg)",
          borderBottom: "1px solid var(--border-color)",
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
              style={{
                fontWeight: 800,
                fontSize: "15px",
                color: "var(--accent-text)",
              }}
            >
              ADMIN CONTROL ROOM
            </span>
            <span
              style={{
                background: "var(--accent-bg)",
                color: "var(--accent-text)",
                fontSize: "10px",
                padding: "2px 8px",
                borderRadius: "4px",
                fontWeight: 700,
              }}
            >
              RESTRICTED
            </span>
          </div>
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
                background: isDark ? "#422006" : "#fff7ed",
                border: `1px solid ${isDark ? "#d97706" : "#fb923c"}`,
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
                style={{
                  color: isDark ? "#fb923c" : "#c2410c",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
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
                background: "var(--accent-bg)",
                border: `1px solid var(--accent-border)`,
                borderRadius: "20px",
                padding: "3px 12px",
                cursor: "pointer",
                animation: "pulse 2s infinite",
              }}
            >
              <span style={{ fontSize: "10px" }}>🚨</span>
              <span
                style={{
                  color: "var(--accent-text)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                {highPriority} high priority
              </span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>

          <div style={{ textAlign: "right" }}>
            <div style={{ color: "var(--text-subtle)", fontSize: "10px" }}>
              LAST SYNC
            </div>
            <div
              style={{
                color: "var(--text-muted)",
                fontSize: "12px",
                fontFamily: "monospace",
              }}
            >
              {lastRefresh.toLocaleTimeString("en-IN")}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "var(--text-subtle)", fontSize: "10px" }}>
              SYSTEM TIME
            </div>
            <div
              style={{
                color: "var(--clock-color)",
                fontSize: "14px",
                fontWeight: 700,
                fontFamily: "monospace",
              }}
            >
              {time.toLocaleTimeString("en-IN")}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "var(--accent-bg)",
                border: `2px solid var(--accent)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color: "var(--accent-text)",
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
                style={{
                  fontSize: "10px",
                  color: "var(--accent)",
                  fontWeight: 700,
                }}
              >
                ADMINISTRATOR
              </div>
            </div>
          </div>
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            style={{
              ...s.btn(),
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
          background: "var(--topbar-bg)",
          borderBottom: "1px solid var(--border-subtle)",
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
        ].map((tb) => (
          <button
            key={tb.id}
            className="nav-tab"
            onClick={() => setTab(tb.id)}
            style={{
              color: tab === tb.id ? "var(--accent)" : "var(--text-muted)",
              borderBottom:
                tab === tb.id
                  ? `2px solid var(--accent)`
                  : "2px solid transparent",
            }}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "24px 28px" }}>
        {/* ══ OVERVIEW TAB ══ */}
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
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "13px",
                    margin: 0,
                  }}
                >
                  Real-time platform monitoring • Auto-refreshes every 60s
                </p>
              </div>
            </div>

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

            {highPriority > 0 && (
              <div
                onClick={() => {
                  setTab("complaints");
                  setFilterPriority("high");
                }}
                style={{
                  background: "var(--accent-bg)",
                  border: `1px solid var(--accent)`,
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
                    <div
                      style={{ fontWeight: 700, color: "var(--accent-text)" }}
                    >
                      {highPriority} HIGH PRIORITY complaint
                      {highPriority > 1 ? "s" : ""} need immediate attention
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--accent)" }}>
                      Click to view and respond — these are critical user issues
                    </div>
                  </div>
                </div>
                <span style={{ color: "var(--accent)", fontSize: "20px" }}>
                  →
                </span>
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
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
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
                  <button onClick={() => setTab("complaints")} style={s.btn()}>
                    View all →
                  </button>
                </div>
                {complaints.length === 0 ? (
                  <div
                    style={{
                      color: "var(--text-subtle)",
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
                        borderBottom: "1px solid var(--border-subtle)",
                        cursor: "pointer",
                        transition: "background 0.15s",
                        borderLeft: `3px solid ${t(priorityConfig[c.priority]?.color) || "#6b7280"}`,
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
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                          }}
                        >
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
                          color={t(statusConfig[c.status]?.dot) || "#6b7280"}
                        />
                        <span
                          style={{
                            fontSize: "11px",
                            color: t(statusConfig[c.status]?.color),
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
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
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
                    style={s.btn()}
                  >
                    View all →
                  </button>
                </div>
                {transactions.length === 0 ? (
                  <div
                    style={{
                      color: "var(--text-subtle)",
                      textAlign: "center",
                      padding: "20px",
                      fontSize: "13px",
                    }}
                  >
                    No transactions yet
                  </div>
                ) : (
                  transactions.slice(0, 6).map((tx, i) => (
                    <div
                      key={i}
                      className="hr"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 8px",
                        borderRadius: "8px",
                        borderBottom: "1px solid var(--border-subtle)",
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
                          {tx.isFraud ? "🚨" : "✅"}
                        </span>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600 }}>
                            ₹{tx.amount?.toLocaleString("en-IN")}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--text-muted)",
                            }}
                          >
                            {new Date(tx.createdAt).toLocaleDateString("en-IN")}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color:
                              tx.riskScore >= 70
                                ? "#ef4444"
                                : tx.riskScore >= 30
                                  ? "#f59e0b"
                                  : "#22c55e",
                          }}
                        >
                          {tx.riskScore}/100
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            color: "var(--text-subtle)",
                          }}
                        >
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
              {/* Status Breakdown */}
              <div
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
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
                          <LiveDot color={t(cfg.dot)} />
                          <span
                            style={{ fontSize: "13px", color: t(cfg.color) }}
                          >
                            {cfg.label}
                          </span>
                        </div>
                        <span style={{ fontSize: "13px", fontWeight: 700 }}>
                          {count}
                        </span>
                      </div>
                      <div
                        style={{
                          height: "6px",
                          background: "var(--border-color)",
                          borderRadius: "4px",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: t(cfg.dot),
                            borderRadius: "4px",
                            transition: "width 1s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Platform Stats */}
              <div
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
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
                    value: transactions.filter((tx) => !tx.isFraud).length,
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
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "13px",
                      }}
                    >
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

        {/* ══ COMPLAINTS TAB ══ */}
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
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "13px",
                    margin: 0,
                  }}
                >
                  {filteredComplaints.length} complaint
                  {filteredComplaints.length !== 1 ? "s" : ""} shown
                </p>
              </div>
              <button onClick={() => fetchAll(true)} style={s.btn()}>
                🔄 Refresh
              </button>
            </div>

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
                style={{
                  color: "var(--text-muted)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
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
                          ? statusConfig[f]
                            ? t(statusConfig[f].bg)
                            : isDark
                              ? "#374151"
                              : "#e2e8f0"
                          : "var(--card-bg)",
                      ),
                      color:
                        filterStatus === f
                          ? statusConfig[f]
                            ? t(statusConfig[f].color)
                            : "var(--text-primary)"
                          : "var(--text-muted)",
                      border: `1px solid ${filterStatus === f ? (statusConfig[f] ? t(statusConfig[f].dot) : "var(--border-color)") : "var(--border-color)"}`,
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
                  color: "var(--text-muted)",
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
                        ? priorityConfig[p]
                          ? t(priorityConfig[p].bg)
                          : isDark
                            ? "#374151"
                            : "#e2e8f0"
                        : "var(--card-bg)",
                    ),
                    color:
                      filterPriority === p
                        ? priorityConfig[p]
                          ? t(priorityConfig[p].color)
                          : "var(--text-primary)"
                        : "var(--text-muted)",
                    border: `1px solid ${filterPriority === p ? (priorityConfig[p] ? t(priorityConfig[p].color) + "88" : "var(--border-color)") : "var(--border-color)"}`,
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
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "14px",
                  padding: "60px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
                <div style={{ color: "var(--text-muted)" }}>
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
                        background: "var(--card-bg)",
                        border: `1px solid ${isOpen ? "#2563eb" : t(pCfg.color) + "44"}`,
                        borderRadius: "14px",
                        padding: "18px 20px",
                        borderLeft: `4px solid ${t(pCfg.color)}`,
                        transition: "border 0.2s",
                      }}
                    >
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
                                background: t(sCfg.bg),
                                color: t(sCfg.color),
                                padding: "2px 10px",
                                borderRadius: "20px",
                                fontSize: "11px",
                                fontWeight: 600,
                              }}
                            >
                              <LiveDot color={t(sCfg.dot)} />
                              {sCfg.label}
                            </span>
                            <span
                              style={{
                                background: t(pCfg.bg),
                                color: t(pCfg.color),
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
                                  background: isDark ? "#052e16" : "#f0fdf4",
                                  color: isDark ? "#4ade80" : "#15803d",
                                  border: `1px solid ${isDark ? "#16a34a44" : "#bbf7d0"}`,
                                  padding: "2px 8px",
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
                              color: "var(--text-muted)",
                              fontSize: "12px",
                            }}
                          >
                            👤{" "}
                            <strong style={{ color: "var(--text-secondary)" }}>
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
                            style={s.btn(
                              isOpen
                                ? isDark
                                  ? "#374151"
                                  : "#e2e8f0"
                                : "#1d4ed8",
                              isOpen ? "var(--text-primary)" : "white",
                            )}
                          >
                            {isOpen ? "✕ Close" : "💬 Reply"}
                          </button>
                        </div>
                      </div>
                      <div
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "13px",
                          lineHeight: 1.6,
                        }}
                      >
                        {c.description.substring(0, 180)}
                        {c.description.length > 180 ? "..." : ""}
                      </div>

                      {isOpen && (
                        <div
                          style={{
                            marginTop: "16px",
                            paddingTop: "16px",
                            borderTop: "1px solid var(--border-color)",
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
                                  color: "var(--text-muted)",
                                  fontSize: "11px",
                                  marginBottom: "6px",
                                  textTransform: "uppercase",
                                }}
                              >
                                Full Complaint
                              </div>
                              <div
                                style={{
                                  background: "var(--card-inner-bg)",
                                  borderRadius: "10px",
                                  padding: "12px",
                                  fontSize: "13px",
                                  color: "var(--text-secondary)",
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
                                    color: "var(--text-muted)",
                                  }}
                                >
                                  Tx ID:{" "}
                                  <span
                                    style={{
                                      fontFamily: "monospace",
                                      color: "var(--text-secondary)",
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
                                      color: "var(--text-muted)",
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
                                      background: isDark
                                        ? "#0f2942"
                                        : "#eff6ff",
                                      border: `1px solid ${isDark ? "#1e3a5f" : "#bfdbfe"}`,
                                      borderRadius: "10px",
                                      padding: "12px",
                                      fontSize: "13px",
                                      color: isDark ? "#93c5fd" : "#1d4ed8",
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
                                    color: "var(--text-subtle)",
                                    fontSize: "13px",
                                    padding: "20px",
                                    textAlign: "center",
                                    background: "var(--card-inner-bg)",
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
                              color: "var(--text-muted)",
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
                                ...s.btn("#16a34a", "white"),
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
                              style={s.btn(isDark ? "#374151" : "#e2e8f0")}
                            >
                              Cancel
                            </button>
                            <span
                              style={{
                                color: "var(--text-subtle)",
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

        {/* ══ USERS TAB ══ */}
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
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "13px",
                    margin: 0,
                  }}
                >
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
                background: "var(--card-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: "14px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr",
                  padding: "12px 20px",
                  background: "var(--header-grid-bg)",
                  borderBottom: "1px solid var(--border-color)",
                  fontSize: "11px",
                  color: "var(--text-muted)",
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
                    color: "var(--text-subtle)",
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
                    (tx) => tx.userId === u._id?.toString() && tx.isFraud,
                  ).length;
                  return (
                    <div
                      key={i}
                      className="hr"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr",
                        padding: "14px 20px",
                        borderBottom: "1px solid var(--border-subtle)",
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
                                ? "var(--accent-bg)"
                                : isDark
                                  ? "#0f2942"
                                  : "#eff6ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "14px",
                            color:
                              u.role === "admin"
                                ? "var(--accent-text)"
                                : isDark
                                  ? "#60a5fa"
                                  : "#1d4ed8",
                            flexShrink: 0,
                          }}
                        >
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500, fontSize: "14px" }}>
                          {u.name}
                        </span>
                      </div>
                      <span
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "13px",
                        }}
                      >
                        {u.email}
                      </span>
                      <span
                        style={{
                          background:
                            u.role === "admin"
                              ? "var(--accent-bg)"
                              : isDark
                                ? "#0f2942"
                                : "#eff6ff",
                          color:
                            u.role === "admin"
                              ? "var(--accent-text)"
                              : isDark
                                ? "#60a5fa"
                                : "#1d4ed8",
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
                          color:
                            userComplaints > 0
                              ? "#f59e0b"
                              : "var(--text-subtle)",
                          fontWeight: userComplaints > 0 ? 700 : 400,
                        }}
                      >
                        {userComplaints}
                      </span>
                      <span
                        style={{
                          color:
                            userFraud > 0 ? "#ef4444" : "var(--text-subtle)",
                          fontWeight: userFraud > 0 ? 700 : 400,
                        }}
                      >
                        {userFraud}
                      </span>
                      <span
                        style={{ color: "var(--text-muted)", fontSize: "12px" }}
                      >
                        {new Date(u.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ══ TRANSACTIONS TAB ══ */}
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
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "13px",
                    margin: 0,
                  }}
                >
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
                value={transactions.filter((tx) => !tx.isFraud).length}
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
                background: "var(--card-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: "14px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr 1fr",
                  padding: "12px 20px",
                  background: "var(--header-grid-bg)",
                  borderBottom: "1px solid var(--border-color)",
                  fontSize: "11px",
                  color: "var(--text-muted)",
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
                    color: "var(--text-subtle)",
                  }}
                >
                  No transactions found
                </div>
              ) : (
                filteredTx.map((tx, i) => (
                  <div
                    key={i}
                    className="hr"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr 1fr",
                      padding: "14px 20px",
                      borderBottom: "1px solid var(--border-subtle)",
                      alignItems: "center",
                      borderLeft: `3px solid ${tx.isFraud ? "#dc2626" : "#16a34a"}`,
                      transition: "background 0.15s",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: "15px" }}>
                      ₹{tx.amount?.toLocaleString("en-IN")}
                    </span>
                    <span
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "13px",
                      }}
                    >
                      {tx.userId?.name || "Unknown"}
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "15px",
                        color:
                          tx.riskScore >= 70
                            ? "#ef4444"
                            : tx.riskScore >= 30
                              ? "#f59e0b"
                              : "#22c55e",
                      }}
                    >
                      {tx.riskScore}/100
                    </span>
                    <span
                      style={{
                        color:
                          tx.riskTier === "High"
                            ? "#ef4444"
                            : tx.riskTier === "Medium"
                              ? "#f59e0b"
                              : "#22c55e",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      {tx.riskTier || "-"}
                    </span>
                    <span
                      style={{
                        background: tx.isFraud
                          ? isDark
                            ? "#450a0a"
                            : "#fef2f2"
                          : isDark
                            ? "#052e16"
                            : "#f0fdf4",
                        color: tx.isFraud
                          ? isDark
                            ? "#f87171"
                            : "#dc2626"
                          : isDark
                            ? "#4ade80"
                            : "#15803d",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 700,
                        width: "fit-content",
                      }}
                    >
                      {tx.isFraud ? "🚨 FRAUD" : "✅ SAFE"}
                    </span>
                    <span
                      style={{ color: "var(--text-muted)", fontSize: "12px" }}
                    >
                      {new Date(tx.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ══ ML MODEL TAB ══ */}
        {tab === "model" && (
          <div className="fade">
            <div style={{ marginBottom: "20px" }}>
              <h2
                style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 4px" }}
              >
                ML Model Performance
              </h2>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "13px",
                  margin: 0,
                }}
              >
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
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
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
                      <span
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "13px",
                        }}
                      >
                        {m.label}
                      </span>
                      <span style={{ color: m.color, fontWeight: 700 }}>
                        {m.value}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: "8px",
                        background: "var(--border-color)",
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
                    background: "var(--card-bg)",
                    border: "1px solid var(--border-color)",
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
                        borderBottom: "1px solid var(--border-subtle)",
                      }}
                    >
                      <span
                        style={{ color: "var(--text-muted)", fontSize: "13px" }}
                      >
                        {d.label}
                      </span>
                      <span
                        style={{
                          color: "var(--text-primary)",
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
                    background: "var(--card-bg)",
                    border: "1px solid var(--border-color)",
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
                                (s, tx) => s + tx.riskScore,
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
                        borderBottom: "1px solid var(--border-subtle)",
                      }}
                    >
                      <span
                        style={{ color: "var(--text-muted)", fontSize: "13px" }}
                      >
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
