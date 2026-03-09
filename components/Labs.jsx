"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const PER_PAGE = 8;

const DIFFICULTY_COLORS = {
  Easy: "#00ff88",
  Medium: "#ffcc00",
  Hard: "#ff8c00",
  Insane: "#ff3366",
};

const STATUS_COLORS = {
  pwned: "#00ff88",
  rooted: "#00ff88",
  unknown: "#4a6a7a",
};

function LabCard({ lab }) {
  const diffColor = DIFFICULTY_COLORS[lab.difficulty] || "#4a6a7a";
  const statusColor = STATUS_COLORS[lab.status] || "#4a6a7a";

  return (
    <div className={`lab-card ${lab.soon ? "lab-soon" : ""}`}>
      <div className="lab-header">
        <span className={`lab-platform ${lab.platformClass}`}>
          {lab.platform}
        </span>
        <span className="lab-difficulty" style={{ color: diffColor }}>
          {lab.difficulty}
        </span>
      </div>

      <div className="lab-title">{lab.title}</div>

      {/* OS + Status */}
      <div
        style={{
          display: "flex",
          gap: "0.8rem",
          marginBottom: "0.5rem",
          alignItems: "center",
        }}
      >
        {lab.os && lab.os !== "?" && (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.65rem",
              color: "#4a6a7a",
            }}
          >
            {lab.os}
          </span>
        )}
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "0.62rem",
            color: statusColor,
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: statusColor,
              display: "inline-block",
            }}
          />
          {lab.status}
        </span>
      </div>

      <div className="lab-desc">{lab.desc}</div>

      <div
        className="lab-tags"
        style={{ marginBottom: lab.slug ? "1rem" : "0" }}
      >
        {(lab.tags || []).map((tag, i) => (
          <span key={i} className="lab-tag">
            {tag}
          </span>
        ))}
      </div>

      {!lab.soon && lab.slug && (
        <Link
          href={`/writeups/${lab.slug}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "0.8rem",
            fontFamily: "monospace",
            fontSize: "0.72rem",
            letterSpacing: "1px",
            padding: "6px 14px",
            textDecoration: "none",
            color: "#00ff88",
            border: "1px solid #00ff88",
            background: "transparent",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#00ff88";
            e.currentTarget.style.color = "#050a0e";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#00ff88";
          }}
        >
          {">"} Ver Write-up
        </Link>
      )}
    </div>
  );
}

export default function Labs() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState({
    platform: "all",
    difficulty: "all",
    os: "all",
  });

  useEffect(() => {
    fetch("/api/writeups")
      .then((r) => r.json())
      .then((data) => {
        setLabs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filtros dinámicos
  const platforms = [
    "all",
    ...new Set(labs.map((l) => l.platform).filter(Boolean)),
  ];
  const difficulties = [
    "all",
    ...new Set(labs.map((l) => l.difficulty).filter(Boolean)),
  ];
  const oses = [
    "all",
    ...new Set(labs.map((l) => l.os).filter((o) => o && o !== "?")),
  ];

  const filtered = labs.filter((l) => {
    if (filter.platform !== "all" && l.platform !== filter.platform)
      return false;
    if (filter.difficulty !== "all" && l.difficulty !== filter.difficulty)
      return false;
    if (filter.os !== "all" && l.os !== filter.os) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const visible = filtered.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  const setF = (key, val) => {
    setFilter((f) => ({ ...f, [key]: val }));
    setPage(0);
  };

  const btnStyle = (active) => ({
    fontFamily: "monospace",
    fontSize: "0.65rem",
    padding: "4px 12px",
    background: active ? "#00d4ff" : "transparent",
    border: `1px solid ${active ? "#00d4ff" : "#1a3a4a"}`,
    color: active ? "#050a0e" : "#4a6a7a",
    cursor: "pointer",
    letterSpacing: "1px",
    fontWeight: active ? 700 : 400,
    transition: "all 0.2s",
  });

  return (
    <section
      id="labs"
      style={{
        position: "relative",
        zIndex: 1,
        padding: "5rem 4rem",
        background: "#0a1520",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            color: "#00ff88",
            fontSize: "0.85rem",
          }}
        >
          02.
        </span>
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          Laboratorios & Write-ups
        </h2>
        <div
          style={{
            flex: 1,
            height: "1px",
            background: "linear-gradient(to right,#1a3a4a,transparent)",
            marginLeft: "1rem",
          }}
        />
        {!loading && (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.65rem",
              color: "#4a6a7a",
            }}
          >
            {filtered.length} labs
          </span>
        )}
      </div>

      {/* Filtros */}
      {!loading && labs.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          {/* Plataforma */}
          <div
            style={{
              display: "flex",
              gap: "0.4rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "0.6rem",
                color: "#4a6a7a",
                letterSpacing: "2px",
                marginRight: "0.3rem",
              }}
            >
              PLATAFORMA
            </span>
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => setF("platform", p)}
                style={btnStyle(filter.platform === p)}
              >
                {p === "all" ? "Todas" : p}
              </button>
            ))}
          </div>

          {/* Dificultad */}
          <div
            style={{
              display: "flex",
              gap: "0.4rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "0.6rem",
                color: "#4a6a7a",
                letterSpacing: "2px",
                marginRight: "0.3rem",
              }}
            >
              DIFICULTAD
            </span>
            {difficulties.map((d) => (
              <button
                key={d}
                onClick={() => setF("difficulty", d)}
                style={{
                  ...btnStyle(filter.difficulty === d),
                  color:
                    filter.difficulty === d
                      ? "#050a0e"
                      : DIFFICULTY_COLORS[d] || "#4a6a7a",
                  borderColor:
                    filter.difficulty === d
                      ? "#00d4ff"
                      : DIFFICULTY_COLORS[d]
                        ? DIFFICULTY_COLORS[d] + "44"
                        : "#1a3a4a",
                }}
              >
                {d === "all" ? "Todas" : d}
              </button>
            ))}
          </div>

          {/* OS */}
          {oses.length > 2 && (
            <div
              style={{
                display: "flex",
                gap: "0.4rem",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.6rem",
                  color: "#4a6a7a",
                  letterSpacing: "2px",
                  marginRight: "0.3rem",
                }}
              >
                OS
              </span>
              {oses.map((o) => (
                <button
                  key={o}
                  onClick={() => setF("os", o)}
                  style={btnStyle(filter.os === o)}
                >
                  {o === "all" ? "Todos" : o}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div
          style={{
            background: "#050a0e",
            border: "1px solid #1a3a4a",
            padding: "4rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "monospace",
              color: "#00d4ff",
              fontSize: "0.85rem",
              letterSpacing: "2px",
            }}
          >
            // Cargando labs...
          </p>
        </div>
      )}

      {/* Sin labs */}
      {!loading && labs.length === 0 && (
        <div
          style={{
            background: "#050a0e",
            border: "1px solid #1a3a4a",
            padding: "4rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "monospace",
              color: "#4a6a7a",
              fontSize: "0.85rem",
              letterSpacing: "2px",
            }}
          >
            // No hay write-ups aún
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && visible.length > 0 && (
        <div className="labs-grid">
          {visible.map((lab, i) => (
            <LabCard key={i} lab={lab} />
          ))}
        </div>
      )}

      {/* Sin resultados con filtro */}
      {!loading && labs.length > 0 && filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            fontFamily: "monospace",
            color: "#4a6a7a",
          }}
        >
          // Sin resultados para este filtro
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
            marginTop: "2rem",
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              fontFamily: "monospace",
              fontSize: "0.8rem",
              letterSpacing: "2px",
              padding: "6px 20px",
              background: "transparent",
              border: `1px solid ${page === 0 ? "#1a3a4a" : "#00d4ff"}`,
              color: page === 0 ? "#1a3a4a" : "#00d4ff",
              cursor: page === 0 ? "default" : "pointer",
            }}
          >
            ← PREV
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              style={{
                fontFamily: "monospace",
                fontSize: "0.8rem",
                width: "36px",
                height: "30px",
                background: page === i ? "#00d4ff" : "transparent",
                border: `1px solid ${page === i ? "#00d4ff" : "#1a3a4a"}`,
                color: page === i ? "#050a0e" : "#4a6a7a",
                cursor: "pointer",
                fontWeight: page === i ? 700 : 400,
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            style={{
              fontFamily: "monospace",
              fontSize: "0.8rem",
              letterSpacing: "2px",
              padding: "6px 20px",
              background: "transparent",
              border: `1px solid ${page === totalPages - 1 ? "#1a3a4a" : "#00d4ff"}`,
              color: page === totalPages - 1 ? "#1a3a4a" : "#00d4ff",
              cursor: page === totalPages - 1 ? "default" : "pointer",
            }}
          >
            NEXT →
          </button>
        </div>
      )}

      {/* Contador */}
      {!loading && filtered.length > 0 && (
        <div
          style={{
            textAlign: "center",
            marginTop: "1rem",
            fontFamily: "monospace",
            fontSize: "0.72rem",
            color: "#4a6a7a",
          }}
        >
          mostrando {page * PER_PAGE + 1}–
          {Math.min((page + 1) * PER_PAGE, filtered.length)} de{" "}
          {filtered.length} labs
        </div>
      )}
    </section>
  );
}
