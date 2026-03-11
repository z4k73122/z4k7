"use client";
import { useEffect, useState } from "react";

export default function Hero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => setVisible(true), []);

  return (
    <section className="hero-section">
      <div className="hero-content">
        <div
          style={{
            fontFamily: "monospace",
            color: "#00ff88",
            fontSize: "0.78rem",
            letterSpacing: "3px",
            marginBottom: "0.8rem",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.6s 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span style={{ color: "#4a6a7a" }}>{"> "}</span>
          pentester_jr &amp; security_engineer
        </div>

        <h1
          className="hero-name"
          style={{ opacity: visible ? 1 : 0, transition: "opacity 0.6s 0.4s" }}
        >
          Z4k7<span style={{ color: "#00d4ff" }}>.</span>
        </h1>

        <div
          className="hero-certs"
          style={{
            opacity: visible ? 0.8 : 0,
            transition: "opacity 0.6s 0.6s",
          }}
        >
          [ eJPTv2 · ISO 27001 · Microsoft 365 · Intune · CAPC ]
        </div>

        <div className="hero-terminal">
          <div style={termLine}>
            <span style={prompt}>~/whoami $ </span>
            <span style={cmd}>cat profile.txt</span>
          </div>
          {[
            "→ +6 años en soporte IT N1/N2 & administración híbrida",
            "→ Especializado en ciberseguridad, IAM y cloud security",
            "→ Pentesting activo en TryHackMe & HackTheBox",
            "→ Certificado: Google · IBM · Fortinet · Microsoft · INE",
          ].map((line, i) => (
            <div key={i} style={termLine}>
              <span style={out}>{line}</span>
            </div>
          ))}
          <div style={termLine}>
            <span style={prompt}>~/whoami $ </span>
            <span style={cursor} />
          </div>
        </div>

        <div className="hero-badges">
          {["Pentesting", "Azure AD", "Microsoft Intune", "IAM"].map((b) => (
            <span key={b} style={badge}>
              {b}
            </span>
          ))}
          {["eJPTv2", "ISO 27001", "Zero Trust", "SIEM"].map((b) => (
            <span key={b} style={badgeCyan}>
              {b}
            </span>
          ))}
        </div>

        <div className="hero-cta">
          <a href="#labs" style={btnPrimary}>
            Ver Laboratorios
          </a>
          <a href="#graph" style={btnOutline}>
            Knowledge Graph
          </a>
        </div>
      </div>
    </section>
  );
}

const termLine = {
  fontFamily: "monospace",
  fontSize: "0.76rem",
  color: "#00ff88",
  marginBottom: "0.2rem",
  lineHeight: 1.5,
};
const prompt = { color: "#4a6a7a" };
const cmd = { color: "#00d4ff" };
const out = { color: "#c8d8e8" };
const cursor = {
  display: "inline-block",
  width: "8px",
  height: "14px",
  background: "#00ff88",
  verticalAlign: "middle",
  animation: "blink 1s step-end infinite",
};
const badge = {
  fontFamily: "monospace",
  fontSize: "0.68rem",
  padding: "4px 10px",
  border: "1px solid #00ff88",
  color: "#00ff88",
  letterSpacing: "1px",
  background: "rgba(0,255,136,0.05)",
};
const badgeCyan = {
  fontFamily: "monospace",
  fontSize: "0.68rem",
  padding: "4px 10px",
  border: "1px solid #00d4ff",
  color: "#00d4ff",
  letterSpacing: "1px",
  background: "rgba(0,212,255,0.05)",
};
const btnPrimary = {
  fontFamily: "monospace",
  fontSize: "0.78rem",
  letterSpacing: "2px",
  padding: "10px 24px",
  textDecoration: "none",
  textTransform: "uppercase",
  background: "#00ff88",
  color: "#050a0e",
  fontWeight: 700,
  display: "inline-block",
};
const btnOutline = {
  fontFamily: "monospace",
  fontSize: "0.78rem",
  letterSpacing: "2px",
  padding: "10px 24px",
  textDecoration: "none",
  textTransform: "uppercase",
  background: "transparent",
  color: "#00d4ff",
  border: "1px solid #00d4ff",
  display: "inline-block",
};
