import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import API from "../api/axios";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationCount, setNotificationCount] = useState(0);
  const [pendingComplaints, setPendingComplaints] = useState(0);

  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") {
      fetchAdminNotifications();
      const interval = setInterval(fetchAdminNotifications, 15000);
      return () => clearInterval(interval);
    } else {
      fetchUserNotifications();
      const interval = setInterval(fetchUserNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUserNotifications = async () => {
    try {
      const res = await API.get("/complaints/my");
      const count = res.data.data.filter(
        (c) => c.adminReply && c.status !== "pending"
      ).length;
      setNotificationCount(count);
    } catch (err) {}
  };

  const fetchAdminNotifications = async () => {
    try {
      const res = await API.get("/complaints/all");
      const count = res.data.data.filter(
        (c) => c.status === "pending" || c.priority === "high"
      ).length;
      setPendingComplaints(count);
    } catch (err) {}
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const isActive = (path) => location.pathname === path;

  const s = {
    // shared
    logo: { display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", fontWeight: 800, fontSize: "16px" },
    themeBtn: {
      width: "34px", height: "34px", borderRadius: "10px",
      border: "1px solid var(--border)", background: "var(--bg-secondary)",
      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "15px", transition: "all 0.15s",
    },
    // user nav
    userNav: {
      background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
      padding: "0 24px", display: "flex", justifyContent: "space-between",
      alignItems: "center", height: "60px", position: "sticky", top: 0,
      zIndex: 100, boxShadow: "var(--shadow)",
    },
    userLink: (active) => ({
      color: active ? "var(--accent)" : "var(--text-secondary)",
      textDecoration: "none", fontSize: "13px", fontWeight: active ? 600 : 500,
      padding: "6px 10px", borderRadius: "8px", transition: "all 0.15s",
      background: active ? "var(--accent-light)" : "transparent",
      borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
    }),
    // admin nav
    adminNav: {
      background: isDark ? "#050a14" : "#1e1b4b",
      borderBottom: isDark ? "1px solid #1f2937" : "1px solid #312e81",
      padding: "0 24px", display: "flex", justifyContent: "space-between",
      alignItems: "center", height: "60px", position: "sticky", top: 0,
      zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
    },
    adminLink: (active) => ({
      color: active ? "#f87171" : "#94a3b8",
      textDecoration: "none", fontSize: "13px", fontWeight: active ? 600 : 500,
      padding: "7px 12px", borderRadius: "8px", transition: "all 0.15s",
      background: active ? "rgba(248,113,113,0.1)" : "transparent",
      borderBottom: active ? "2px solid #f87171" : "2px solid transparent",
    }),
    logoutBtn: (isAdmin) => ({
      background: isAdmin ? "#dc2626" : "var(--danger)",
      color: "white", border: "none", borderRadius: "8px",
      padding: "7px 14px", cursor: "pointer", fontWeight: 600, fontSize: "13px",
    }),
    badge: (color = "#ef4444") => ({
      position: "absolute", top: "-6px", right: "-8px",
      background: color, color: "white", borderRadius: "50%",
      minWidth: "17px", height: "17px", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontSize: "10px", fontWeight: "bold", pointerEvents: "none",
    }),
  };

  // ─── NOT LOGGED IN ────────────────────────────────────────────────────────
  if (!user) {
    return (
      <nav style={s.userNav}>
        <Link to="/" style={{ ...s.logo, color: "var(--accent)" }}>
          🛡️ UPI FraudGuard
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button style={s.themeBtn} onClick={toggle}>{isDark ? "☀️" : "🌙"}</button>
          <Link to="/login" style={{
            color: "var(--text-secondary)", textDecoration: "none",
            fontSize: "14px", fontWeight: 500, padding: "7px 14px",
            borderRadius: "8px", border: "1px solid var(--border)",
            background: "var(--bg-secondary)"
          }}>Login</Link>
          <Link to="/register" style={{
            background: "var(--accent)", color: "white", textDecoration: "none",
            fontSize: "14px", fontWeight: 600, padding: "7px 14px", borderRadius: "8px",
          }}>Register</Link>
        </div>
      </nav>
    );
  }

  // ─── ADMIN NAVBAR ─────────────────────────────────────────────────────────
  if (user.role === "admin") {
    return (
      <nav style={s.adminNav}>
        {/* Admin Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link to="/admin" style={{ ...s.logo, color: "#f87171" }}>
            🔧 Admin Panel
          </Link>
          <span style={{
            background: "#450a0a", color: "#f87171",
            fontSize: "10px", fontWeight: 700, padding: "2px 8px",
            borderRadius: "4px", letterSpacing: "0.5px"
          }}>RESTRICTED</span>

          {/* Alert for pending */}
          {pendingComplaints > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "rgba(251,146,60,0.15)", border: "1px solid #d97706",
              borderRadius: "20px", padding: "3px 10px",
              animation: "pulse 2s infinite"
            }}>
              <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}`}</style>
              <span style={{ fontSize: "11px" }}>🔔</span>
              <span style={{ color: "#fb923c", fontSize: "12px", fontWeight: 600 }}>
                {pendingComplaints} pending
              </span>
            </div>
          )}
        </div>

        {/* Admin Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          {[
            { to: "/admin", label: "📊 Overview" },
            { to: "/admin#complaints", label: "📋 Complaints" },
            { to: "/admin#users", label: "👥 Users" },
            { to: "/admin#transactions", label: "💳 Transactions" },
            { to: "/admin#model", label: "🤖 ML Model" },
          ].map((l) => (
            <Link key={l.to} to={l.to}
              style={s.adminLink(isActive("/admin"))}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,0.08)"; e.currentTarget.style.color = "#f9a8d4"; }}
              onMouseLeave={e => { e.currentTarget.style.background = isActive("/admin") ? "rgba(248,113,113,0.1)" : "transparent"; e.currentTarget.style.color = isActive("/admin") ? "#f87171" : "#94a3b8"; }}>
              {l.label}
            </Link>
          ))}

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "12px", paddingLeft: "12px", borderLeft: "1px solid #374151" }}>
            <button style={{ ...s.themeBtn, background: "#111827", borderColor: "#374151" }} onClick={toggle}>
              {isDark ? "☀️" : "🌙"}
            </button>
            {/* Admin avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "#450a0a", border: "2px solid #dc2626",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#f87171", fontWeight: 700, fontSize: "13px"
              }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "white", lineHeight: 1 }}>{user.name}</div>
                <div style={{ fontSize: "10px", color: "#dc2626", fontWeight: 700, letterSpacing: "0.5px" }}>ADMIN</div>
              </div>
            </div>
            <button onClick={handleLogout} style={s.logoutBtn(true)}>Logout</button>
          </div>
        </div>
      </nav>
    );
  }

  // ─── USER NAVBAR ──────────────────────────────────────────────────────────
  return (
    <nav style={s.userNav}>
      {/* User Logo */}
      <Link to="/" style={{ ...s.logo, color: "var(--accent)" }}>
        🛡️ UPI FraudGuard
      </Link>

      {/* User Links */}
      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        {[
          { to: "/dashboard", label: "🏠 Dashboard" },
          { to: "/detect", label: "🔍 Detect Fraud" },
          { to: "/upi-scanner", label: "🔎 UPI Scanner" },
          { to: "/analytics", label: "📊 Analytics" },
          { to: "/dispute", label: "🆘 Dispute" },
          { to: "/assistance", label: "📞 Assistance" },
        ].map((l) => (
          <Link key={l.to} to={l.to}
            style={s.userLink(isActive(l.to))}
            onMouseEnter={e => { if (!isActive(l.to)) { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text-primary)"; } }}
            onMouseLeave={e => { if (!isActive(l.to)) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; } }}>
            {l.label}
          </Link>
        ))}

        {/* Complaints with notification badge */}
        <div style={{ position: "relative" }}>
          <Link to="/complaints"
            style={s.userLink(isActive("/complaints"))}
            onMouseEnter={e => { if (!isActive("/complaints")) { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text-primary)"; } }}
            onMouseLeave={e => { if (!isActive("/complaints")) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; } }}>
            📋 Complaints
          </Link>
          {notificationCount > 0 && (
            <span style={s.badge()}>{notificationCount}</span>
          )}
        </div>

        {/* Right section */}
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          marginLeft: "8px", paddingLeft: "12px",
          borderLeft: "1px solid var(--border)"
        }}>
          <button style={s.themeBtn} onClick={toggle} title={isDark ? "Light mode" : "Dark mode"}>
            {isDark ? "☀️" : "🌙"}
          </button>

          <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "var(--accent)", display: "flex", alignItems: "center",
              justifyContent: "center", color: "white", fontWeight: 700, fontSize: "13px"
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{user.name}</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>User Account</div>
            </div>
          </Link>
          <button onClick={handleLogout} style={s.logoutBtn(false)}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;