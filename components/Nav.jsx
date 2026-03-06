"use client";
import { useEffect, useState } from "react";

export default function Nav() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => {
      const sections = ["skills", "labs", "graph", "certs", "contact"];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 80) {
          setActive(id);
        }
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function linkColor(id) {
    return active === id ? "#00d4ff" : "#4a6a7a";
  }

  return (
    <nav style={navStyle}>
      <div style={logoStyle}>
        &lt;<span style={{ color: "#00d4ff" }}>Z4k7</span>_security/&gt;
      </div>
      <ul style={ulStyle}>
        <li style={liStyle}>
          <a href="#skills" style={{ ...aStyle, color: linkColor("skills") }}>
            skills
          </a>
        </li>
        <li style={liStyle}>
          <a href="#labs" style={{ ...aStyle, color: linkColor("labs") }}>
            labs
          </a>
        </li>
        <li style={liStyle}>
          <a href="#graph" style={{ ...aStyle, color: linkColor("graph") }}>
            graph
          </a>
        </li>
        <li style={liStyle}>
          <a href="#certs" style={{ ...aStyle, color: linkColor("certs") }}>
            certs
          </a>
        </li>
        <li style={liStyle}>
          <a href="#contact" style={{ ...aStyle, color: linkColor("contact") }}>
            contact
          </a>
        </li>
      </ul>
    </nav>
  );
}

const navStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  background: "rgba(5,10,14,0.95)",
  backdropFilter: "blur(12px)",
  borderBottom: "1px solid #1a3a4a",
  padding: "0 2rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  height: "56px",
};

const logoStyle = {
  fontFamily: "monospace",
  color: "#00ff88",
  fontSize: "1rem",
  letterSpacing: "2px",
};

const ulStyle = {
  display: "flex",
  gap: "2rem",
  listStyle: "none",
  padding: 0,
  margin: 0,
};

const liStyle = { listStyle: "none" };

const aStyle = {
  fontFamily: "monospace",
  textDecoration: "none",
  fontSize: "0.8rem",
  letterSpacing: "1px",
  textTransform: "uppercase",
};
