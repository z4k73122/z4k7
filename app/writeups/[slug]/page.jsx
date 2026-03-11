"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import "../../writeup.css"; // ajusta la ruta según tu estructura

const calloutColors = {
  info: { border: "#00d4ff", bg: "rgba(0,212,255,0.05)", label: "#00d4ff" },
  warning: { border: "#ff8c00", bg: "rgba(255,140,0,0.05)", label: "#ff8c00" },
  danger: { border: "#ff3366", bg: "rgba(255,51,102,0.05)", label: "#ff3366" },
  default: { border: "#00ff88", bg: "rgba(0,255,136,0.04)", label: "#00ff88" },
  tip: { border: "#a78bfa", bg: "rgba(167,139,250,0.05)", label: "#a78bfa" },
};

const calloutIcons = {
  info: "ℹ",
  warning: "⚠",
  danger: "✕",
  default: "✓",
  tip: "💡",
};

function renderInlineCode(text) {
  if (!text) return text;
  const parts = text.split(/`([^`]+)`/);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <code
        key={i}
        style={{
          fontFamily: "'Fira Code', monospace",
          fontSize: "0.82em",
          background: "#0d1f2d",
          border: "1px solid #1a3a4a",
          color: "#00d4ff",
          padding: "1px 6px",
          borderRadius: "2px",
          letterSpacing: "0.5px",
        }}
      >
        {part}
      </code>
    ) : (
      part
    ),
  );
}

// ── Sidebar content — reutilizado en desktop y drawer ────────────────────────
function SidebarContent({ data, navItems, isMobile, onNavClick }) {
  return (
    <>
      <div className="writeup-sidebar-logo">
        {" "}
        &lt;<span style={{ color: "#00d4ff" }}>Z4k7</span>_writeups/&gt;
      </div>

      {/* Machine Info */}
      <div className="writeup-sidebar-section">
        <div className="writeup-sidebar-label">// Machine Info</div>
        <div className="writeup-machine-info">
          {[
            ["Name", data.title, "#00ff88"],
            ["Platform", data.platform, "#c8d8e8"],
            ["OS", data.os, "#c8d8e8"],
            ["Difficulty", data.difficulty, "#4ade80"],
            ["IP", data.ip, "#c8d8e8"],
            ["Status", "✓ Pwned", "#00ff88"],
          ].map(([k, v, c]) => (
            <div key={k} className="writeup-machine-row">
              <span style={{ color: "#4a6a7a" }}>{k}</span>
              <span style={{ color: c }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navegación */}
      <div className="writeup-sidebar-section">
        <div className="writeup-sidebar-label">// Contenido</div>
        {navItems.map((item) => (
          <a
            key={item.id + item.num}
            href={`#${item.id}`}
            className="writeup-nav-link"
            onClick={() => isMobile && onNavClick?.()}
          >
            <span className="writeup-nav-num">{item.num}</span>
            {item.label}
          </a>
        ))}
      </div>

      {/* Técnicas */}
      {data.techniques && (
        <div className="writeup-sidebar-section">
          <div className="writeup-sidebar-label">// Técnicas</div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}
          >
            {data.techniques.map((t, i) => (
              <span key={i} className="writeup-technique-tag">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function WriteupPage({ params }) {
  const { slug } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    fetch(`/api/writeups/${slug}`)
      .then((r) => r.json())
      .then((res) => {
        setData(res.frontmatter);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading)
    return (
      <div
        style={{
          background: "#050a0e",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontFamily: "monospace", color: "#00ff88" }}>
          // Cargando write-up...
        </div>
      </div>
    );

  if (!data)
    return (
      <div
        style={{
          background: "#050a0e",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontFamily: "monospace", textAlign: "center" }}>
          <div
            style={{
              color: "#ff3366",
              fontSize: "1.2rem",
              marginBottom: "1rem",
            }}
          >
            // Write-up no encontrado
          </div>
          <Link href="/" style={{ color: "#00d4ff" }}>
            ← Volver al portafolio
          </Link>
        </div>
      </div>
    );

  const titledSteps = (data.steps || []).filter((s) => s.num && s.num !== "");
  const lastN = titledSteps.length;
  const flagsNum = String(lastN + 1).padStart(2, "0");
  const lessonsNum = String(lastN + 2).padStart(2, "0");
  const flagSteps = (data.steps || []).filter((s) => s.type === "flag");
  const flagsList = flagSteps.flatMap((s) =>
    (s.flag_items || []).map((f) => ({ label: f.label, value: f.value })),
  );

  const navItems = [
    ...titledSteps.map((s) => ({ id: s.id, num: s.num, label: s.title })),
    ...(flagsList.length > 0
      ? [{ id: "flags", num: flagsNum, label: "Flags" }]
      : []),
    ...(data.lessons
      ? [{ id: "lessons", num: lessonsNum, label: "Lecciones" }]
      : []),
  ];

  return (
    <div className="writeup-page">
      <div className="writeup-grid-bg" />

      {/* ── Barra móvil ── */}
      <div className="writeup-mobile-bar">
        <span className="writeup-mobile-bar-logo">{"<z4k7/>"}</span>
        <button
          className="writeup-menu-btn"
          onClick={() => setSidebarOpen(true)}
        >
          ☰ Info
        </button>
      </div>

      {/* ── Drawer móvil ── */}
      {sidebarOpen && (
        <div
          className="writeup-drawer-overlay"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="writeup-drawer" onClick={(e) => e.stopPropagation()}>
            <button
              className="writeup-drawer-close"
              onClick={() => setSidebarOpen(false)}
            >
              ✕ cerrar
            </button>
            <div className="writeup-drawer-content">
              <SidebarContent
                data={data}
                navItems={navItems}
                isMobile={true}
                onNavClick={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="writeup-layout">
        {/* ── Sidebar desktop ── */}
        <aside className="writeup-sidebar">
          <SidebarContent data={data} navItems={navItems} isMobile={false} />
        </aside>

        {/* ── Main ── */}
        <main className="writeup-main">
          <Link href="/#labs" className="writeup-back-link">
            ← Volver al portafolio
          </Link>

          {/* HERO */}
          <div className="writeup-hero">
            <div className="writeup-hero-badges">
              <span className="writeup-badge platform">{data.platform}</span>
              <span className="writeup-badge difficulty">
                {data.difficulty}
              </span>
              <span className="writeup-badge os">{data.os}</span>
            </div>

            <h1 className="writeup-title">
              {data.title}
              <span className="writeup-title-dot">.</span>
            </h1>

            <div className="writeup-meta">
              <span>by</span>
              <span style={{ color: "#00ff88" }}>{data.author}</span>
              <span className="writeup-meta-sep">|</span>
              <span>Pentester Jr · eJPTv2</span>
              <span className="writeup-meta-sep">|</span>
              <span>{data.year}</span>
            </div>

            {data.tags && (
              <div className="writeup-tags">
                {data.tags.map((t, i) => (
                  <span key={i} className="writeup-tag">
                    {t}
                  </span>
                ))}
              </div>
            )}

            {data.summary && (
              <div className="writeup-summary">
                <div className="writeup-summary-label">
                  // Resumen ejecutivo
                </div>
                <p style={{ color: "#c8d8e8", margin: 0 }}>{data.summary}</p>
              </div>
            )}
          </div>

          {/* STEPS */}
          {(data.steps || []).map((step, idx) => {
            const hasTitle = step.num && step.num !== "";
            const hasContent =
              Array.isArray(step.content) && step.content.length > 0;

            return (
              <div
                key={`${step.id}-${idx}`}
                id={step.id}
                className="writeup-step"
              >
                {/* Flag inline */}
                {step.type === "flag" && (
                  <div className="writeup-flag-box">
                    <div className="writeup-flag-label">// FLAG CAPTURADA</div>
                    <div className="writeup-flag-items">
                      {(step.flag_items || []).map((flag, fi) => (
                        <div key={fi} className="writeup-flag-item">
                          <div className="writeup-flag-item-label">
                            // {flag.label}
                          </div>
                          <div className="writeup-flag-value">{flag.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Título del paso */}
                {hasTitle && (
                  <div className="writeup-step-header">
                    <span className="writeup-step-num">PASO {step.num}</span>
                    <h2 className="writeup-step-title">{step.title}</h2>
                    <div className="writeup-step-divider" />
                  </div>
                )}

                {/* Formato nuevo — content[] */}
                {hasContent &&
                  (step.content || []).map((item, ci) => {
                    if (item.kind === "note")
                      return (
                        <p key={ci} className="writeup-note">
                          {renderInlineCode(item.text)}
                        </p>
                      );

                    if (item.kind === "code")
                      return (
                        <div key={ci} className="writeup-code-block">
                          <div className="writeup-code-header">
                            <span className="writeup-code-title">
                              {step.title || "código"} — comandos
                            </span>
                            <span className="writeup-code-lang">
                              {item.lang}
                            </span>
                          </div>
                          <pre className="writeup-pre">{item.code}</pre>
                        </div>
                      );

                    if (item.kind === "image") {
                      const imgSrc =
                        item.src && item.src.startsWith("http")
                          ? item.src
                          : `/${item.src}`;
                      return (
                        <ImageBlock
                          key={ci}
                          img={{ src: imgSrc, caption: item.caption }}
                          index={ci}
                        />
                      );
                    }

                    if (item.kind === "bullet")
                      return (
                        <div key={ci} className="writeup-bullet">
                          <span className="writeup-bullet-arrow">→</span>
                          {renderInlineCode(item.text)}
                        </div>
                      );

                    if (item.kind === "callout") {
                      const cc =
                        calloutColors[item.type] || calloutColors.default;
                      return (
                        <div
                          key={ci}
                          className="writeup-callout"
                          style={{
                            borderLeft: `3px solid ${cc.border}`,
                            background: cc.bg,
                          }}
                        >
                          <div
                            className="writeup-callout-label"
                            style={{ color: cc.label }}
                          >
                            <span>{calloutIcons[item.type] || "ℹ"}</span>
                            <span>// {item.label}</span>
                          </div>
                          <p style={{ color: "#c8d8e8", margin: 0 }}>
                            {item.text}
                          </p>
                        </div>
                      );
                    }

                    if (item.kind === "table")
                      return (
                        <div key={ci} className="writeup-table-wrap">
                          <div className="writeup-table-header">
                            ▸ // tabla de datos
                          </div>
                          <div className="writeup-table-scroll">
                            <table className="writeup-table">
                              <thead>
                                <tr>
                                  {(item.headers || []).map((h, hi) => (
                                    <th key={hi}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {(item.rows || []).map((row, ri) => (
                                  <tr key={ri}>
                                    {row.map((cell, ci2) => (
                                      <td
                                        key={ci2}
                                        style={{
                                          color:
                                            ci2 === 0 ? "#00ff88" : "#c8d8e8",
                                        }}
                                      >
                                        {renderInlineCode(cell)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );

                    return null;
                  })}

                {/* Formato legacy */}
                {!hasContent && (
                  <>
                    {step.notes && <p className="writeup-note">{step.notes}</p>}

                    {step.code && (
                      <div className="writeup-code-block">
                        <div className="writeup-code-header">
                          <span className="writeup-code-title">
                            {step.code_title}
                          </span>
                          <span className="writeup-code-lang">
                            {step.code_lang}
                          </span>
                        </div>
                        <pre className="writeup-pre">{step.code}</pre>
                      </div>
                    )}

                    {step.images && step.images.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "1rem",
                          margin: "1.5rem 0",
                        }}
                      >
                        {step.images.map((img, i) => (
                          <ImageBlock key={i} img={img} index={i} />
                        ))}
                      </div>
                    )}

                    {step.bullet_list && step.bullet_list.length > 0 && (
                      <ul
                        style={{
                          listStyle: "none",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.6rem",
                          margin: "1rem 0",
                          padding: 0,
                        }}
                      >
                        {step.bullet_list.map((item, i) => (
                          <li key={i} className="writeup-bullet">
                            <span className="writeup-bullet-arrow">→</span>{" "}
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}

                    {step.callout_type &&
                      (() => {
                        const c =
                          calloutColors[step.callout_type] ||
                          calloutColors.default;
                        return (
                          <div
                            className="writeup-callout"
                            style={{
                              borderLeft: `3px solid ${c.border}`,
                              background: c.bg,
                              marginTop: "1rem",
                            }}
                          >
                            <div
                              className="writeup-callout-label"
                              style={{ color: c.label }}
                            >
                              // {step.callout_label}
                            </div>
                            <p style={{ color: "#c8d8e8", margin: 0 }}>
                              {step.callout_text}
                            </p>
                          </div>
                        );
                      })()}
                  </>
                )}
              </div>
            );
          })}

          {/* FLAGS globales */}
          {flagsList.length > 0 && (
            <div id="flags" className="writeup-flags-section">
              <div className="writeup-step-header">
                <span className="writeup-step-num">PASO {flagsNum}</span>
                <h2 className="writeup-step-title">Flags</h2>
                <div className="writeup-step-divider" />
              </div>
              <div className="writeup-pwned-box">
                <div className="writeup-pwned-bar" />
                <h3 className="writeup-pwned-title">✓ MACHINE PWNED</h3>
                <p className="writeup-pwned-sub">
                  {data.title} — {data.platform} · {data.difficulty}
                </p>
                <div className="writeup-flags-list">
                  {flagsList.map((flag, i) => (
                    <div key={i} className="writeup-flag-global-item">
                      <div className="writeup-flag-global-label">
                        // {flag.label}
                      </div>
                      <div className="writeup-flag-global-value">
                        {flag.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* LECCIONES */}
          {data.lessons && (
            <div id="lessons" className="writeup-lessons-section">
              <div className="writeup-step-header">
                <span className="writeup-step-num">PASO {lessonsNum}</span>
                <h2 className="writeup-step-title">Lecciones Aprendidas</h2>
                <div className="writeup-step-divider" />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                  marginBottom: "1.5rem",
                }}
              >
                {data.lessons.map((l, i) => (
                  <div key={i} className="writeup-lesson-item">
                    <span className="writeup-bullet-arrow">→</span>
                    <span style={{ color: "#c8d8e8" }}>
                      {renderInlineCode(l)}
                    </span>
                  </div>
                ))}
              </div>

              {data.mitigation && (
                <div className="writeup-mitigation-box">
                  <div className="writeup-mitigation-label">
                    // Mitigaciones recomendadas
                  </div>
                  {Array.isArray(data.mitigation) ? (
                    data.mitigation.map((item, i) => (
                      <div key={i} className="writeup-mitigation-item">
                        <span
                          style={{
                            color: "#00d4ff",
                            fontFamily: "monospace",
                            flexShrink: 0,
                          }}
                        >
                          →
                        </span>
                        <span style={{ color: "#c8d8e8" }}>
                          {renderInlineCode(item)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#c8d8e8", margin: 0 }}>
                      {renderInlineCode(data.mitigation)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* FOOTER */}
          <div className="writeup-footer">
            <span style={{ color: "#00ff88" }}>{data.author}</span>
            <span>
              {data.title} · {data.platform} ·{" "}
              <span style={{ color: "#00ff88" }}>Pwned ✓</span>
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}

// ── IMAGE BLOCK ───────────────────────────────────────────────────────────────
function ImageBlock({ img, index }) {
  const [modal, setModal] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setModal(false);
    };
    if (modal) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  return (
    <>
      <div className="writeup-image-wrap">
        <div className="writeup-image-header">
          <div className="writeup-image-header-left">
            <span
              style={{
                color: "#00ff88",
                fontFamily: "monospace",
                fontSize: "0.68rem",
              }}
            >
              ▸
            </span>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "0.68rem",
                color: "#4a6a7a",
              }}
            >
              // Evidencia técnica
            </span>
          </div>
          <div className="writeup-image-header-right">
            <span className="writeup-image-id">
              img_{String(index + 1).padStart(2, "0")}
            </span>
            <button
              className="writeup-image-btn"
              onClick={() => setModal(true)}
              title="Ver imagen completa"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              ver
            </button>
          </div>
        </div>

        <div className="writeup-image-preview" onClick={() => setModal(true)}>
          <img src={img.src} alt={img.caption || `evidencia ${index + 1}`} />
          <div className="writeup-image-overlay">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00d4ff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.6 }}
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        </div>

        {img.caption && (
          <div className="writeup-image-caption">↑ {img.caption}</div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="writeup-modal-overlay" onClick={() => setModal(false)}>
          <div
            className="writeup-modal-toolbar"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="writeup-modal-toolbar-label">
              // img_{String(index + 1).padStart(2, "0")} —{" "}
              {img.caption || "evidencia técnica"}
            </span>
            <button
              className="writeup-modal-close"
              onClick={() => setModal(false)}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              cerrar
            </button>
          </div>

          <div
            className="writeup-modal-img-wrap"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={img.src} alt={img.caption || `evidencia ${index + 1}`} />
          </div>

          <p className="writeup-modal-hint">click fuera para cerrar · ESC</p>
        </div>
      )}
    </>
  );
}
