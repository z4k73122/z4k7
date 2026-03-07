"use client";
import { useState } from "react";

const DEFAULT_COLORS = {
  machine: "#00d4ff",
  platform: "#ff8c00",
  os: "#ffcc00",
  difficulty: "#b06aff",
  technique: "#ff3366",
  tool: "#00ffcc",
  tag: "#00ff88",
};

const TYPE_LABELS = {
  machine: "Máquina / Lab",
  platform: "Plataforma",
  os: "Sistema OS",
  difficulty: "Dificultad",
  technique: "Técnica",
  tool: "Herramienta",
  tag: "Tag",
};

const TYPE_ORDER = [
  "machine",
  "platform",
  "os",
  "difficulty",
  "technique",
  "tool",
  "tag",
];

// Tipos que soportan subcolores por valor
const EXPANDABLE = ["platform", "os", "difficulty", "technique", "tool", "tag"];

export default function GraphConfigPage() {
  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [subColors, setSubColors] = useState({}); // { "HackTheBox": "#ff0000", "Easy": "#00ff00" }
  const [expanded, setExpanded] = useState({}); // { platform: true, difficulty: false }
  const [preview, setPreview] = useState(null);
  const [graphJson, setGraphJson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [step, setStep] = useState(1);

  // ── Helpers ───────────────────────────────────────────────
  const getNodesByType = (type) =>
    preview?.nodes?.filter((n) => n.type === type) || [];

  const countByType = (type) => getNodesByType(type).length;

  const machines = preview?.nodes?.filter((n) => n.type === "machine") || [];

  const toggleExpand = (type) =>
    setExpanded((prev) => ({ ...prev, [type]: !prev[type] }));

  const setSubColor = (label, color) =>
    setSubColors((prev) => ({ ...prev, [label]: color }));

  const resetSubColor = (label) =>
    setSubColors((prev) => {
      const n = { ...prev };
      delete n[label];
      return n;
    });

  // ── Escanear ──────────────────────────────────────────────
  const handleScan = async () => {
    setLoading(true);
    setGraphJson(null);
    setPreview(null);
    setSaved(false);
    try {
      const res = await fetch("/api/graph");
      const data = await res.json();
      setPreview(data);
      setStep(2);
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Generar + Guardar ─────────────────────────────────────
  const handleGenerate = async () => {
    if (!preview) return;

    // Enriquecer nodos con subcolores individuales
    const enrichedNodes = preview.nodes.map((n) => {
      const sub = subColors[n.label];
      return sub ? { ...n, color: sub } : n;
    });

    const body = {
      ...preview,
      nodes: enrichedNodes,
      colors,
      subColors,
    };

    const json = JSON.stringify(body, null, 2);
    setGraphJson(json);
    setStep(3);

    try {
      const res = await fetch("/api/graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      }
    } catch (e) {
      console.error("Error guardando:", e);
    }
  };

  // ── Copiar ────────────────────────────────────────────────
  const handleCopy = () => {
    if (!graphJson) return;
    navigator.clipboard.writeText(graphJson).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Reset ─────────────────────────────────────────────────
  const handleReset = () => {
    setStep(1);
    setPreview(null);
    setGraphJson(null);
    setColors(DEFAULT_COLORS);
    setSubColors({});
    setExpanded({});
    setCopied(false);
    setSaved(false);
  };

  const card = {
    background: "#0a1520",
    border: "1px solid #1a3a4a",
    padding: "1.2rem 1.4rem",
    marginBottom: "0.6rem",
  };

  return (
    <div
      style={{
        background: "#050a0e",
        minHeight: "100vh",
        color: "#c8d8e8",
        fontFamily: "'Share Tech Mono', monospace",
      }}
    >
      {/* Grid bg */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.015) 1px,transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* TOPBAR */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "rgba(5,10,14,0.97)",
          borderBottom: "1px solid #1a3a4a",
          padding: "0 2rem",
          height: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 100,
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            fontSize: "0.78rem",
          }}
        >
          <span style={{ color: "#4a6a7a" }}>z4k7-tools</span>
          <span style={{ color: "#1a3a4a" }}>/</span>
          <span style={{ color: "#00ff88", letterSpacing: "2px" }}>
            graph-config
          </span>
        </div>
        <div style={{ display: "flex", gap: "2rem", fontSize: "0.65rem" }}>
          {[
            ["01", "ESCANEAR"],
            ["02", "COLOREAR"],
            ["03", "JSON"],
          ].map(([n, label], i) => (
            <span
              key={n}
              style={{
                color:
                  step > i + 1
                    ? "#00ff88"
                    : step === i + 1
                      ? "#00d4ff"
                      : "#1a3a4a",
                letterSpacing: "1px",
                transition: "color 0.3s",
              }}
            >
              {n} · {label} {step > i + 1 ? "✓" : ""}
            </span>
          ))}
        </div>
        <button
          onClick={handleReset}
          style={{
            fontFamily: "monospace",
            fontSize: "0.68rem",
            padding: "4px 14px",
            border: "1px solid #1a3a4a",
            background: "transparent",
            color: "#4a6a7a",
            cursor: "pointer",
            letterSpacing: "1px",
          }}
          onMouseOver={(e) => {
            e.target.style.color = "#ff3366";
            e.target.style.borderColor = "#ff3366";
          }}
          onMouseOut={(e) => {
            e.target.style.color = "#4a6a7a";
            e.target.style.borderColor = "#1a3a4a";
          }}
        >
          // reset
        </button>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "900px",
          margin: "0 auto",
          padding: "3rem 2rem",
        }}
      >
        {/* ════ PASO 1 — ESCANEAR ════ */}
        <div style={{ marginBottom: "3rem" }}>
          <StepHeader
            num="01"
            title="Escanear Write-ups"
            done={step > 1}
            active={step === 1}
          />

          {step === 1 && (
            <div style={{ marginTop: "1.5rem" }}>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "#4a6a7a",
                  marginBottom: "1.5rem",
                  lineHeight: 1.8,
                }}
              >
                Lee todos los <span style={{ color: "#00d4ff" }}>.md</span> de{" "}
                <span style={{ color: "#00ff88" }}>content/writeups/</span> y
                extrae nodos + conexiones.
              </p>
              <button
                onClick={handleScan}
                disabled={loading}
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.78rem",
                  padding: "10px 28px",
                  border: "1px solid #00d4ff",
                  background: loading ? "transparent" : "rgba(0,212,255,0.08)",
                  color: "#00d4ff",
                  cursor: loading ? "not-allowed" : "pointer",
                  letterSpacing: "2px",
                }}
                onMouseOver={(e) => {
                  if (!loading)
                    e.currentTarget.style.background = "rgba(0,212,255,0.18)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = loading
                    ? "transparent"
                    : "rgba(0,212,255,0.08)";
                }}
              >
                {loading ? "// Escaneando..." : "// Escanear write-ups"}
              </button>
            </div>
          )}

          {step > 1 && preview && (
            <div style={{ marginTop: "1.5rem" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))",
                  gap: "0.7rem",
                  marginBottom: "1.5rem",
                }}
              >
                {TYPE_ORDER.map((type) => (
                  <div
                    key={type}
                    style={{
                      ...card,
                      borderColor: DEFAULT_COLORS[type] + "44",
                      marginBottom: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.58rem",
                        color: "#4a6a7a",
                        letterSpacing: "2px",
                        marginBottom: "0.4rem",
                      }}
                    >
                      {TYPE_LABELS[type].toUpperCase()}
                    </div>
                    <div
                      style={{
                        fontSize: "1.8rem",
                        fontWeight: 700,
                        color: DEFAULT_COLORS[type],
                        lineHeight: 1,
                      }}
                    >
                      {countByType(type)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.58rem",
                        color: "#4a6a7a",
                        marginTop: "0.2rem",
                      }}
                    >
                      nodos
                    </div>
                  </div>
                ))}
                <div style={{ ...card, marginBottom: 0 }}>
                  <div
                    style={{
                      fontSize: "0.58rem",
                      color: "#4a6a7a",
                      letterSpacing: "2px",
                      marginBottom: "0.4rem",
                    }}
                  >
                    CONEXIONES
                  </div>
                  <div
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: 700,
                      color: "#c8d8e8",
                      lineHeight: 1,
                    }}
                  >
                    {preview.links?.length || 0}
                  </div>
                  <div
                    style={{
                      fontSize: "0.58rem",
                      color: "#4a6a7a",
                      marginTop: "0.2rem",
                    }}
                  >
                    links
                  </div>
                </div>
              </div>

              {machines.length > 0 && (
                <div style={card}>
                  <div
                    style={{
                      fontSize: "0.62rem",
                      color: "#4a6a7a",
                      letterSpacing: "2px",
                      marginBottom: "0.8rem",
                    }}
                  >
                    // MÁQUINAS DETECTADAS
                  </div>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                  >
                    {machines.map((m) => (
                      <div
                        key={m.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          background: "#050a0e",
                          border: "1px solid #1a3a4a",
                          padding: "5px 12px",
                        }}
                      >
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background:
                              m.status === "pwned" ? "#00ff88" : "#4a6a7a",
                          }}
                        />
                        <span style={{ fontSize: "0.72rem", color: "#c8d8e8" }}>
                          {m.label}
                        </span>
                        <span style={{ fontSize: "0.62rem", color: "#4a6a7a" }}>
                          {m.platform} · {m.difficulty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ════ PASO 2 — COLOREAR ════ */}
        {step >= 2 && (
          <div style={{ marginBottom: "3rem" }}>
            <StepHeader
              num="02"
              title="Asignar Colores"
              done={step > 2}
              active={step === 2}
            />

            <div style={{ marginTop: "1.5rem" }}>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "#4a6a7a",
                  marginBottom: "1.2rem",
                  lineHeight: 1.8,
                }}
              >
                Color base por tipo. Los tipos expandibles permiten asignar
                colores individuales a cada valor.
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                  marginBottom: "1.5rem",
                }}
              >
                {TYPE_ORDER.map((type) => {
                  const isExpandable = EXPANDABLE.includes(type);
                  const isOpen = expanded[type];
                  const subNodes = getNodesByType(type);

                  return (
                    <div key={type}>
                      {/* Fila principal */}
                      <div
                        style={{
                          ...card,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 0,
                          cursor: isExpandable ? "pointer" : "default",
                        }}
                        onClick={() => isExpandable && toggleExpand(type)}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.8rem",
                          }}
                        >
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              background: colors[type],
                              boxShadow: `0 0 8px ${colors[type]}`,
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <div
                              style={{ fontSize: "0.72rem", color: "#c8d8e8" }}
                            >
                              {TYPE_LABELS[type]}
                            </div>
                            <div
                              style={{
                                fontSize: "0.6rem",
                                color: "#4a6a7a",
                                marginTop: "1px",
                              }}
                            >
                              {countByType(type)} nodos
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.8rem",
                          }}
                        >
                          <span
                            style={{ fontSize: "0.62rem", color: "#4a6a7a" }}
                          >
                            {colors[type]}
                          </span>
                          <input
                            type="color"
                            value={colors[type]}
                            onChange={(e) => {
                              e.stopPropagation();
                              setColors((prev) => ({
                                ...prev,
                                [type]: e.target.value,
                              }));
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              width: "32px",
                              height: "26px",
                              border: "1px solid #1a3a4a",
                              background: "#0a1520",
                              cursor: "pointer",
                              padding: "1px",
                            }}
                          />
                          {isExpandable && (
                            <span
                              style={{
                                fontSize: "0.7rem",
                                color: "#4a6a7a",
                                marginLeft: "0.4rem",
                                transition: "transform 0.2s",
                                display: "inline-block",
                                transform: isOpen
                                  ? "rotate(90deg)"
                                  : "rotate(0deg)",
                              }}
                            >
                              ▶
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Sub-colores expandidos */}
                      {isExpandable && isOpen && subNodes.length > 0 && (
                        <div
                          style={{
                            background: "#060d14",
                            border: "1px solid #1a3a4a",
                            borderTop: "none",
                            padding: "0.6rem 1rem",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.58rem",
                              color: "#4a6a7a",
                              letterSpacing: "2px",
                              marginBottom: "0.6rem",
                            }}
                          >
                            // COLOR INDIVIDUAL (opcional)
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.4rem",
                            }}
                          >
                            {subNodes.map((n) => {
                              const subColor = subColors[n.label];
                              const activeColor = subColor || colors[type];
                              return (
                                <div
                                  key={n.id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "6px 10px",
                                    background: "#0a1520",
                                    border: `1px solid ${subColor ? activeColor + "66" : "#1a3a4a"}`,
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "0.6rem",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        background: activeColor,
                                        boxShadow: `0 0 5px ${activeColor}`,
                                      }}
                                    />
                                    <span
                                      style={{
                                        fontSize: "0.72rem",
                                        color: subColor ? "#fff" : "#c8d8e8",
                                      }}
                                    >
                                      {n.label}
                                    </span>
                                    {subColor && (
                                      <span
                                        style={{
                                          fontSize: "0.58rem",
                                          color: "#4a6a7a",
                                        }}
                                      >
                                        custom
                                      </span>
                                    )}
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "0.6rem",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: "0.6rem",
                                        color: "#4a6a7a",
                                      }}
                                    >
                                      {activeColor}
                                    </span>
                                    {subColor && (
                                      <button
                                        onClick={() => resetSubColor(n.label)}
                                        style={{
                                          fontFamily: "monospace",
                                          fontSize: "0.58rem",
                                          padding: "2px 8px",
                                          border: "1px solid #ff336644",
                                          background: "transparent",
                                          color: "#ff3366",
                                          cursor: "pointer",
                                        }}
                                      >
                                        reset
                                      </button>
                                    )}
                                    <input
                                      type="color"
                                      value={activeColor}
                                      onChange={(e) =>
                                        setSubColor(n.label, e.target.value)
                                      }
                                      style={{
                                        width: "28px",
                                        height: "22px",
                                        border: "1px solid #1a3a4a",
                                        background: "#0a1520",
                                        cursor: "pointer",
                                        padding: "1px",
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div
                            style={{
                              fontSize: "0.6rem",
                              color: "#1a3a4a",
                              marginTop: "0.6rem",
                            }}
                          >
                            // Si no asignas color individual, se usa el color
                            base del tipo
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Preview */}
              <div style={{ ...card, marginBottom: "1.5rem" }}>
                <div
                  style={{
                    fontSize: "0.62rem",
                    color: "#4a6a7a",
                    letterSpacing: "2px",
                    marginBottom: "0.8rem",
                  }}
                >
                  // PREVIEW
                </div>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  {TYPE_ORDER.map((type) => (
                    <div
                      key={type}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: colors[type],
                          boxShadow: `0 0 6px ${colors[type]}`,
                        }}
                      />
                      <span
                        style={{ fontSize: "0.68rem", color: colors[type] }}
                      >
                        {TYPE_LABELS[type]}
                      </span>
                    </div>
                  ))}
                  {/* Sub-colores custom */}
                  {Object.entries(subColors).map(([label, color]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: color,
                          boxShadow: `0 0 6px ${color}`,
                        }}
                      />
                      <span style={{ fontSize: "0.68rem", color: color }}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={() => {
                    setColors(DEFAULT_COLORS);
                    setSubColors({});
                  }}
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.72rem",
                    padding: "9px 20px",
                    border: "1px solid #1a3a4a",
                    background: "transparent",
                    color: "#4a6a7a",
                    cursor: "pointer",
                    letterSpacing: "1px",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = "#ff3366";
                    e.currentTarget.style.borderColor = "#ff3366";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = "#4a6a7a";
                    e.currentTarget.style.borderColor = "#1a3a4a";
                  }}
                >
                  // reset colores
                </button>
                <button
                  onClick={handleGenerate}
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.78rem",
                    padding: "9px 28px",
                    border: "1px solid #00ff88",
                    background: "rgba(0,255,136,0.08)",
                    color: "#00ff88",
                    cursor: "pointer",
                    letterSpacing: "2px",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "rgba(0,255,136,0.18)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "rgba(0,255,136,0.08)";
                  }}
                >
                  // Generar y Guardar →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════ PASO 3 — JSON ════ */}
        {step >= 3 && graphJson && (
          <div style={{ marginBottom: "3rem" }}>
            <StepHeader
              num="03"
              title="JSON Generado"
              done={false}
              active={true}
            />
            <div style={{ marginTop: "1.5rem" }}>
              {saved && (
                <div
                  style={{
                    background: "rgba(0,255,136,0.06)",
                    border: "1px solid #00ff88",
                    padding: "0.8rem 1.2rem",
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.8rem",
                  }}
                >
                  <span
                    style={{
                      color: "#00ff88",
                      fontSize: "0.75rem",
                      letterSpacing: "1px",
                    }}
                  >
                    ✓ Guardado en data/graph.json
                  </span>
                </div>
              )}
              <div
                style={{
                  background: "#020608",
                  border: "1px solid #1a3a4a",
                  borderLeft: "3px solid #00ff88",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.6rem 1rem",
                    borderBottom: "1px solid #1a3a4a",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.62rem",
                      color: "#4a6a7a",
                      letterSpacing: "2px",
                    }}
                  >
                    // data/graph.json
                  </span>
                  <div style={{ display: "flex", gap: "0.8rem" }}>
                    <button
                      onClick={handleGenerate}
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.65rem",
                        padding: "3px 12px",
                        border: "1px solid #1a3a4a",
                        background: "transparent",
                        color: "#4a6a7a",
                        cursor: "pointer",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = "#00d4ff";
                        e.currentTarget.style.borderColor = "#00d4ff";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = "#4a6a7a";
                        e.currentTarget.style.borderColor = "#1a3a4a";
                      }}
                    >
                      // Re-generar
                    </button>
                    <button
                      onClick={handleCopy}
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.65rem",
                        padding: "3px 12px",
                        border: `1px solid ${copied ? "#00ff88" : "#1a3a4a"}`,
                        background: copied
                          ? "rgba(0,255,136,0.1)"
                          : "transparent",
                        color: copied ? "#00ff88" : "#4a6a7a",
                        cursor: "pointer",
                      }}
                    >
                      {copied ? "✓ Copiado" : "// Copiar"}
                    </button>
                  </div>
                </div>
                <pre
                  style={{
                    padding: "1.2rem 1.5rem",
                    fontSize: "0.7rem",
                    color: "#00ff88",
                    overflowX: "auto",
                    maxHeight: "380px",
                    overflowY: "auto",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {graphJson}
                </pre>
              </div>
              <div
                style={{
                  ...card,
                  marginTop: "1rem",
                  borderColor: "rgba(0,212,255,0.2)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.62rem",
                    color: "#4a6a7a",
                    letterSpacing: "2px",
                    marginBottom: "0.6rem",
                  }}
                >
                  // PRÓXIMO PASO
                </div>
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: "#c8d8e8",
                    margin: 0,
                    lineHeight: 1.9,
                  }}
                >
                  Guardado en{" "}
                  <span style={{ color: "#00ff88" }}>data/graph.json</span>.
                  <br />
                  Cuando agregues write-ups, vuelve aquí →{" "}
                  <span style={{ color: "#ffcc00" }}>Escanear → Generar</span>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepHeader({ num, title, done, active }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "0.72rem",
          color: done ? "#00ff88" : active ? "#00d4ff" : "#1a3a4a",
          letterSpacing: "2px",
        }}
      >
        {done ? `${num} ✓` : num}
      </span>
      <h2
        style={{
          fontSize: "1.3rem",
          fontWeight: 700,
          color: done ? "#4a6a7a" : active ? "#fff" : "#1a3a4a",
          letterSpacing: "2px",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          flex: 1,
          height: "1px",
          background: done
            ? "#00ff8844"
            : active
              ? "linear-gradient(to right,#1a3a4a,transparent)"
              : "#0d1f2d",
        }}
      />
    </div>
  );
}
