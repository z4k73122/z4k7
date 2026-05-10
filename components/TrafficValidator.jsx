// components/TrafficValidator.jsx - REEMPLAZAR COMPLETAMENTE
"use client";

import { useState, useEffect } from "react";

export default function TrafficValidator() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/traffic/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchStats();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleClearData = async () => {
    if (!confirm("¿Eliminar todos los datos?")) return;
    try {
      await fetch("/api/traffic", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      });
      alert("✅ Datos eliminados");
      fetchStats();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleExport = () => {
    if (!stats) return;
    const dataStr = JSON.stringify(stats, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `traffic-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
  };

  if (loading) {
    return <div style={styles.loader}>Cargando dashboard...</div>;
  }

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>🔍 TRAFFIC DASHBOARD</h1>
          <div style={styles.controls}>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              style={{
                ...styles.btn,
                ...(autoRefresh ? styles.btnActive : styles.btnInactive),
              }}
            >
              {autoRefresh ? "⏸ PAUSE" : "▶ RESUME"}
            </button>
            <button
              onClick={handleExport}
              style={{ ...styles.btn, ...styles.btnSecondary }}
            >
              ⬇ EXPORT
            </button>
            <button
              onClick={handleClearData}
              style={{ ...styles.btn, ...styles.btnDanger }}
            >
              🗑️ CLEAR
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statBox}>
            <div style={styles.statValue}>
              {stats?.summary.totalVisits || 0}
            </div>
            <div style={styles.statLabel}>Total Visits</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statValue}>{stats?.summary.uniqueIPs || 0}</div>
            <div style={styles.statLabel}>Unique IPs</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statValue}>
              {stats?.summary.uniqueCountries || 0}
            </div>
            <div style={styles.statLabel}>Countries</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statValue}>
              {stats?.suspiciousIPs?.length || 0}
            </div>
            <div style={styles.statLabel}>Suspicious</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {["overview", "countries", "devices", "recent"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tab,
                ...(activeTab === tab ? styles.tabActive : styles.tabInactive),
              }}
            >
              {tab === "overview" && "📊 Overview"}
              {tab === "countries" && "🌍 Countries"}
              {tab === "devices" && "📱 Devices"}
              {tab === "recent" && "📋 Recent"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={styles.content}>
          {activeTab === "overview" && (
            <div>
              <h2 style={styles.subtitle}>Top Countries</h2>
              {stats?.topCountries?.length > 0 ? (
                stats.topCountries.map((c, i) => (
                  <div key={i} style={styles.item}>
                    <span>
                      {c.flag} {c.name}
                    </span>
                    <div style={styles.bar}>
                      <div
                        style={{ ...styles.barFill, width: c.percentage + "%" }}
                      />
                    </div>
                    <span>{c.percentage}%</span>
                  </div>
                ))
              ) : (
                <p style={{ color: "#00d4ff" }}>Sin datos aún</p>
              )}
            </div>
          )}

          {activeTab === "countries" && (
            <div>
              <h2 style={styles.subtitle}>Distribución Geográfica</h2>
              {stats?.topCountries?.length > 0 ? (
                stats.topCountries.map((c, i) => (
                  <div key={i} style={styles.item}>
                    <span>
                      {c.flag} {c.name}
                    </span>
                    <span>{c.visits} visits</span>
                  </div>
                ))
              ) : (
                <p style={{ color: "#00d4ff" }}>Sin datos aún</p>
              )}
            </div>
          )}

          {activeTab === "devices" && (
            <div>
              <h2 style={styles.subtitle}>Tipos de Dispositivos</h2>
              {stats?.devices?.length > 0 ? (
                stats.devices.map((d, i) => (
                  <div key={i} style={styles.item}>
                    <span>📱 {d.type}</span>
                    <span>{d.percentage}%</span>
                  </div>
                ))
              ) : (
                <p style={{ color: "#00d4ff" }}>Sin datos aún</p>
              )}
            </div>
          )}

          {activeTab === "recent" && (
            <div>
              <h2 style={styles.subtitle}>Visitas Recientes</h2>
              <div style={styles.table}>
                {stats?.recentVisits?.length > 0 ? (
                  stats.recentVisits.map((v, i) => (
                    <div key={i} style={styles.tableRow}>
                      <span style={{ fontSize: "12px" }}>{v.ip}</span>
                      <span>{v.country}</span>
                      <span>{v.deviceType}</span>
                      <span style={{ fontSize: "11px" }}>
                        {new Date(v.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "#00d4ff" }}>Sin datos aún</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <span>Last update: {lastUpdate || "Loading..."}</span>
          <span>Auto-refresh: {autoRefresh ? "🟢 ON" : "🔴 OFF"}</span>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: "20px",
    background: "#050a0e",
    color: "#00ff88",
    fontFamily: "'Share Tech Mono', monospace",
    minHeight: "100vh",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "2px solid #00ff88",
    paddingBottom: "15px",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "10px",
  },
  title: {
    fontSize: "24px",
    margin: 0,
    color: "#00ff88",
    textShadow: "0 0 10px rgba(0, 255, 136, 0.5)",
  },
  controls: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  btn: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
    fontFamily: "'Share Tech Mono', monospace",
  },
  btnActive: {
    background: "#00ff88",
    color: "#050a0e",
  },
  btnInactive: {
    border: "1px solid #00ff88",
    background: "transparent",
    color: "#00ff88",
  },
  btnSecondary: {
    border: "1px solid #00d4ff",
    background: "transparent",
    color: "#00d4ff",
  },
  btnDanger: {
    background: "#ff1744",
    color: "#fff",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "15px",
    marginBottom: "20px",
  },
  statBox: {
    background: "rgba(0, 255, 136, 0.1)",
    border: "1px solid #00ff88",
    padding: "15px",
    textAlign: "center",
    borderRadius: "4px",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#00ff88",
  },
  statLabel: {
    fontSize: "11px",
    color: "#00d4ff",
    marginTop: "5px",
  },
  tabs: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    borderBottom: "1px solid rgba(0, 255, 136, 0.2)",
    flexWrap: "wrap",
  },
  tab: {
    padding: "10px 15px",
    border: "none",
    background: "transparent",
    color: "#00d4ff",
    cursor: "pointer",
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: "12px",
  },
  tabActive: {
    borderBottom: "2px solid #00ff88",
    color: "#00ff88",
    fontWeight: "bold",
  },
  tabInactive: {
    borderBottom: "none",
  },
  content: {
    marginBottom: "20px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#00ff88",
    marginBottom: "10px",
    borderBottom: "1px solid #00ff88",
    paddingBottom: "8px",
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px",
    background: "rgba(0, 255, 136, 0.05)",
    border: "1px solid rgba(0, 255, 136, 0.1)",
    borderRadius: "4px",
    marginBottom: "5px",
    fontSize: "12px",
  },
  bar: {
    flex: 1,
    height: "6px",
    background: "rgba(0, 255, 136, 0.1)",
    borderRadius: "3px",
    overflow: "hidden",
    margin: "0 10px",
  },
  barFill: {
    height: "100%",
    backgroundColor: "#00ff88",
  },
  table: {
    background: "rgba(0, 255, 136, 0.05)",
    border: "1px solid #00ff88",
    borderRadius: "4px",
    overflow: "hidden",
  },
  tableRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px",
    borderBottom: "1px solid rgba(0, 255, 136, 0.1)",
    fontSize: "12px",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid #00ff88",
    paddingTop: "10px",
    fontSize: "11px",
    color: "#00d4ff",
  },
  loader: {
    textAlign: "center",
    padding: "40px",
    color: "#00ff88",
    fontFamily: "'Share Tech Mono', monospace",
  },
};
