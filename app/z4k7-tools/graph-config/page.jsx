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
const EXPANDABLE = ["platform", "os", "difficulty", "technique", "tool", "tag"];

const GITHUB_USER = "z4k73122";
const GITHUB_REPO = "z4k7";

export default function GraphConfigPage() {
  const [token, setToken] = useState("");
  const [tokenOk, setTokenOk] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [validating, setValidating] = useState(false);

  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [subColors, setSubColors] = useState({});
  const [expanded, setExpanded] = useState({});
  const [preview, setPreview] = useState(null);
  const [graphJson, setGraphJson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [step, setStep] = useState(1);

  // ── Validar token contra GitHub API ──────────────────────
  const handleValidateToken = async () => {
    setValidating(true);
    setTokenError("");
    try {
      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
          },
        },
      );
      if (res.ok) {
        setTokenOk(true);
      } else {
        const err = await res.json();
        setTokenError(err.message || "Token inválido o sin permisos");
      }
    } catch (e) {
      setTokenError("Error de conexión: " + e.message);
    } finally {
      setValidating(false);
    }
  };

  const getNodesByType = (type) =>
    preview?.nodes?.filter((n) => n.type === type) || [];
  const countByType = (type) => getNodesByType(type).length;
  const machines = preview?.nodes?.filter((n) => n.type === "machine") || [];

  const toggleExpand = (type) =>
    setExpanded((p) => ({ ...p, [type]: !p[type] }));
  const setSubColor = (label, color) =>
    setSubColors((p) => ({ ...p, [label]: color }));
  const resetSubColor = (label) =>
    setSubColors((p) => {
      const n = { ...p };
      delete n[label];
      return n;
    });

  const handleScan = async () => {
    setLoading(true);
    setGraphJson(null);
    setPreview(null);
    setSaved(false);
    setSaveError("");
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

  const handleGenerate = async () => {
    if (!preview) return;
    setSaveError("");
    const enrichedNodes = preview.nodes.map((n) => {
      const sub = subColors[n.label];
      return sub ? { ...n, color: sub } : n;
    });
    const body = { ...preview, nodes: enrichedNodes, colors, subColors };
    const json = JSON.stringify(body, null, 2);
    setGraphJson(json);
    setStep(3);
    try {
      const res = await fetch("/api/graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, token }),
      });
      const result = await res.json();
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      } else setSaveError(result.error || "Error al guardar");
    } catch (e) {
      setSaveError(e.message);
    }
  };

  const handleReset = async () => {
    setStep(1);
    setPreview(null);
    setGraphJson(null);
    setColors(DEFAULT_COLORS);
    setSubColors({});
    setExpanded({});
    setCopied(false);
    setSaved(false);
    setSaveError("");
    await fetch("/api/graph", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).catch(() => {});
  };

  const handleCopy = () => {
    if (!graphJson) return;
    navigator.clipboard.writeText(graphJson).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const card = {
    background: "#0a1520",
    border: "1px solid #1a3a4a",
    padding: "1.2rem 1.4rem",
    marginBottom: "0.6rem",
  };

  // ════════════════════════════════════════════════════════
  // PANTALLA TOKEN
  // ════════════════════════════════════════════════════════
  if (!tokenOk) {
    return (
      <div
        style={{
          background: "#050a0e",
          minHeight: "100vh",
          color: "#c8d8e8",
          fontFamily: "'Share Tech Mono',monospace",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(0,212,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.015) 1px,transparent 1px)",
            backgroundSize: "32px 32px",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: "480px",
            padding: "2rem",
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "0.72rem",
              color: "#00ff88",
              letterSpacing: "3px",
              marginBottom: "0.4rem",
            }}
          >
            {"<z4k7_tools/>"}
          </div>
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: "0.4rem",
            }}
          >
            graph-config
          </h1>
          <div
            style={{
              height: "1px",
              background: "linear-gradient(to right,#1a3a4a,transparent)",
              marginBottom: "2.5rem",
            }}
          />

          <div
            style={{
              fontFamily: "monospace",
              fontSize: "0.62rem",
              color: "#4a6a7a",
              letterSpacing: "2px",
              marginBottom: "0.6rem",
            }}
          >
            // GITHUB TOKEN
          </div>
          <div
            style={{
              fontSize: "0.68rem",
              color: "#4a6a7a",
              marginBottom: "1.2rem",
              lineHeight: 1.8,
            }}
          >
            Necesario para leer y guardar{" "}
            <span style={{ color: "#00d4ff" }}>data/graph.json</span> en el
            repo.
            <br />
            github.com → Settings → Developer settings → Tokens (classic) →{" "}
            <span style={{ color: "#00ff88" }}>repo ✓</span>
          </div>

          <input
            type="password"
            placeholder="ghp_..."
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              setTokenError("");
            }}
            onKeyDown={(e) =>
              e.key === "Enter" && token && handleValidateToken()
            }
            style={{
              width: "100%",
              fontFamily: "monospace",
              fontSize: "0.75rem",
              padding: "12px 14px",
              background: "#060d14",
              border: `1px solid ${tokenError ? "#ff3366" : token ? "#00d4ff" : "#1a3a4a"}`,
              color: "#c8d8e8",
              outline: "none",
              letterSpacing: "1px",
              boxSizing: "border-box",
              marginBottom: "0.8rem",
            }}
          />

          {tokenError && (
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "0.65rem",
                color: "#ff3366",
                marginBottom: "0.8rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span>✕</span> {tokenError}
            </div>
          )}

          <button
            onClick={handleValidateToken}
            disabled={!token || validating}
            style={{
              width: "100%",
              fontFamily: "monospace",
              fontSize: "0.78rem",
              padding: "12px",
              border: `1px solid ${!token ? "#1a3a4a" : "#00ff88"}`,
              background: !token ? "transparent" : "rgba(0,255,136,0.08)",
              color: !token ? "#1a3a4a" : "#00ff88",
              cursor: !token || validating ? "not-allowed" : "pointer",
              letterSpacing: "2px",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              if (token && !validating)
                e.currentTarget.style.background = "rgba(0,255,136,0.18)";
            }}
            onMouseOut={(e) => {
              if (token && !validating)
                e.currentTarget.style.background = "rgba(0,255,136,0.08)";
            }}
          >
            {validating ? "// Validando..." : "// Validar token →"}
          </button>

          <div
            style={{
              marginTop: "1.5rem",
              fontFamily: "monospace",
              fontSize: "0.6rem",
              color: "#1a3a4a",
              textAlign: "center",
            }}
          >
            El token no se guarda — solo se usa en esta sesión
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // PANEL PRINCIPAL
  // ════════════════════════════════════════════════════════
  return (
    <div
      style={{
        background: "#050a0e",
        minHeight: "100vh",
        color: "#c8d8e8",
        fontFamily: "'Share Tech Mono',monospace",
      }}
    >
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
          <span style={{ color: "#1a3a4a" }}>|</span>
          <span style={{ color: "#00ff88", fontSize: "0.62rem" }}>
            ✓ token ok
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
        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
          <button
            onClick={() => {
              setTokenOk(false);
              setToken("");
            }}
            style={{
              fontFamily: "monospace",
              fontSize: "0.62rem",
              padding: "3px 10px",
              border: "1px solid #1a3a4a",
              background: "transparent",
              color: "#4a6a7a",
              cursor: "pointer",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "#ff8c00";
              e.currentTarget.style.borderColor = "#ff8c00";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "#4a6a7a";
              e.currentTarget.style.borderColor = "#1a3a4a";
            }}
          >
            // cambiar token
          </button>
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
              e.currentTarget.style.color = "#ff3366";
              e.currentTarget.style.borderColor = "#ff3366";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "#4a6a7a";
              e.currentTarget.style.borderColor = "#1a3a4a";
            }}
          >
            // reset
          </button>
        </div>
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
        {/* ════ PASO 1 ════ */}
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
                <span style={{ color: "#00ff88" }}>content/</span> y extrae
                nodos + conexiones.
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

        {/* ════ PASO 2 ════ */}
        {step >= 2 && (
          <div style={{ marginBottom: "3rem" }}>
            <StepHeader
              num="02"
              title="Asignar Colores"
              done={step > 2}
              active={step === 2}
            />
            <div style={{ marginTop: "1.5rem" }}>
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
                              setColors((p) => ({
                                ...p,
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
                                display: "inline-block",
                                transform: isOpen
                                  ? "rotate(90deg)"
                                  : "rotate(0deg)",
                                transition: "transform 0.2s",
                              }}
                            >
                              ▶
                            </span>
                          )}
                        </div>
                      </div>
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
                            // COLOR INDIVIDUAL
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
                        </div>
                      )}
                    </div>
                  );
                })}
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
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "rgba(0,255,136,0.18)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "rgba(0,255,136,0.08)")
                  }
                >
                  // Generar y Guardar →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════ PASO 3 ════ */}
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
                    ✓ Guardado en GitHub — Vercel redesplegará en ~30 segundos
                  </span>
                </div>
              )}
              {saveError && (
                <div
                  style={{
                    background: "rgba(255,51,102,0.06)",
                    border: "1px solid #ff3366",
                    padding: "0.8rem 1.2rem",
                    marginBottom: "1rem",
                  }}
                >
                  <span
                    style={{
                      color: "#ff3366",
                      fontSize: "0.75rem",
                      letterSpacing: "1px",
                    }}
                  >
                    ✕ Error: {saveError}
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
