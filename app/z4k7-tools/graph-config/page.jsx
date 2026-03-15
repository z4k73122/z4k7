"use client";
import { useState } from "react";
import "../../graph.css";

const DEFAULT_COLORS = {
  platform:  "#00ff88",
  category:  "#00d4ff",
  writeup:   "#7F77DD",
  os:        "#ffcc00",
  difficulty:"#b06aff",
  technique: "#ff3366",
  tool:      "#00ffcc",
  tag:       "#EF9F27",
};

const DIFFICULTY_COLORS = {
  easy:   "#00ff88",
  medium: "#ffcc00",
  hard:   "#ff8c00",
  insane: "#ff3366",
};

const TYPE_LABELS = {
  platform:  "Plataforma",
  category:  "Carpeta",
  writeup:   "Writeup",
  os:        "Sistema OS",
  difficulty:"Dificultad",
  technique: "Técnica",
  tool:      "Herramienta",
  tag:       "Tag",
};

const TYPE_ORDER   = ["platform","category","writeup","os","difficulty","technique","tool","tag"];
const EXPANDABLE   = ["platform","category","os","difficulty","technique","tool","tag"];
const GITHUB_USER  = "z4k73122";
const GITHUB_REPO  = "z4k7";

function StepHeader({ num, title, done, active }) {
  const state = done ? "done" : active ? "active" : "idle";
  return (
    <div className="graph-step-header">
      <span className={`graph-step-num ${state}`}>{done ? `${num} ✓` : num}</span>
      <h2 className={`graph-step-title ${state}`}>{title}</h2>
      <div className={`graph-step-line ${state}`} />
    </div>
  );
}

