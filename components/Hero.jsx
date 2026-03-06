"use client";
import { useEffect, useState } from "react";

export default function Hero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => setVisible(true), []);

  return (
    <section style={styles.hero}>
      <div style={styles.bgCircle} />
      <div style={styles.content}>
        <div style={{ ...styles.tag, opacity: visible ? 1 : 0 }}>
          <span style={{ color: "#4a6a7a" }}>{"> "}</span>
          pentester_jr &amp; security_engineer
        </div>

        <h1 style={{ ...styles.name, opacity: visible ? 1 : 0 }}>
          Z47<span style={styles.accent}>.</span>
        </h1>

        <div style={{ ...styles.title, opacity: visible ? 1 : 0 }}>
          [ eJPTv2 · ISO 27001 · Microsoft 365 · Intune · CAPC ]
        </div>

        <div style={styles.terminal}>
          <div style={styles.termLine}>
            <span style={styles.prompt}>~/whoami $ </span>
            <span style={styles.cmd}>cat profile.txt</span>
          </div>
          {[
            "→ +6 años en soporte IT N1/N2 & administración híbrida",
            "→ Especializado en ciberseguridad, IAM y cloud security",
            "→ Pentesting activo en TryHackMe & HackTheBox",
            "→ Certificado: Google · IBM · Fortinet · Microsoft · INE",
          ].map((line, i) => (
            <div key={i} style={styles.termLine}>
              <span style={styles.out}>{line}</span>
            </div>
          ))}
          <div style={styles.termLine}>
            <span style={styles.prompt}>~/whoami $ </span>
            <span style={styles.cursor} />
          </div>
        </div>

        <div style={styles.badges}>
          {["Pentesting", "Azure AD", "Microsoft Intune", "IAM"].map((b) => (
            <span key={b} style={styles.badge}>
              {b}
            </span>
          ))}
          {["eJPTv2", "ISO 27001", "Zero Trust", "SIEM"].map((b) => (
            <span key={b} style={styles.badgeCyan}>
              {b}
            </span>
          ))}
        </div>

        <div style={styles.cta}>
          <a href="#labs" style={styles.btnPrimary}>
            Ver Laboratorios
          </a>
          <a href="#graph" style={styles.btnOutline}>
            Knowledge Graph
          </a>
        </div>
      </div>
    </section>
  );
}

const styles = {
  hero: {
    position: "relative",
    zIndex: 1,
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    padding: "0 4rem",
    overflow: "hidden",
  },
  content: { maxWidth: "700px", position: "relative", zIndex: 1 },
  tag: {
    fontFamily: "monospace",
    color: "#00ff88",
    fontSize: "0.78rem",
    letterSpacing: "3px",
    marginBottom: "0.8rem",
    transition: "opacity 0.6s 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  name: {
    fontFamily: "monospace",
    fontSize: "clamp(2.2rem,4.5vw,3.8rem)",
    fontWeight: 700,
    lineHeight: 1,
    color: "#fff",
    marginBottom: "0.6rem",
    transition: "opacity 0.6s 0.4s",
    letterSpacing: "-1px",
  },
  accent: { color: "#00d4ff" },
  title: {
    fontFamily: "monospace",
    fontSize: "0.82rem",
    color: "#00ff88",
    marginBottom: "1.2rem",
    transition: "opacity 0.6s 0.6s",
    letterSpacing: "1px",
    opacity: 0.8,
  },
  terminal: {
    background: "#020608",
    border: "1px solid #1a3a4a",
    padding: "1rem 1.2rem",
    marginBottom: "1.5rem",
    maxWidth: "520px",
    borderLeft: "3px solid #00ff88",
  },
  termLine: {
    fontFamily: "monospace",
    fontSize: "0.76rem",
    color: "#00ff88",
    marginBottom: "0.2rem",
    lineHeight: 1.5,
  },
  prompt: { color: "#4a6a7a" },
  cmd: { color: "#00d4ff" },
  out: { color: "#c8d8e8" },
  cursor: {
    display: "inline-block",
    width: "8px",
    height: "14px",
    background: "#00ff88",
    verticalAlign: "middle",
    animation: "blink 1s step-end infinite",
  },
  badges: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.4rem",
    marginBottom: "1.5rem",
  },
  badge: {
    fontFamily: "monospace",
    fontSize: "0.68rem",
    padding: "4px 10px",
    border: "1px solid #00ff88",
    color: "#00ff88",
    letterSpacing: "1px",
    background: "rgba(0,255,136,0.05)",
  },
  badgeCyan: {
    fontFamily: "monospace",
    fontSize: "0.68rem",
    padding: "4px 10px",
    border: "1px solid #00d4ff",
    color: "#00d4ff",
    letterSpacing: "1px",
    background: "rgba(0,212,255,0.05)",
  },
  cta: { display: "flex", gap: "0.8rem", flexWrap: "wrap" },
  btnPrimary: {
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
  },
  btnOutline: {
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
  },
};
