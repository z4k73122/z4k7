"use client";
import { useState } from "react";

const links = [
  {
    icon: "✉",
    label: "Email (privado)",
    url: "mailto:tu@email.com",
    color: "#00d4ff",
  },
  { icon: "📱", label: "Teléfono (privado)", url: "tel:+57", color: "#ff3366" },
  {
    icon: "💼",
    label: "LinkedIn",
    url: "https://linkedin.com/in/tu-perfil",
    color: "#00d4ff",
  },
  {
    icon: "🐱",
    label: "GitHub",
    url: "https://github.com/Z4k7",
    color: "#00d4ff",
  },
];

function ContactBtn({ link }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.6rem",
        padding: "0.8rem 1.5rem",
        textDecoration: "none",
        fontFamily: "monospace",
        fontSize: "0.85rem",
        letterSpacing: "1px",
        color: hovered ? "#050a0e" : link.color,
        background: hovered ? link.color : "transparent",
        border: `1px solid ${link.color}`,
        transition: "all 0.3s",
        cursor: "pointer",
      }}
    >
      <span>{link.icon}</span> {link.label}
    </a>
  );
}

export default function Contact() {
  return (
    <section id="contact" className="contact-section">
      <div className="contact-header">
        <span
          style={{
            fontFamily: "monospace",
            color: "#00ff88",
            fontSize: "0.85rem",
            flexShrink: 0,
          }}
        >
          05.
        </span>
        <h2 className="contact-title">Contacto</h2>
        <div className="contact-divider" />
      </div>

      <div className="contact-box">
        <h3
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "1rem",
          }}
        >
          ¿Hablamos?
        </h3>
        <p
          style={{
            fontFamily: "monospace",
            fontSize: "0.82rem",
            color: "#4a6a7a",
            marginBottom: "0.5rem",
            lineHeight: 1.7,
          }}
        >
          Abierto a oportunidades en ciberseguridad, pentesting y administración
          de seguridad cloud.
        </p>
        <p
          style={{
            fontFamily: "monospace",
            fontSize: "0.82rem",
            color: "#4a6a7a",
            marginBottom: "2rem",
          }}
        >
          // Contacta vía LinkedIn o GitHub
        </p>
        <div className="contact-btns">
          {links.map((link, i) => (
            <ContactBtn key={i} link={link} />
          ))}
        </div>
      </div>

      <div className="contact-footer">
        <p
          style={{
            fontFamily: "monospace",
            fontSize: "0.78rem",
            color: "#4a6a7a",
            marginBottom: "0.4rem",
          }}
        >
          Built by{" "}
          <span style={{ color: "#00ff88", fontWeight: 700 }}>Z4k7</span> ·
          Cybersecurity Portfolio · 2026
        </p>
        <p
          style={{
            fontFamily: "monospace",
            fontSize: "0.72rem",
            color: "#1a3a4a",
          }}
        >
          [ stay curious · keep hacking · think like an attacker ]
        </p>
      </div>
    </section>
  );
}
