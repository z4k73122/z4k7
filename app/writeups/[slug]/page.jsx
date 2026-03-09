"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";

const calloutColors = {
  info: { border: "#00d4ff", bg: "rgba(0,212,255,0.05)", label: "#00d4ff" },
  warning: { border: "#ff8c00", bg: "rgba(255,140,0,0.05)", label: "#ff8c00" },
  danger: { border: "#ff3366", bg: "rgba(255,51,102,0.05)", label: "#ff3366" },
  default: { border: "#00ff88", bg: "rgba(0,255,136,0.04)", label: "#00ff88" },
  tip: { border: "#a78bfa", bg: "rgba(167,139,250,0.05)", label: "#a78bfa" },
};

export default function WriteupPage({ params }) {
  const { slug } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const flagsList =
    data.flags_list && data.flags_list.length > 0
      ? data.flags_list
      : data.flags
        ? Object.entries(data.flags).map(([label, value]) => ({ label, value }))
        : [];

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
    <div
      style={{
        background: "#050a0e",
        minHeight: "100vh",
        color: "#c8d8e8",
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: "16px",
        lineHeight: "1.7",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,255,136,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.02) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* SIDEBAR */}
        <aside
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            overflowY: "auto",
            background: "#0a1520",
            borderRight: "1px solid #1a3a4a",
            padding: "2rem 1.5rem",
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "0.8rem",
              color: "#00ff88",
              letterSpacing: "2px",
              marginBottom: "2rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid #1a3a4a",
            }}
          >
            {"<z4k7_writeups/>"}
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "0.65rem",
                color: "#4a6a7a",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "0.8rem",
              }}
            >
              // Machine Info
            </div>
            <div
              style={{
                background: "#0d1f2d",
                border: "1px solid #1a3a4a",
                padding: "1rem",
                fontFamily: "monospace",
                fontSize: "0.72rem",
              }}
            >
              {[
                ["Name", data.title, "#00ff88"],
                ["Platform", data.platform, "#c8d8e8"],
                ["OS", data.os, "#c8d8e8"],
                ["Difficulty", data.difficulty, "#4ade80"],
                ["IP", data.ip, "#c8d8e8"],
                ["Status", "✓ Pwned", "#00ff88"],
              ].map(([k, v, c]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "3px 0",
                    borderBottom: "1px solid #1a3a4a",
                  }}
                >
                  <span style={{ color: "#4a6a7a" }}>{k}</span>
                  <span style={{ color: c }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "0.65rem",
                color: "#4a6a7a",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "0.8rem",
              }}
            >
              // Contenido
            </div>
            {navItems.map((item) => (
              <a
                key={item.id + item.num}
                href={`#${item.id}`}
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  color: "#4a6a7a",
                  textDecoration: "none",
                  padding: "5px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  borderLeft: "2px solid transparent",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#00ff88";
                  e.currentTarget.style.borderLeftColor = "#00ff88";
                  e.currentTarget.style.background = "rgba(0,255,136,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#4a6a7a";
                  e.currentTarget.style.borderLeftColor = "transparent";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <span
                  style={{
                    color: "#1a3a4a",
                    fontSize: "0.65rem",
                    minWidth: "18px",
                  }}
                >
                  {item.num}
                </span>
                {item.label}
              </a>
            ))}
          </div>

          {data.techniques && (
            <div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.65rem",
                  color: "#4a6a7a",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: "0.8rem",
                }}
              >
                // Técnicas
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.3rem",
                }}
              >
                {data.techniques.map((t, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.68rem",
                      padding: "3px 10px",
                      background: "rgba(0,255,136,0.06)",
                      border: "1px solid #1a3a4a",
                      color: "#4a6a7a",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* MAIN */}
        <main style={{ padding: "3rem 6rem" }}>
          <Link
            href="/#labs"
            style={{
              fontFamily: "monospace",
              fontSize: "0.78rem",
              color: "#4a6a7a",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              marginBottom: "2rem",
            }}
          >
            ← Volver al portafolio
          </Link>

          {/* HERO */}
          <div
            style={{
              marginBottom: "3rem",
              paddingBottom: "2rem",
              borderBottom: "1px solid #1a3a4a",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "1.5rem",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  padding: "4px 12px",
                  background: "rgba(0,255,136,0.1)",
                  border: "1px solid #00ff88",
                  color: "#00ff88",
                }}
              >
                {data.platform}
              </span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  padding: "4px 12px",
                  background: "rgba(74,222,128,0.1)",
                  border: "1px solid #4ade80",
                  color: "#4ade80",
                }}
              >
                {data.difficulty}
              </span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  padding: "4px 12px",
                  background: "rgba(0,212,255,0.08)",
                  border: "1px solid #00d4ff",
                  color: "#00d4ff",
                }}
              >
                {data.os}
              </span>
            </div>
            <h1
              style={{
                fontSize: "3.5rem",
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "3px",
                lineHeight: 1,
                marginBottom: "1rem",
              }}
            >
              {data.title}
              <span style={{ color: "#00ff88" }}>.</span>
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                fontFamily: "monospace",
                fontSize: "0.78rem",
                color: "#4a6a7a",
                marginBottom: "1.5rem",
              }}
            >
              <span>by</span>
              <span style={{ color: "#00ff88" }}>{data.author}</span>
              <span style={{ color: "#1a3a4a" }}>|</span>
              <span>Pentester Jr · eJPTv2</span>
              <span style={{ color: "#1a3a4a" }}>|</span>
              <span>{data.date}</span>
            </div>
            {data.tags && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                {data.tags.map((t, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.68rem",
                      padding: "3px 10px",
                      background: "rgba(0,255,136,0.06)",
                      border: "1px solid #1a3a4a",
                      color: "#4a6a7a",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            {data.summary && (
              <div
                style={{
                  borderLeft: "3px solid #00d4ff",
                  background: "rgba(0,212,255,0.05)",
                  padding: "1rem 1.2rem",
                }}
              >
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.7rem",
                    letterSpacing: "2px",
                    color: "#00d4ff",
                    marginBottom: "0.4rem",
                  }}
                >
                  // Resumen ejecutivo
                </div>
                <p style={{ color: "#c8d8e8", margin: 0 }}>{data.summary}</p>
              </div>
            )}
          </div>

          {/* STEPS */}
          {(data.steps || []).map((step, idx) => {
            const hasTitle = step.num && step.num !== "";

            // ── Normalizar a content[]: soporta formato nuevo y viejo ──
            const contentList = (() => {
              // Formato nuevo: content[] con kind
              if (Array.isArray(step.content) && step.content.length > 0)
                return step.content;
              // Formato viejo: campos planos → reconstruir orden aproximado
              const items = [];
              if (step.notes) items.push({ kind: "note", text: step.notes });
              if (step.code)
                items.push({
                  kind: "code",
                  lang: step.code_lang || "BASH",
                  code: step.code,
                });
              (step.images || []).forEach((img) =>
                items.push({ kind: "image", ...img }),
              );
              (step.bullet_list || []).forEach((t) =>
                items.push({ kind: "bullet", text: t }),
              );
              // callouts viejo: campo plano o array
              if (Array.isArray(step.callouts))
                step.callouts.forEach((c) =>
                  items.push({ kind: "callout", ...c }),
                );
              else if (step.callout_type)
                items.push({
                  kind: "callout",
                  type: step.callout_type,
                  label: step.callout_label || "",
                  text: step.callout_text || "",
                });
              return items;
            })();

            return (
              <div
                key={`${step.id}-${idx}`}
                id={step.id}
                style={{ marginBottom: "3rem", scrollMarginTop: "2rem" }}
              >
                {/* FLAG inline */}
                {step.type === "flag" && (
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,212,255,0.05))",
                      border: "1px solid #1a3a4a",
                      padding: "2rem",
                      position: "relative",
                      overflow: "hidden",
                      width: "50%",
                      margin: "auto",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "120px",
                        height: "2px",
                        background: "#00ff88",
                      }}
                    />
                    <h3
                      style={{
                        fontFamily: "monospace",
                        fontSize: "1.3rem",
                        color: "#00ff88",
                        letterSpacing: "4px",
                        marginBottom: "0.5rem",
                        textAlign: "center",
                      }}
                    >
                      ✓ {step.id.toUpperCase()}
                    </h3>
                    <p
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                        color: "#4a6a7a",
                        margin: "0 0 1.5rem",
                        textAlign: "center",
                      }}
                    >
                      {data.title} — {data.platform} · {data.difficulty}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "1rem",
                        justifyContent: "center",
                      }}
                    >
                      {(step.flag_items || []).map((flag, fi) => (
                        <div
                          key={fi}
                          style={{
                            minWidth: "180px",
                            flex: "1 1 180px",
                            maxWidth: "420px",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "monospace",
                              fontSize: "0.65rem",
                              color: "#4a6a7a",
                              letterSpacing: "2px",
                              textTransform: "uppercase",
                              marginBottom: "0.4rem",
                              textAlign: "center",
                            }}
                          >
                            // {flag.label}
                          </div>
                          <div
                            style={{
                              fontFamily: "monospace",
                              fontSize: "0.85rem",
                              background: "#020608",
                              border: "1px dashed #00ff88",
                              padding: "0.6rem 1rem",
                              color: "#00ff88",
                              letterSpacing: "1px",
                              textAlign: "center",
                              wordBreak: "break-all",
                            }}
                          >
                            {flag.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Título */}
                {hasTitle && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.8rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.72rem",
                        color: "#00ff88",
                        background: "rgba(0,255,136,0.08)",
                        border: "1px solid #1a3a4a",
                        padding: "3px 10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      PASO {step.num}
                    </span>
                    <h2
                      style={{
                        fontSize: "1.6rem",
                        fontWeight: 700,
                        color: "#fff",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        margin: 0,
                      }}
                    >
                      {step.title}
                    </h2>
                    <div
                      style={{
                        flex: 1,
                        height: "1px",
                        background:
                          "linear-gradient(to right, #1a3a4a, transparent)",
                      }}
                    />
                  </div>
                )}

                {/* ── Contenido ordenado — cada item en su posición exacta del .md ── */}
                {contentList.map((item, ci) => {
                  if (item.kind === "note")
                    return (
                      <p
                        key={ci}
                        style={{
                          color: "#c8d8e8",
                          marginBottom: "1rem",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {item.text}
                      </p>
                    );

                  if (item.kind === "code")
                    return (
                      <div
                        key={ci}
                        style={{
                          margin: "1.5rem 0",
                          border: "1px solid #1a3a4a",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            background: "#0d1f2d",
                            padding: "8px 16px",
                            display: "flex",
                            justifyContent: "space-between",
                            borderBottom: "1px solid #1a3a4a",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: "0.72rem",
                              color: "#4a6a7a",
                            }}
                          >
                            {step.title || "código"} — comandos
                          </span>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: "0.65rem",
                              color: "#00ff88",
                              background: "rgba(0,255,136,0.1)",
                              padding: "2px 8px",
                            }}
                          >
                            {item.lang}
                          </span>
                        </div>
                        <pre
                          style={{
                            background: "#020608",
                            padding: "1.2rem 1.5rem",
                            fontFamily: "'Share Tech Mono', monospace",
                            fontSize: "0.82rem",
                            color: "#00ff88",
                            overflowX: "auto",
                            lineHeight: "1.8",
                            whiteSpace: "pre-wrap",
                            margin: 0,
                          }}
                        >
                          {item.code}
                        </pre>
                      </div>
                    );

                  if (item.kind === "image")
                    return (
                      <div key={ci} style={{ margin: "1.5rem 0" }}>
                        <ImageBlock img={item} index={ci} />
                      </div>
                    );

                  if (item.kind === "bullet")
                    return (
                      <div
                        key={ci}
                        style={{
                          display: "flex",
                          gap: "0.8rem",
                          alignItems: "flex-start",
                          padding: "0.6rem 1rem",
                          background: "#0d1f2d",
                          border: "1px solid #1a3a4a",
                          margin: "0.3rem 0",
                        }}
                      >
                        <span
                          style={{
                            color: "#00ff88",
                            fontFamily: "monospace",
                            flexShrink: 0,
                          }}
                        >
                          →
                        </span>{" "}
                        {item.text}
                      </div>
                    );

                  if (item.kind === "callout") {
                    const c = calloutColors[item.type] || calloutColors.info;
                    const icon =
                      {
                        info: "ℹ",
                        warning: "⚠",
                        danger: "✕",
                        default: "✓",
                        tip: "💡",
                      }[item.type] || "ℹ";
                    return (
                      <div
                        key={ci}
                        style={{
                          borderLeft: `3px solid ${c.border}`,
                          background: c.bg,
                          padding: "1rem 1.2rem",
                          margin: "1rem 0",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.7rem",
                            letterSpacing: "2px",
                            color: c.label,
                            marginBottom: "0.4rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <span>{icon}</span>
                          <span>// {item.label}</span>
                        </div>
                        <p style={{ color: "#c8d8e8", margin: 0 }}>
                          {item.text}
                        </p>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            );
          })}

          {/* FLAGS */}
          {flagsList.length > 0 && (
            <div
              id="flags"
              style={{ margin: "3rem 0", scrollMarginTop: "2rem" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.8rem",
                  marginBottom: "1.5rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.72rem",
                    color: "#00ff88",
                    background: "rgba(0,255,136,0.08)",
                    border: "1px solid #1a3a4a",
                    padding: "3px 10px",
                    whiteSpace: "nowrap",
                  }}
                >
                  PASO {flagsNum}
                </span>
                <h2
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    color: "#fff",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    margin: 0,
                  }}
                >
                  Flags
                </h2>
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background:
                      "linear-gradient(to right, #1a3a4a, transparent)",
                  }}
                />
              </div>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,212,255,0.05))",
                  border: "1px solid #1a3a4a",
                  padding: "2rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "120px",
                    height: "2px",
                    background: "#00ff88",
                  }}
                />
                <h3
                  style={{
                    fontFamily: "monospace",
                    fontSize: "1.5rem",
                    color: "#00ff88",
                    letterSpacing: "4px",
                    marginBottom: "0.5rem",
                    textAlign: "center",
                  }}
                >
                  ✓ RECOPILACION
                </h3>
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.8rem",
                    color: "#4a6a7a",
                    margin: "0 0 1.5rem",
                    textAlign: "center",
                  }}
                >
                  {data.title} — {data.platform} · {data.difficulty}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1rem",
                    justifyContent: "center",
                  }}
                >
                  {flagsList.map((flag, i) => (
                    <div
                      key={i}
                      style={{
                        minWidth: "180px",
                        flex: "1 1 180px",
                        maxWidth: "420px",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.65rem",
                          color: "#4a6a7a",
                          letterSpacing: "2px",
                          textTransform: "uppercase",
                          marginBottom: "0.4rem",
                          textAlign: "center",
                        }}
                      >
                        // {flag.label}
                      </div>
                      <div
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                          background: "#020608",
                          border: "1px dashed #00ff88",
                          padding: "0.6rem 1rem",
                          color: "#00ff88",
                          letterSpacing: "1px",
                          textAlign: "center",
                          wordBreak: "break-all",
                        }}
                      >
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
            <div
              id="lessons"
              style={{ marginBottom: "3rem", scrollMarginTop: "2rem" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.8rem",
                  marginBottom: "1.5rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.72rem",
                    color: "#00ff88",
                    background: "rgba(0,255,136,0.08)",
                    border: "1px solid #1a3a4a",
                    padding: "3px 10px",
                    whiteSpace: "nowrap",
                  }}
                >
                  PASO {lessonsNum}
                </span>
                <h2
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    color: "#fff",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    margin: 0,
                  }}
                >
                  Lecciones Aprendidas
                </h2>
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background:
                      "linear-gradient(to right, #1a3a4a, transparent)",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                  marginBottom: "1.5rem",
                }}
              >
                {data.lessons.map((l, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "0.8rem",
                      alignItems: "flex-start",
                      padding: "0.6rem 1rem",
                      background: "#0d1f2d",
                      border: "1px solid #1a3a4a",
                    }}
                  >
                    <span
                      style={{
                        color: "#00ff88",
                        fontFamily: "monospace",
                        flexShrink: 0,
                      }}
                    >
                      →
                    </span>{" "}
                    {l}
                  </div>
                ))}
              </div>
              {data.mitigation && (
                <div
                  style={{
                    borderLeft: "3px solid #00d4ff",
                    background: "rgba(0,212,255,0.05)",
                    padding: "1rem 1.2rem",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.7rem",
                      letterSpacing: "2px",
                      color: "#00d4ff",
                      marginBottom: "0.4rem",
                    }}
                  >
                    // Mitigaciones recomendadas
                  </div>
                  <p style={{ color: "#c8d8e8", margin: 0 }}>
                    {data.mitigation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* FOOTER */}
          <div
            style={{
              marginTop: "4rem",
              paddingTop: "2rem",
              borderTop: "1px solid #1a3a4a",
              fontFamily: "monospace",
              fontSize: "0.75rem",
              color: "#4a6a7a",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
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

function ImageBlock({ img, index }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ border: "1px solid #1a3a4a", overflow: "hidden" }}>
      <div
        style={{
          background: "#0d1f2d",
          padding: "6px 16px",
          borderBottom: "1px solid #1a3a4a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.65rem",
              color: "#1a3a4a",
            }}
          >
            img_{String(index + 1).padStart(2, "0")}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              fontFamily: "monospace",
              fontSize: "0.65rem",
              color: "#00d4ff",
              background: "transparent",
              border: "1px solid #1a3a4a",
              padding: "2px 8px",
              cursor: "pointer",
            }}
          >
            {expanded ? "⊟ colapsar" : "⊞ expandir"}
          </button>
        </div>
      </div>
      <div
        style={{
          background: "#020608",
          padding: "1rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <img
          src={img.src}
          alt={img.caption || `evidencia ${index + 1}`}
          style={{
            maxWidth: "100%",
            maxHeight: expanded ? "none" : "350px",
            objectFit: "contain",
            border: "1px solid #1a3a4a",
            cursor: "pointer",
            transition: "max-height 0.3s ease",
          }}
          onClick={() => setExpanded(!expanded)}
        />
      </div>
      {img.caption && (
        <div
          style={{
            padding: "8px 16px",
            fontFamily: "monospace",
            fontSize: "0.72rem",
            color: "#4a6a7a",
            borderTop: "1px solid #1a3a4a",
            background: "#0d1f2d",
          }}
        >
          ↑ {img.caption}
        </div>
      )}
    </div>
  );
}