export default function GraphConfigPage() {
  const [token,        setToken]        = useState("");
  const [tokenOk,      setTokenOk]      = useState(false);
  const [tokenError,   setTokenError]   = useState("");
  const [validating,   setValidating]   = useState(false);
  const [colors,       setColors]       = useState(DEFAULT_COLORS);
  const [subColors,    setSubColors]    = useState({});
  const [expanded,     setExpanded]     = useState({});
  const [preview,      setPreview]      = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [saveError,    setSaveError]    = useState("");
  const [step,         setStep]         = useState(1);

  // ── Validar token ─────────────────────────────────────────────────────────
  const handleValidateToken = async () => {
    setValidating(true);
    setTokenError("");
    try {
      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}`,
        { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }
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

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getNodesByType = (type) => preview?.nodes?.filter((n) => n.type === type) || [];
  const countByType    = (type) => getNodesByType(type).length;
  const writeups       = preview?.nodes?.filter((n) => n.type === "writeup") || [];

  const toggleExpand   = (type) => setExpanded((p) => ({ ...p, [type]: !p[type] }));
  const setSubColor    = (id, color) => setSubColors((p) => ({ ...p, [id]: color }));
  const resetSubColor  = (id) => setSubColors((p) => { const n = { ...p }; delete n[id]; return n; });

  // ── Scan — lee estructura + colores guardados ─────────────────────────────
  const handleScan = async () => {
    setLoading(true);
    setPreview(null);
    setSaved(false);
    setSaveError("");
    try {
      const res  = await fetch("/api/graph");
      const data = await res.json();
      setPreview(data);
      // Cargar colores guardados si existen
      if (data.colors && Object.keys(data.colors).length > 0) {
        setColors((prev) => ({ ...prev, ...data.colors }));
      }
      if (data.subColors && Object.keys(data.subColors).length > 0) {
        setSubColors(data.subColors);
      }
      setStep(2);
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Guardar solo colores ──────────────────────────────────────────────────
  const handleSave = async () => {
    setSaveError("");
    try {
      const res = await fetch("/api/graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, colors, subColors }),
      });
      const result = await res.json();
      if (result.ok) {
        setSaved(true);
        setStep(3);
        setTimeout(() => setSaved(false), 4000);
      } else {
        setSaveError(result.error || "Error al guardar");
      }
    } catch (e) {
      setSaveError(e.message);
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = async () => {
    setStep(1);
    setPreview(null);
    setColors(DEFAULT_COLORS);
    setSubColors({});
    setExpanded({});
    setSaved(false);
    setSaveError("");
    await fetch("/api/graph", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).catch(() => {});
  };

  // ── Pantalla token ────────────────────────────────────────────────────────
  if (!tokenOk) {
    return (
      <div className="graph-token-screen">
        <div className="graph-grid-bg" />
        <div className="graph-token-box">
          <div className="graph-token-tag">&lt;<span style={{ color: "#00d4ff" }}>Z4k7</span>_tools/&gt;</div>
          <h1 className="graph-token-title">graph-config</h1>
          <div className="graph-token-divider" />
          <div className="graph-token-label">// GITHUB TOKEN</div>
          <p className="graph-token-desc">
            Necesario para guardar <span style={{ color: "#00d4ff" }}>data/graph-colors.json</span> en el repo.
            <br /><span style={{ color: "#00ff88" }}>repo ✓</span>
          </p>
          <input
            type="password"
            placeholder="ghp_..."
            value={token}
            onChange={(e) => { setToken(e.target.value); setTokenError(""); }}
            onKeyDown={(e) => e.key === "Enter" && token && handleValidateToken()}
            className={`graph-token-input${tokenError ? " has-error" : token ? " has-value" : ""}`}
          />
          {tokenError && <div className="graph-token-error"><span>✕</span> {tokenError}</div>}
          <button
            onClick={handleValidateToken}
            disabled={!token || validating}
            className={`graph-token-btn${token && !validating ? " active" : ""}`}
          >
            {validating ? "// Validando..." : "// Validar token →"}
          </button>
          <div className="graph-token-hint">El token no se guarda — solo se usa en esta sesión</div>
        </div>
      </div>
    );
  }

  // ── Panel principal ───────────────────────────────────────────────────────
  return (
    <div className="graph-page">
      <div className="graph-grid-bg" />

      <div className="graph-topbar">
        <div className="graph-topbar-left">
          <span style={{ color: "#4a6a7a" }}>z4k7-tools</span>
          <span style={{ color: "#1a3a4a" }}>/</span>
          <span style={{ color: "#00ff88", letterSpacing: "2px" }}>graph-config</span>
          <span style={{ color: "#1a3a4a" }}>|</span>
          <span style={{ color: "#00ff88", fontSize: "0.62rem" }}>✓ token ok</span>
        </div>
        <div className="graph-topbar-steps">
          {[["01","ESCANEAR"],["02","COLOREAR"],["03","GUARDADO"]].map(([n, label], i) => (
            <span key={n} className={`graph-topbar-step ${step > i+1 ? "done" : step === i+1 ? "active" : "idle"}`}>
              {n} · {label} {step > i+1 ? "✓" : ""}
            </span>
          ))}
        </div>
        <div className="graph-topbar-actions">
          <button className="graph-topbar-btn" onClick={() => { setTokenOk(false); setToken(""); }}>
            // cambiar token
          </button>
          <button className="graph-topbar-reset" onClick={handleReset}>// reset</button>
        </div>
      </div>

      <div className="graph-inner">

        {/* ═══ PASO 1 — Escanear ═══ */}
        <div className="graph-section">
          <StepHeader num="01" title="Escanear Write-ups" done={step > 1} active={step === 1} />
          {step === 1 && (
            <div className="graph-section-body">
              <p className="graph-section-desc">
                Lee todos los <span style={{ color: "#00d4ff" }}>.md</span> de{" "}
                <span style={{ color: "#00ff88" }}>content/</span> y extrae nodos + conexiones.
                Si hay colores guardados los carga automáticamente.
              </p>
              <button onClick={handleScan} disabled={loading} className="graph-scan-btn">
                {loading ? "// Escaneando..." : "// Escanear write-ups"}
              </button>
            </div>
          )}

          {step > 1 && preview && (
            <div className="graph-section-body">
              <div className="graph-stats-grid">
                {TYPE_ORDER.map((type) => (
                  <div key={type} className="graph-stat-card" style={{ borderColor: DEFAULT_COLORS[type] + "44" }}>
                    <div className="graph-stat-label">{TYPE_LABELS[type].toUpperCase()}</div>
                    <div className="graph-stat-value" style={{ color: DEFAULT_COLORS[type] }}>{countByType(type)}</div>
                    <div className="graph-stat-sub">nodos</div>
                  </div>
                ))}
                <div className="graph-stat-card">
                  <div className="graph-stat-label">CONEXIONES</div>
                  <div className="graph-stat-value" style={{ color: "#c8d8e8" }}>{preview.links?.length || 0}</div>
                  <div className="graph-stat-sub">links</div>
                </div>
              </div>

              {/* Writeups detectados */}
              {writeups.length > 0 && (
                <div className="graph-machines-card">
                  <div className="graph-machines-label">// WRITEUPS DETECTADOS</div>
                  <div className="graph-machines-list">
                    {writeups.map((w) => (
                      <div key={w.id} className="graph-machine-chip">
                        <div className="graph-machine-dot" style={{ background: resolveNodeColor(w, colors, subColors) }} />
                        <span className="graph-machine-name">{w.title || w.id}</span>
                        <span className="graph-machine-meta">{w.folderPath} · {w.difficulty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══ PASO 2 — Colorear ═══ */}
        {step >= 2 && (
          <div className="graph-section">
            <StepHeader num="02" title="Asignar Colores" done={step > 2} active={step === 2} />
            <div className="graph-section-body">
              <div className="graph-color-list">
                {TYPE_ORDER.map((type) => {
                  const isExpandable = EXPANDABLE.includes(type);
                  const isOpen       = expanded[type];
                  const subNodes     = getNodesByType(type);

                  return (
                    <div key={type}>
                      <div
                        className={`graph-color-row${!isExpandable ? " not-expandable" : ""}`}
                        onClick={() => isExpandable && toggleExpand(type)}
                      >
                        <div className="graph-color-row-left">
                          <div className="graph-color-dot" style={{ background: colors[type], boxShadow: `0 0 8px ${colors[type]}` }} />
                          <div>
                            <div className="graph-color-type-name">{TYPE_LABELS[type]}</div>
                            <div className="graph-color-type-count">{countByType(type)} nodos</div>
                          </div>
                        </div>
                        <div className="graph-color-row-right">
                          <span className="graph-color-hex">{colors[type]}</span>
                          <input
                            type="color"
                            value={colors[type]}
                            className="graph-color-picker"
                            onChange={(e) => { e.stopPropagation(); setColors((p) => ({ ...p, [type]: e.target.value })); }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          {isExpandable && (
                            <span className={`graph-expand-arrow${isOpen ? " open" : ""}`}>▶</span>
                          )}
                        </div>
                      </div>

                      {isExpandable && isOpen && subNodes.length > 0 && (
                        <div className="graph-subcolor-panel">
                          <div className="graph-subcolor-label">// COLOR INDIVIDUAL POR NODO</div>
                          <div className="graph-subcolor-list">
                            {subNodes.map((n) => {
                              const subColor   = subColors[n.id];
                              const baseColor  = type === "difficulty"
                                ? (DIFFICULTY_COLORS[n.id?.toLowerCase()] || colors[type])
                                : colors[type];
                              const activeColor = subColor || n.color || baseColor;

                              return (
                                <div key={n.id} className="graph-subcolor-item" style={{ borderColor: subColor ? activeColor + "66" : "#1a3a4a" }}>
                                  <div className="graph-subcolor-item-left">
                                    <div className="graph-subcolor-dot" style={{ background: activeColor, boxShadow: `0 0 5px ${activeColor}` }} />
                                    <span className={`graph-subcolor-name${subColor ? " custom" : ""}`}>
                                      {n.type === "category" ? n.id.split("/").pop() : n.id}
                                    </span>
                                    {subColor && <span className="graph-subcolor-badge">custom</span>}
                                  </div>
                                  <div className="graph-subcolor-item-right">
                                    <span className="graph-subcolor-hex">{activeColor}</span>
                                    {subColor && (
                                      <button className="graph-subcolor-reset" onClick={() => resetSubColor(n.id)}>
                                        reset
                                      </button>
                                    )}
                                    <input
                                      type="color"
                                      value={activeColor}
                                      className="graph-subcolor-picker"
                                      onChange={(e) => setSubColor(n.id, e.target.value)}
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
                <button className="graph-reset-colors-btn" onClick={() => { setColors(DEFAULT_COLORS); setSubColors({}); }}>
                  // reset colores
                </button>
                <button className="graph-generate-btn" onClick={handleSave}>
                  // Guardar colores →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ PASO 3 — Guardado ═══ */}
        {step >= 3 && (
          <div className="graph-section">
            <StepHeader num="03" title="Colores Guardados" done={false} active={true} />
            <div className="graph-section-body">
              {saved && (
                <div className="graph-saved-bar">
                  ✓ Guardado en GitHub — el grafo tomará los nuevos colores en ~30 segundos
                </div>
              )}
              {saveError && <div className="graph-error-bar">✕ Error: {saveError}</div>}

              {/* Preview de colores aplicados */}
              <div style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#4a6a7a", marginBottom: "0.8rem" }}>
                // COLORES ACTIVOS
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "1.5rem" }}>
                {TYPE_ORDER.map((type) => (
                  <div key={type} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#0a1520", border: "1px solid #1a3a4a", padding: "4px 10px" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[type], boxShadow: `0 0 5px ${colors[type]}` }} />
                    <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#c8d8e8" }}>{TYPE_LABELS[type]}</span>
                  </div>
                ))}
              </div>

              <button className="graph-generate-btn" onClick={handleSave}>
                // Re-guardar colores
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Helper para color del nodo en el listado ──────────────────────────────────
function resolveNodeColor(node, colors, subColors) {
  if (subColors[node.id]) return subColors[node.id];
  if (node.color) return node.color;
  return colors[node.type] || "#4a6a7a";
}
