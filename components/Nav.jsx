"use client";
import { useEffect, useState } from "react";

export default function Nav() {
  const [active, setActive] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const sections = ["skills", "labs", "graph", "certs", "contact"];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 80) setActive(id);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const links = ["skills", "labs", "graph", "certs", "contact"];
  const linkColor = (id) => (active === id ? "#00d4ff" : "#4a6a7a");

  return (
    <>
      <nav className="nav-bar">
        <div className="nav-logo">
          &lt;<span style={{ color: "#00d4ff" }}>Z4k7</span>_security/&gt;
        </div>

        {!isMobile && (
          <ul className="nav-links">
            {links.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="nav-link"
                  style={{ color: linkColor(id) }}
                >
                  {id}
                </a>
              </li>
            ))}
          </ul>
        )}

        {isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="nav-hamburger"
            aria-label="Toggle menu"
          >
            <span style={{ ...barStyle(menuOpen, 0) }} />
            <span style={{ ...barStyle(menuOpen, 1) }} />
            <span style={{ ...barStyle(menuOpen, 2) }} />
          </button>
        )}
      </nav>

      {isMobile && (
        <div
          className="nav-mobile-menu"
          style={{
            maxHeight: menuOpen ? "400px" : "0",
            padding: menuOpen ? "1.5rem" : "0 1.5rem",
          }}
        >
          {links.map((id, i) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setMenuOpen(false)}
              className="nav-mobile-link"
              style={{
                color: linkColor(id),
                transitionDelay: menuOpen ? `${i * 60}ms` : "0ms",
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "translateX(0)" : "translateX(20px)",
              }}
            >
              <span style={{ color: "#1a3a4a", marginRight: "8px" }}>
                {">"}
              </span>
              {id}
            </a>
          ))}
        </div>
      )}
    </>
  );
}

function barStyle(open, index) {
  const base = {
    display: "block",
    width: "22px",
    height: "2px",
    background: "#00d4ff",
    transition: "all 0.3s ease",
    transformOrigin: "center",
  };
  if (open) {
    if (index === 0)
      return { ...base, transform: "translateY(7px) rotate(45deg)" };
    if (index === 1) return { ...base, opacity: 0, transform: "scaleX(0)" };
    if (index === 2)
      return { ...base, transform: "translateY(-7px) rotate(-45deg)" };
  }
  return base;
}
