import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import API from "../api/axios";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const pendingComplaints = 3; // temporary
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const [notificationCount, setNotificationCount] = useState(0);
  useEffect(() => {
  fetchNotifications();

  const interval = setInterval(fetchNotifications, 10000);

  return () => clearInterval(interval);
}, []);

const fetchNotifications = async () => {
  try {
    const res = await API.get("/complaints/my");

    const count = res.data.data.filter(
      c => c.adminReply && c.status !== "pending"
    ).length;

    setNotificationCount(count);
  } catch (err) {
    console.error(err);
  }
};
  const s = {
    nav: {
      background: "var(--bg-card)",
      borderBottom: "1px solid var(--border)",
      padding: "0 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      height: "60px",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "var(--shadow)",
    },
    link: {
      color: "var(--text-secondary)",
      textDecoration: "none",
      fontSize: "14px",
      fontWeight: 500,
      padding: "6px 10px",
      borderRadius: "8px",
      transition: "all 0.15s",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      textDecoration: "none",
      fontWeight: 800,
      fontSize: "16px",
      color: "var(--accent)",
    },
    themeBtn: {
      width: "36px",
      height: "36px",
      borderRadius: "10px",
      border: "1px solid var(--border)",
      background: "var(--bg-secondary)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "16px",
      color: "var(--text-secondary)",
      transition: "all 0.15s",
    },
    logoutBtn: {
      background: "var(--danger)",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "7px 14px",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "13px",
    },
  };

  return (
    <nav style={s.nav}>
      <Link to="/" style={s.logo}>
        🛡️ UPI FraudGuard
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {user ? (
          <>
            {[
              { to: "/dashboard", label: "Dashboard" },
              { to: "/detect", label: "Detect Fraud" },
              { to: "/upi-scanner", label: "UPI Scanner" },
              { to: "/analytics", label: "Analytics" },
              { to: "/dispute", label: "Dispute Help" },
              { to: "/assistance", label: "Assistance" },
              { to: "/complaints", label: "Complaints" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                style={s.link}
                onMouseEnter={(e) => {
                  e.target.style.background = "var(--bg-hover)";
                  e.target.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.color = "var(--text-secondary)";
                }}
              >
                {l.label}
              </Link>
            ))}
            {user?.role === "admin" ? (
              <>
                <Link to="/admin" style={s.link}>
                  Admin Dashboard
                </Link>
                <Link to="/analytics" style={s.link}>
                  Analytics
                </Link>
                <Link to="/profile" style={s.link}>
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" style={s.link}>
                  Dashboard
                </Link>
                <Link to="/detect" style={s.link}>
                  Detect Fraud
                </Link>
                <Link to="/upi-scanner" style={s.link}>
                  UPI Scanner
                </Link>
                <Link to="/dispute" style={s.link}>
                  Dispute Help
                </Link>
                <Link to="/assistance" style={s.link}>
                  Assistance
                </Link>
<div style={{ position: "relative" }}>
  <Link to="/complaints" style={s.link}>
    My Complaints
  </Link>

  {notificationCount > 0 && (
    <span
      style={{
        position: "absolute",
        top: "-6px",
        right: "-10px",
        background: "#ef4444",
        color: "white",
        borderRadius: "50%",
        minWidth: "18px",
        height: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "10px",
        fontWeight: "bold",
      }}
    >
      {notificationCount}
    </span>
  )}
</div>
                <Link to="/profile" style={s.link}>
                  Profile
                </Link>
              </>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginLeft: "8px",
                paddingLeft: "12px",
                borderLeft: "1px solid var(--border)",
              }}
            >
              <button
                style={s.themeBtn}
                onClick={toggle}
                title={isDark ? "Light mode" : "Dark mode"}
              >
                {isDark ? "☀️" : "🌙"}
              </button>
              <Link
                to="/profile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "13px",
                  }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                  }}
                >
                  {user.name}
                </span>
              </Link>
              <button onClick={handleLogout} style={s.logoutBtn}>
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <button style={s.themeBtn} onClick={toggle}>
              {isDark ? "☀️" : "🌙"}
            </button>
            <Link to="/login" style={{ ...s.link, marginLeft: "8px" }}>
              Login
            </Link>
            <Link
              to="/register"
              style={{
                ...s.link,
                background: "var(--accent)",
                color: "white",
                marginLeft: "4px",
              }}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
