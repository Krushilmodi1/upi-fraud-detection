import { useEffect, useState } from "react";

const SplashScreen = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);

          setTimeout(() => {
            onFinish();
          }, 500);

          return 100;
        }

        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg,#020617,#0f172a,#1e293b)",
      }}
    >
      {/* Background Glow */}
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
        style={{
          background: "#2563eb",
        }}
      />

      {/* Shield */}
      <div
        style={{
          fontSize: "120px",
          animation: "float 2s ease-in-out infinite",
        }}
      >
        🛡️
      </div>

      {/* Title */}
      <h1
        style={{
          color: "#60a5fa",
          fontSize: "42px",
          fontWeight: "800",
          marginTop: "10px",
          letterSpacing: "2px",
        }}
      >
        UPI FraudGuard
      </h1>

      <p
        style={{
          color: "#94a3b8",
          marginTop: "8px",
          fontSize: "15px",
        }}
      >
        AI Powered Fraud Detection System
      </p>

      {/* Loading Text */}
      <div
        style={{
          color: "#22c55e",
          marginTop: "25px",
          fontFamily: "monospace",
          fontSize: "14px",
        }}
      >
        Initializing Security Engine...
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: "320px",
          height: "12px",
          background: "#1e293b",
          borderRadius: "20px",
          overflow: "hidden",
          marginTop: "20px",
          border: "1px solid #334155",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background:
              "linear-gradient(90deg,#2563eb,#22c55e)",
            transition: "0.1s",
          }}
        />
      </div>

      {/* Percentage */}
      <div
        style={{
          color: "#e2e8f0",
          marginTop: "10px",
          fontWeight: "700",
        }}
      >
        {progress}%
      </div>

      {/* Fake Logs */}
      <div
        style={{
          marginTop: "30px",
          fontFamily: "monospace",
          color: "#22c55e",
          fontSize: "12px",
          textAlign: "left",
          width: "320px",
        }}
      >
        <div>✔ Loading AI Model...</div>
        <div>✔ Connecting Fraud Database...</div>
        <div>✔ Security Layer Activated...</div>
        <div>✔ Monitoring Transactions...</div>
      </div>

      <style>{`
        @keyframes float {
          0%,100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;