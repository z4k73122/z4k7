"use client";
import { useState } from "react";
import "../../graph.css"; // ajusta la ruta según tu estructura

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

// ── Step Header ──────────────────────────────────────────────────────────────
function StepHeader({ num, title, done, active }) {
  const state = done ? "done" : active ? "active" : "idle";
  return (
    <div className="graph-step-header">
      <span className={`graph-step-num ${state}`}>
        {done ? `${num} ✓` : num}
      </span>
      <h2 className={`graph-step-title ${state}`}>{title}</h2>
      <div className={`graph-step-line ${state}`} />
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
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

  // ── Validar token ────────────────────────────────────────────────────────
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

  // ── Helpers ──────────────────────────────────────────────────────────────
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

  // ── Scan ─────────────────────────────────────────────────────────────────
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

  // ── Generate + Save ───────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!preview) return;
    setSaveError("");
    const enrichedNodes = preview.nodes.map((n) => {
      const sub = subColors[n.label];
      return sub ? { ...n, color: sub } : n;
    });
    const body = { ...preview, nodes: enrichedNodes, colors, subColors };
    setGraphJson(JSON.stringify(body, null, 2));
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

  // ── Reset ─────────────────────────────────────────────────────────────────
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

  // ── Copy ──────────────────────────────────────────────────────────────────
  const handleCopy = () => {
    if (!graphJson) return;
    navigator.clipboard.writeText(graphJson).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ════════════════════════════════════════════════════════════════════════
  // PANTALLA TOKEN
  // ════════════════════════════════════════════════════════════════════════
  if (!tokenOk) {
    return (
      <div className="graph-token-screen">
        <div className="graph-grid-bg" />
        <div className="graph-token-box">
          <div className="graph-token-tag">
            &lt;<span style={{ color: "#00d4ff" }}>Z4k7</span>_tools/&gt;
          </div>
          <h1 className="graph-token-title">graph-config</h1>
          <div className="graph-token-divider" />

          <div className="graph-token-label">// GITHUB TOKEN</div>
          <p className="graph-token-desc">
            Necesario para leer y guardar{" "}
            <span style={{ color: "#00d4ff" }}>data/graph.json</span> en el
            repo.
            <br />
            <span style={{ color: "#00ff88" }}>repo ✓</span>
          </p>

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
            className={`graph-token-input${tokenError ? " has-error" : token ? " has-value" : ""}`}
          />

          {tokenError && (
            <div className="graph-token-error">
              <span>✕</span> {tokenError}
            </div>
          )}

          <button
            onClick={handleValidateToken}
            disabled={!token || validating}
            className={`graph-token-btn${token && !validating ? " active" : ""}`}
          >
            {validating ? "// Validando..." : "// Validar token →"}
          </button>

          <div className="graph-token-hint">
            El token no se guarda — solo se usa en esta sesión
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // PANEL PRINCIPAL
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="graph-page">
      <div className="graph-grid-bg" />

      {/* ── Topbar ── */}
      <div className="graph-topbar">
        <div className="graph-topbar-left">
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

        <div className="graph-topbar-steps">
          {[
            ["01", "ESCANEAR"],
            ["02", "COLOREAR"],
            ["03", "JSON"],
          ].map(([n, label], i) => (
            <span
              key={n}
              className={`graph-topbar-step ${step > i + 1 ? "done" : step === i + 1 ? "active" : "idle"}`}
            >
              {n} · {label} {step > i + 1 ? "✓" : ""}
            </span>
          ))}
        </div>

        <div className="graph-topbar-actions">
          <button
            className="graph-topbar-btn"
            onClick={() => {
              setTokenOk(false);
              setToken("");
            }}
          >
            // cambiar token
          </button>
          <button className="graph-topbar-reset" onClick={handleReset}>
            // reset
          </button>
        </div>
      </div>

      <div className="graph-inner">
        {/* ════ PASO 1 ════ */}
        <div className="graph-section">
          <StepHeader
            num="01"
            title="Escanear Write-ups"
            done={step > 1}
            active={step === 1}
          />
          {step === 1 && (
            <div className="graph-section-body">
              <p className="graph-section-desc">
                Lee todos los <span style={{ color: "#00d4ff" }}>.md</span> de{" "}
                <span style={{ color: "#00ff88" }}>content/</span> y extrae
                nodos + conexiones.
              </p>
              <button
                onClick={handleScan}
                disabled={loading}
                className="graph-scan-btn"
              >
                {loading ? "// Escaneando..." : "// Escanear write-ups"}
              </button>
            </div>
          )}

          {step > 1 && preview && (
            <div className="graph-section-body">
              {/* Stats */}
              <div className="graph-stats-grid">
                {TYPE_ORDER.map((type) => (
                  <div
                    key={type}
                    className="graph-stat-card"
                    style={{ borderColor: DEFAULT_COLORS[type] + "44" }}
                  >
                    <div className="graph-stat-label">
                      {TYPE_LABELS[type].toUpperCase()}
                    </div>
                    <div
                      className="graph-stat-value"
                      style={{ color: DEFAULT_COLORS[type] }}
                    >
                      {countByType(type)}
                    </div>
                    <div className="graph-stat-sub">nodos</div>
                  </div>
                ))}
                <div className="graph-stat-card">
                  <div className="graph-stat-label">CONEXIONES</div>
                  <div
                    className="graph-stat-value"
                    style={{ color: "#c8d8e8" }}
                  >
                    {preview.links?.length || 0}
                  </div>
                  <div className="graph-stat-sub">links</div>
                </div>
              </div>

              {/* Machines */}
              {machines.length > 0 && (
                <div className="graph-machines-card">
                  <div className="graph-machines-label">
                    // MÁQUINAS DETECTADAS
                  </div>
                  <div className="graph-machines-list">
                    {machines.map((m) => (
                      <div key={m.id} className="graph-machine-chip">
                        <div
                          className="graph-machine-dot"
                          style={{
                            background:
                              m.status === "pwned" ? "#00ff88" : "#4a6a7a",
                          }}
                        />
                        <span className="graph-machine-name">{m.label}</span>
                        <span className="graph-machine-meta">
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
          <div className="graph-section">
            <StepHeader
              num="02"
              title="Asignar Colores"
              done={step > 2}
              active={step === 2}
            />
            <div className="graph-section-body">
              <div className="graph-color-list">
                {TYPE_ORDER.map((type) => {
                  const isExpandable = EXPANDABLE.includes(type);
                  const isOpen = expanded[type];
                  const subNodes = getNodesByType(type);

                  return (
                    <div key={type}>
                      <div
                        className={`graph-color-row${!isExpandable ? " not-expandable" : ""}`}
                        onClick={() => isExpandable && toggleExpand(type)}
                      >
                        <div className="graph-color-row-left">
                          <div
                            className="graph-color-dot"
                            style={{
                              background: colors[type],
                              boxShadow: `0 0 8px ${colors[type]}`,
                            }}
                          />
                          <div>
                            <div className="graph-color-type-name">
                              {TYPE_LABELS[type]}
                            </div>
                            <div className="graph-color-type-count">
                              {countByType(type)} nodos
                            </div>
                          </div>
                        </div>
                        <div className="graph-color-row-right">
                          <span className="graph-color-hex">
                            {colors[type]}
                          </span>
                          <input
                            type="color"
                            value={colors[type]}
                            className="graph-color-picker"
                            onChange={(e) => {
                              e.stopPropagation();
                              setColors((p) => ({
                                ...p,
                                [type]: e.target.value,
                              }));
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          {isExpandable && (
                            <span
                              className={`graph-expand-arrow${isOpen ? " open" : ""}`}
                            >
                              ▶
                            </span>
                          )}
                        </div>
                      </div>

                      {isExpandable && isOpen && subNodes.length > 0 && (
                        <div className="graph-subcolor-panel">
                          <div className="graph-subcolor-label">
                            // COLOR INDIVIDUAL
                          </div>
                          <div className="graph-subcolor-list">
                            {subNodes.map((n) => {
                              const subColor = subColors[n.label];
                              const activeColor = subColor || colors[type];
                              return (
                                <div
                                  key={n.id}
                                  className="graph-subcolor-item"
                                  style={{
                                    borderColor: subColor
                                      ? activeColor + "66"
                                      : "#1a3a4a",
                                  }}
                                >
                                  <div className="graph-subcolor-item-left">
                                    <div
                                      className="graph-subcolor-dot"
                                      style={{
                                        background: activeColor,
                                        boxShadow: `0 0 5px ${activeColor}`,
                                      }}
                                    />
                                    <span
                                      className={`graph-subcolor-name${subColor ? " custom" : ""}`}
                                    >
                                      {n.label}
                                    </span>
                                    {subColor && (
                                      <span className="graph-subcolor-badge">
                                        custom
                                      </span>
                                    )}
                                  </div>
                                  <div className="graph-subcolor-item-right">
                                    <span className="graph-subcolor-hex">
                                      {activeColor}
                                    </span>
                                    {subColor && (
                                      <button
                                        className="graph-subcolor-reset"
                                        onClick={() => resetSubColor(n.label)}
                                      >
                                        reset
                                      </button>
                                    )}
                                    <input
                                      type="color"
                                      value={activeColor}
                                      className="graph-subcolor-picker"
                                      onChange={(e) =>
                                        setSubColor(n.label, e.target.value)
                                      }
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

              <div className="graph-color-actions">
                <button
                  className="graph-reset-colors-btn"
                  onClick={() => {
                    setColors(DEFAULT_COLORS);
                    setSubColors({});
                  }}
                >
                  // reset colores
                </button>
                <button className="graph-generate-btn" onClick={handleGenerate}>
                  // Generar y Guardar →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════ PASO 3 ════ */}
        {step >= 3 && graphJson && (
          <div className="graph-section">
            <StepHeader
              num="03"
              title="JSON Generado"
              done={false}
              active={true}
            />
            <div className="graph-section-body">
              {saved && (
                <div className="graph-saved-bar">
                  ✓ Guardado en GitHub — Vercel redesplegará en ~30 segundos
                </div>
              )}

              {saveError && (
                <div className="graph-error-bar">✕ Error: {saveError}</div>
              )}

              <div className="graph-json-panel">
                <div className="graph-json-header">
                  <span className="graph-json-title">// data/graph.json</span>
                  <div className="graph-json-actions">
                    <button className="graph-json-btn" onClick={handleGenerate}>
                      // Re-generar
                    </button>
                    <button
                      className={`graph-json-btn${copied ? " copied" : ""}`}
                      onClick={handleCopy}
                    >
                      {copied ? "✓ Copiado" : "// Copiar"}
                    </button>
                  </div>
                </div>
                <pre className="graph-json-pre">{graphJson}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
