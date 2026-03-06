"use client";
import { useState } from "react";
import Link from "next/link";
import labs from "@/data/Labs.json";

const PER_PAGE = 8;

function LabCard({ lab }) {
  return (
    <div className={`lab-card ${lab.soon ? "lab-soon" : ""}`}>
      <div className="lab-header">
        <span className={`lab-platform ${lab.platformClass}`}>
          {lab.platform}
        </span>
        <span className="lab-difficulty">{lab.difficulty}</span>
      </div>
      <div className="lab-title">{lab.title}</div>
      <div className="lab-desc">{lab.desc}</div>
      <div
        className="lab-tags"
        style={{ marginBottom: lab.slug ? "1rem" : "0" }}
      >
        {lab.tags.map((tag, i) => (
          <span key={i} className="lab-tag">
            {tag}
          </span>
        ))}
      </div>

      {/* Botón write-up */}
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
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(labs.length / PER_PAGE);
  const visible = labs.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "3rem",
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
            background: "linear-gradient(to right, #1a3a4a, transparent)",
            marginLeft: "1rem",
          }}
        />
      </div>

      <div className="labs-grid">
        {visible.map((lab, i) => (
          <LabCard key={i} lab={lab} />
        ))}
      </div>

      {/* PAGINACIÓN */}
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

      {/* CONTADOR */}
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
        {Math.min((page + 1) * PER_PAGE, labs.length)} de {labs.length} labs
      </div>
    </section>
  );
}
