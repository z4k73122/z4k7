// components/TrafficValidator.jsx
"use client"

import { useState, useEffect } from 'react';

export default function TrafficValidator() {
  const [activeTab, setActiveTab] = useState('overview');
  const [trafficData, setTrafficData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterCountry, setFilterCountry] = useState('all');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const mockTrafficData = {
      summary: {
        totalVisits: 12847,
        uniqueIPs: 8234,
        uniqueCountries: 48,
        anomalies: 3,
        suspiciousIPs: 2,
      },
      ips: [
        {
          ip: '192.168.1.124',
          country: 'Colombia',
          city: 'Bogotá',
          visits: 567,
          lastSeen: '2025-05-10 14:23:45',
          deviceType: 'Mobile',
          browser: 'Chrome',
          suspicious: false,
          riskScore: 12,
        },
        {
          ip: '189.45.203.45',
          country: 'Mexico',
          city: 'Mexico City',
          visits: 423,
          lastSeen: '2025-05-10 13:15:22',
          deviceType: 'Desktop',
          browser: 'Firefox',
          suspicious: false,
          riskScore: 18,
        },
        {
          ip: '10.0.0.1',
          country: 'Unknown',
          city: 'Unknown',
          visits: 2341,
          lastSeen: '2025-05-10 14:59:59',
          deviceType: 'Bot',
          browser: 'Unknown',
          suspicious: true,
          riskScore: 95,
        },
      ],
      countries: [
        { name: 'Colombia', visits: 3234, percentage: 25.1, flag: '🇨🇴' },
        { name: 'Mexico', visits: 2156, percentage: 16.8, flag: '🇲🇽' },
        { name: 'Spain', visits: 1876, percentage: 14.6, flag: '🇪🇸' },
        { name: 'Argentina', visits: 1543, percentage: 12.0, flag: '🇦🇷' },
      ],
      devices: [
        { type: 'Mobile', percentage: 65 },
        { type: 'Desktop', percentage: 28 },
        { type: 'Tablet', percentage: 7 },
      ],
    };

    setTimeout(() => {
      setTrafficData(mockTrafficData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleScan = async () => {
    setScanning(true);
    // Simular escaneo
    await new Promise(r => setTimeout(r, 2000));
    setScanning(false);
  };

  if (loading) {
    return (
      <section className="traffic-validator">
        <div className="terminal-loader">
          <div style={termLine}>
            <span style={prompt}>~/scan $ </span>
            <span style={cmd}>analyzing_traffic_patterns.sh</span>
          </div>
          <div style={termLine}>
            <span style={out}>[████████░░] 80% - Loading IP database...</span>
          </div>
          <div style={termLine}>
            <span style={prompt}>~/scan $ </span>
            <span style={cursor} />
          </div>
        </div>
      </section>
    );
  }

  const filteredIPs = filterCountry === 'all' 
    ? trafficData.ips 
    : trafficData.ips.filter(ip => ip.country === filterCountry);

  return (
    <section className="traffic-validator" id="traffic">
      <div className="traffic-container">
        {/* HEADER */}
        <div className="traffic-header">
          <div style={terminalHeader}>
            <span style={prompt}>~/traffic-validator $ </span>
            <span style={cmd}>./analysis.exe</span>
          </div>
          <p className="traffic-description">
            Red team traffic analysis • IP validation • Anomaly detection
          </p>
        </div>

        {/* MÉTRICAS */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">TOTAL REQUESTS</div>
            <div className="metric-value">{trafficData.summary.totalVisits.toLocaleString()}</div>
            <div className="metric-status">↑ 23%</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">UNIQUE IPS</div>
            <div className="metric-value">{trafficData.summary.uniqueIPs.toLocaleString()}</div>
            <div className="metric-status">↑ 34%</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">GEO LOCATIONS</div>
            <div className="metric-value">{trafficData.summary.uniqueCountries}</div>
            <div className="metric-status">↑ 12</div>
          </div>
          <div className="metric-card alert-card">
            <div className="metric-label">⚠️ THREATS</div>
            <div className="metric-value" style={{ color: '#ff1744' }}>
              {trafficData.summary.suspiciousIPs}
            </div>
            <div className="metric-status" style={{ color: '#ff1744' }}>
              ACTION REQUIRED
            </div>
          </div>
        </div>

        {/* SCAN BUTTON */}
        <div className="scan-section">
          <button 
            className={`scan-button ${scanning ? 'scanning' : ''}`}
            onClick={handleScan}
            disabled={scanning}
          >
            <span style={prompt}>$ </span>
            {scanning ? 'SCANNING...' : 'START DEEP SCAN'}
          </button>
        </div>

        {/* TABS */}
        <div className="tabs-container">
          {['overview', 'ips', 'countries', 'devices'].map(tab => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <span style={prompt}>{'> '}</span>
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* CONTENIDO */}
        <div className="content-wrapper">
          {activeTab === 'overview' && (
            <div className="tab-content">
              <div style={termLine}>
                <span style={prompt}>~/overview $ </span>
                <span style={cmd}>cat traffic_summary.log</span>
              </div>
              <div className="overview-grid">
                <div className="overview-card">
                  <h3 style={subHeader}>TOP IPS DETECTED</h3>
                  {trafficData.ips.slice(0, 3).map((ip, idx) => (
                    <div key={idx} className="list-item">
                      <span className={ip.suspicious ? 'suspicious' : 'safe'}>
                        {ip.suspicious ? '⚠️' : '✓'} {ip.ip}
                      </span>
                      <span className="visits-badge">{ip.visits}</span>
                    </div>
                  ))}
                </div>
                <div className="overview-card">
                  <h3 style={subHeader}>GEOGRAPHIC DISTRIBUTION</h3>
                  {trafficData.countries.slice(0, 3).map((country, idx) => (
                    <div key={idx} className="geo-item">
                      <span>{country.flag} {country.name}</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${country.percentage}%` }}
                        ></div>
                      </div>
                      <span className="percentage">{country.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ips' && (
            <div className="tab-content">
              <div style={termLine}>
                <span style={prompt}>~/ips $ </span>
                <span style={cmd}>netstat -tuple | grep ESTABLISHED</span>
              </div>
              <div className="filter-bar">
                <select 
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">ALL COUNTRIES</option>
                  {trafficData.countries.map((country, idx) => (
                    <option key={idx} value={country.name}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ips-list">
                {filteredIPs.map((ip, idx) => (
                  <div key={idx} className={`ip-entry ${ip.suspicious ? 'suspicious-entry' : ''}`}>
                    <div className="ip-header">
                      <code className="ip-address">{ip.ip}</code>
                      <span className={`risk-badge risk-${ip.riskScore > 60 ? 'critical' : ip.riskScore > 30 ? 'medium' : 'low'}`}>
                        {ip.riskScore > 60 ? '⚠️ CRITICAL' : ip.riskScore > 30 ? '⚡ MEDIUM' : '✓ LOW'}
                      </span>
                    </div>
                    <div className="ip-details">
                      <span>{ip.country} • {ip.city}</span>
                      <span>{ip.visits} requests • {ip.lastSeen}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'countries' && (
            <div className="tab-content">
              <div style={termLine}>
                <span style={prompt}>~/countries $ </span>
                <span style={cmd}>geoip_analysis --detailed</span>
              </div>
              <div className="countries-grid">
                {trafficData.countries.map((country, idx) => (
                  <div key={idx} className="country-card">
                    <div className="country-flag">{country.flag}</div>
                    <h3>{country.name}</h3>
                    <div className="country-stat">
                      <span className="label">Requests:</span>
                      <span className="value">{country.visits.toLocaleString()}</span>
                    </div>
                    <div className="country-stat">
                      <span className="label">Share:</span>
                      <span className="value">{country.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="tab-content">
              <div style={termLine}>
                <span style={prompt}>~/devices $ </span>
                <span style={cmd}>user_agent_analysis.py</span>
              </div>
              <div className="devices-grid">
                {trafficData.devices.map((device, idx) => (
                  <div key={idx} className="device-card">
                    <h3>{device.type}</h3>
                    <div className="device-percentage">{device.percentage}%</div>
                    <div className="device-bar">
                      <div className="device-fill" style={{ width: `${device.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .traffic-validator {
          background: #050a0e;
          padding: 60px 20px;
          color: #c8d8e8;
          position: relative;
          z-index: 1;
          border-top: 1px solid #1a3a4a;
          border-bottom: 1px solid #1a3a4a;
        }

        .traffic-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .traffic-header {
          margin-bottom: 40px;
        }

        .traffic-description {
          font-family: 'Share Tech Mono', monospace;
          color: #00d4ff;
          font-size: 0.85rem;
          margin-top: 10px;
          letter-spacing: 1px;
        }

        .terminal-loader {
          font-family: 'Share Tech Mono', monospace;
          color: #00ff88;
          padding: 30px;
          background: rgba(0, 255, 136, 0.02);
          border: 1px solid #00ff88;
          border-radius: 4px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 15px;
          margin: 40px 0;
        }

        .metric-card {
          background: rgba(0, 212, 255, 0.05);
          border: 1px solid #1a3a4a;
          padding: 20px;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .metric-card:hover {
          background: rgba(0, 212, 255, 0.1);
          border-color: #00d4ff;
          transform: translateY(-2px);
        }

        .metric-card.alert-card {
          background: rgba(255, 23, 68, 0.05);
          border-color: #ff1744;
        }

        .metric-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.7rem;
          color: #00d4ff;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: #00ff88;
          margin-bottom: 8px;
        }

        .metric-status {
          font-size: 0.8rem;
          color: #00ff88;
          font-family: 'Share Tech Mono', monospace;
        }

        .scan-section {
          text-align: center;
          margin: 40px 0;
        }

        .scan-button {
          font-family: 'Share Tech Mono', monospace;
          padding: 12px 32px;
          background: #00ff88;
          color: #050a0e;
          border: 1px solid #00ff88;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 700;
          transition: all 0.3s ease;
        }

        .scan-button:hover:not(.scanning) {
          background: transparent;
          color: #00ff88;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
        }

        .scan-button.scanning {
          animation: pulse-scan 0.8s ease-in-out infinite;
          opacity: 0.7;
          cursor: not-allowed;
        }

        @keyframes pulse-scan {
          0%, 100% { box-shadow: 0 0 10px rgba(0, 255, 136, 0.5); }
          50% { box-shadow: 0 0 30px rgba(0, 255, 136, 0.8); }
        }

        .tabs-container {
          display: flex;
          gap: 0;
          border-bottom: 1px solid #1a3a4a;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .tab {
          background: transparent;
          border: none;
          color: #4a6a7a;
          padding: 15px 20px;
          cursor: pointer;
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.8rem;
          letter-spacing: 1px;
          text-transform: uppercase;
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;
          position: relative;
        }

        .tab:hover {
          color: #00d4ff;
        }

        .tab.active {
          color: #00ff88;
          border-bottom-color: #00ff88;
        }

        .content-wrapper {
          background: rgba(0, 212, 255, 0.02);
          border: 1px solid #1a3a4a;
          padding: 30px;
          border-radius: 4px;
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .tab-content {
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .overview-card {
          background: rgba(0, 255, 136, 0.05);
          padding: 20px;
          border: 1px solid #00ff88;
          border-radius: 4px;
        }

        .list-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid rgba(0, 255, 136, 0.1);
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.85rem;
        }

        .list-item:last-child {
          border-bottom: none;
        }

        .list-item .suspicious {
          color: #ff1744;
        }

        .list-item .safe {
          color: #00ff88;
        }

        .visits-badge {
          background: rgba(0, 255, 136, 0.2);
          padding: 2px 8px;
          border-radius: 2px;
          font-size: 0.75rem;
        }

        .geo-item {
          display: grid;
          grid-template-columns: 1fr auto auto;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(0, 255, 136, 0.1);
          font-size: 0.9rem;
        }

        .geo-item:last-child {
          border-bottom: none;
        }

        .progress-bar {
          background: rgba(0, 212, 255, 0.1);
          height: 4px;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          background: linear-gradient(90deg, #00ff88, #00d4ff);
          height: 100%;
        }

        .percentage {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.8rem;
          color: #00d4ff;
          min-width: 35px;
          text-align: right;
        }

        .filter-bar {
          margin-bottom: 20px;
        }

        .filter-select {
          background: rgba(0, 212, 255, 0.05);
          border: 1px solid #00d4ff;
          color: #00d4ff;
          padding: 8px 12px;
          border-radius: 4px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .ips-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ip-entry {
          background: rgba(0, 212, 255, 0.03);
          border: 1px solid #1a3a4a;
          padding: 15px;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .ip-entry:hover {
          background: rgba(0, 212, 255, 0.08);
          border-color: #00d4ff;
        }

        .ip-entry.suspicious-entry {
          background: rgba(255, 23, 68, 0.05);
          border-color: #ff1744;
        }

        .ip-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .ip-address {
          font-family: 'Share Tech Mono', monospace;
          color: #00d4ff;
          font-size: 0.95rem;
        }

        .risk-badge {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.7rem;
          padding: 4px 10px;
          border-radius: 2px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .risk-critical {
          background: rgba(255, 23, 68, 0.3);
          color: #ff1744;
        }

        .risk-medium {
          background: rgba(255, 193, 7, 0.3);
          color: #ffc107;
        }

        .risk-low {
          background: rgba(0, 255, 136, 0.3);
          color: #00ff88;
        }

        .ip-details {
          display: grid;
          gap: 5px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.8rem;
          color: #4a6a7a;
        }

        .countries-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-top: 20px;
        }

        .country-card {
          background: rgba(0, 255, 136, 0.05);
          border: 1px solid #00ff88;
          padding: 15px;
          border-radius: 4px;
          text-align: center;
        }

        .country-flag {
          font-size: 2rem;
          margin-bottom: 10px;
        }

        .country-card h3 {
          color: #00ff88;
          font-size: 0.95rem;
          margin-bottom: 10px;
        }

        .country-stat {
          display: flex;
          justify-content: space-between;
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.8rem;
          margin: 8px 0;
        }

        .country-stat .label {
          color: #4a6a7a;
        }

        .country-stat .value {
          color: #00d4ff;
          font-weight: 700;
        }

        .devices-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-top: 20px;
        }

        .device-card {
          background: rgba(0, 212, 255, 0.05);
          border: 1px solid #00d4ff;
          padding: 15px;
          border-radius: 4px;
        }

        .device-card h3 {
          color: #00d4ff;
          font-size: 0.95rem;
          margin-bottom: 10px;
        }

        .device-percentage {
          font-size: 1.8rem;
          color: #00ff88;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .device-bar {
          background: rgba(0, 212, 255, 0.1);
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
        }

        .device-fill {
          background: linear-gradient(90deg, #00d4ff, #00ff88);
          height: 100%;
        }

        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: 1fr 1fr;
          }

          .tab {
            padding: 12px 15px;
            font-size: 0.7rem;
          }

          .ip-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .content-wrapper {
            padding: 20px;
          }
        }
      `}</style>
    </section>
  );
}

// Estilos reutilizables
const terminalHeader = {
  fontFamily: "monospace",
  fontSize: "0.85rem",
  color: "#00ff88",
  marginBottom: "15px",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const termLine = {
  fontFamily: "monospace",
  fontSize: "0.75rem",
  color: "#00ff88",
  marginBottom: "0.4rem",
  lineHeight: 1.6,
};

const prompt = { color: "#4a6a7a" };
const cmd = { color: "#00d4ff" };
const out = { color: "#c8d8e8" };

const cursor = {
  display: "inline-block",
  width: "8px",
  height: "12px",
  background: "#00ff88",
  verticalAlign: "middle",
  animation: "blink 1s step-end infinite",
};

const subHeader = {
  fontSize: "0.85rem",
  color: "#00ff88",
  marginBottom: "15px",
  textTransform: "uppercase",
  letterSpacing: "1px",
  margin: 0,
};
