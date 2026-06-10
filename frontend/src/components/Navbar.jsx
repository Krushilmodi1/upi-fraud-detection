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

  const [userNotifications, setUserNotifications] = useState(0);
  const [adminPending, setAdminPending] = useState(0);
  const [adminHigh, setAdminHigh] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Fetch notifications based on role ──────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const fetch = user.role === "admin" ? fetchAdminAlerts : fetchUserAlerts;
    fetch();
    const interval = setInterval(fetch, user.role === "admin" ? 30000 : 60000);
    return () => clearInterval(interval);
  }, [user?._id]);

  const fetchUserAlerts = async () => {
    try {
      const res = await API.get("/complaints/my");
      const count = (res.data.data || []).filter(
        (c) =>
          c.adminReply && c.adminReply.trim() !== "" && c.status === "resolved",
      ).length;
      setUserNotifications(count);
    } catch {}
  };

  const fetchAdminAlerts = async () => {
    try {
      const res = await API.get("/complaints/all");
      const data = res.data.data || [];
      setAdminPending(data.filter((c) => c.status === "pending").length);
      setAdminHigh(
        data.filter((c) => c.priority === "high" && c.status !== "resolved")
          .length,
      );
    } catch {}
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const isActive = (path) => location.pathname === path;

  // ── Shared styles ───────────────────────────────────────────────────────────
  const userNavStyle = {
    background: "var(--bg-card)",
    borderBottom: "1px solid var(--border)",
    padding: "0 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "60px",
    position: "sticky",
    top: 0,
    zIndex: 200,
    boxShadow: "var(--shadow)",
    transition: "background 0.2s, border 0.2s",
  };

  const adminNavStyle = {
    background: "#050a14",
    borderBottom: "1px solid #1a2332",
    padding: "0 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "60px",
    position: "sticky",
    top: 0,
    zIndex: 200,
    boxShadow: "0 2px 20px rgba(0,0,0,0.4)",
  };

  const userLinkStyle = (active) => ({
    color: active ? "var(--accent)" : "var(--text-secondary)",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: active ? 600 : 500,
    padding: "6px 10px",
    borderRadius: "8px",
    transition: "all 0.15s",
    background: active ? "var(--accent-light)" : "transparent",
    whiteSpace: "nowrap",
  });

  const adminLinkStyle = (active) => ({
    color: active ? "#f87171" : "#6b7280",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: active ? 600 : 500,
    padding: "7px 12px",
    borderRadius: "8px",
    transition: "all 0.15s",
    background: active ? "rgba(248,113,113,0.1)" : "transparent",
    whiteSpace: "nowrap",
  });

  const themeBtnStyle = {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    border: "1px solid var(--border)",
    background: "var(--bg-secondary)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    transition: "all 0.15s",
    flexShrink: 0,
  };

  const badgeStyle = (color = "#ef4444") => ({
    position: "absolute",
    top: "-5px",
    right: "-7px",
    background: color,
    color: "white",
    borderRadius: "50%",
    minWidth: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: 700,
    pointerEvents: "none",
    boxShadow: `0 0 6px ${color}88`,
  });

  // ── NOT LOGGED IN ──────────────────────────────────────────────────────────
  if (!user) {
    return (
      <nav style={userNavStyle}>
        <style>{`
          @keyframes navPulse{0%,100%{opacity:1}50%{opacity:0.6}}
          .nav-user-link:hover{background:var(--bg-hover)!important;color:var(--text-primary)!important}
        `}</style>
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            fontWeight: 800,
            fontSize: "16px",
            color: "var(--accent)",
          }}
        >
          🛡️ UPI FraudGuard
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            style={themeBtnStyle}
            onClick={toggle}
            title={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
          <Link
            to="/login"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 500,
              padding: "7px 14px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--bg-secondary)",
            }}
          >
            Login
          </Link>
          <Link
            to="/register"
            style={{
              background: "var(--accent)",
              color: "white",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 600,
              padding: "7px 14px",
              borderRadius: "8px",
            }}
          >
            Register
          </Link>
        </div>
      </nav>
    );
  }

  // ── ADMIN NAVBAR ──────────────────────────────────────────────────────────
  if (user.role === "admin") {
    const adminTabs = [
      { to: "/admin", hash: "", label: "📊 Overview" },
      { to: "/admin#complaints", hash: "complaints", label: "📋 Complaints" },
      { to: "/admin#users", hash: "users", label: "👥 Users" },
      {
        to: "/admin#transactions",
        hash: "transactions",
        label: "💳 Transactions",
      },
      { to: "/admin#model", hash: "model", label: "🤖 ML Model" },
    ];

    const currentHash = location.hash.replace("#", "");

    return (
      <nav style={adminNavStyle}>
        <style>{`
          @keyframes navPulse{0%,100%{opacity:1}50%{opacity:0.6}}
          .admin-link:hover{background:rgba(248,113,113,0.1)!important;color:#f9a8d4!important}
          .admin-alert:hover{opacity:0.85}
        `}</style>

        {/* Left — Logo + Alerts */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            to="/admin"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              fontWeight: 800,
              fontSize: "16px",
              color: "#f87171",
            }}
          >
            🔧 Admin Panel
          </Link>
          <span
            style={{
              background: "#450a0a",
              color: "#f87171",
              fontSize: "10px",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "4px",
              letterSpacing: "0.5px",
            }}
          >
            RESTRICTED
          </span>

          {adminPending > 0 && (
            <Link
              to="/admin#complaints"
              className="admin-alert"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(251,146,60,0.12)",
                border: "1px solid #d97706",
                borderRadius: "20px",
                padding: "3px 10px",
                textDecoration: "none",
                transition: "opacity 0.15s",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  animation: "navPulse 1.5s infinite",
                }}
              >
                🔔
              </span>
              <span
                style={{ color: "#fb923c", fontSize: "12px", fontWeight: 600 }}
              >
                {adminPending} pending
              </span>
            </Link>
          )}

          {adminHigh > 0 && (
            <Link
              to="/admin#complaints"
              className="admin-alert"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(239,68,68,0.12)",
                border: "1px solid #dc2626",
                borderRadius: "20px",
                padding: "3px 10px",
                textDecoration: "none",
                animation: "navPulse 2s infinite",
                transition: "opacity 0.15s",
              }}
            >
              <span style={{ fontSize: "11px" }}>🚨</span>
              <span
                style={{ color: "#f87171", fontSize: "12px", fontWeight: 600 }}
              >
                {adminHigh} urgent
              </span>
            </Link>
          )}
        </div>

        {/* Right — Tab links + User */}
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          {adminTabs.map((l) => {
            const active =
              location.pathname === "/admin" &&
              ((!l.hash && !currentHash) || l.hash === currentHash);
            return (
              <Link
                key={l.to}
                to={l.to}
                className="admin-link"
                style={adminLinkStyle(active)}
              >
                {l.label}
              </Link>
            );
          })}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginLeft: "12px",
              paddingLeft: "14px",
              borderLeft: "1px solid #1f2937",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#450a0a,#7f1d1d)",
                  border: "2px solid #dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  color: "#f87171",
                  fontSize: "14px",
                  boxShadow: "0 0 10px rgba(220,38,38,0.3)",
                }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "white",
                    lineHeight: 1,
                  }}
                >
                  {user.name}
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    color: "#dc2626",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    marginTop: "2px",
                  }}
                >
                  ADMINISTRATOR
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "7px 14px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "13px",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#b91c1c")}
              onMouseLeave={(e) => (e.target.style.background = "#dc2626")}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // ── USER NAVBAR ──────────────────────────────────────────────────────────
  const userLinks = [
    { to: "/dashboard", label: "🏠 Dashboard" },
    { to: "/detect", label: "🔍 Detect Fraud" },
    { to: "/upi-scanner", label: "🔎 UPI Scanner" },
    { to: "/analytics", label: "📊 Analytics" },
    { to: "/dispute", label: "🆘 Dispute" },
    { to: "/assistance", label: "📞 Assistance" },
  ];

  return (
    <nav style={userNavStyle}>
      <style>{`
        @keyframes navPulse{0%,100%{opacity:1}50%{opacity:0.6}}
        .nav-user-link:hover{background:var(--bg-hover)!important;color:var(--text-primary)!important}
      `}</style>

      {/* Logo */}
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          textDecoration: "none",
          fontWeight: 800,
          fontSize: "16px",
          color: "var(--accent)",
          flexShrink: 0,
        }}
      >
        🛡️{" "}
        <span
          style={{
            background: "linear-gradient(135deg,var(--accent),#8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          UPI FraudGuard
        </span>
      </Link>

      {/* Links */}
      <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
        {userLinks.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="nav-user-link"
            style={userLinkStyle(isActive(l.to))}
          >
            {l.label}
          </Link>
        ))}

        {/* Complaints with badge */}
        <div style={{ position: "relative" }}>
          <Link
            to="/complaints"
            className="nav-user-link"
            style={userLinkStyle(isActive("/complaints"))}
          >
            📋 Complaints
          </Link>
          {userNotifications > 0 && (
            <span style={badgeStyle()}>{userNotifications}</span>
          )}
        </div>

        {/* Divider + Right section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginLeft: "10px",
            paddingLeft: "12px",
            borderLeft: "1px solid var(--border)",
          }}
        >
          {/* Theme toggle */}
          <button
            style={themeBtnStyle}
            onClick={toggle}
            title={isDark ? "Switch to Light" : "Switch to Dark"}
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          {/* User avatar + name */}
          <Link
            to="/profile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              padding: "4px 8px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "var(--bg-secondary)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.background = "var(--accent-light)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "var(--bg-secondary)";
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "linear-gradient(135deg,var(--accent),#8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: "12px",
                flexShrink: 0,
              }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ lineHeight: 1 }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {user.name}
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                My Account
              </div>
            </div>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              background: "var(--danger)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "7px 14px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              transition: "all 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.85";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
