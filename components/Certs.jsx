"use client";
import { useState } from "react";
import certs from "@/data/Certi.json";

const PER_PAGE = 6;

function CertCard({ lab }) {
  const [hovered, setHovered] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  const visibleTags = showAllTags ? lab.tags : lab.tags.slice(0, 6);

  return (
    <div className={`cert-card ${lab.soon ? "lab-soon" : ""}`}>
      <div className="lab-header">
        <span className={`lab-platform ${lab.platformClass}`}>
          {lab.platform}
        </span>
        {lab.platform === "Próximamente" ? (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.72rem",
              letterSpacing: "1px",
              padding: "3px 10px",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              border: `1px solid ${hovered ? "#00d4ff" : "#1a3a4a"}`,
              color: hovered ? "#00d4ff" : "#4a6a7a",
              background: hovered ? "rgba(0,212,255,0.08)" : "transparent",
              transition: "all 0.2s",
              cursor: lab.credlyUrl ? "pointer" : "default",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-clock-history"
              viewBox="0 0 16 16"
            >
              <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022zm2.004.45a7 7 0 0 0-.985-.299l.219-.976q.576.129 1.126.342zm1.37.71a7 7 0 0 0-.439-.27l.493-.87a8 8 0 0 1 .979.654l-.615.789a7 7 0 0 0-.418-.302zm1.834 1.79a7 7 0 0 0-.653-.796l.724-.69q.406.429.747.91zm.744 1.352a7 7 0 0 0-.214-.468l.893-.45a8 8 0 0 1 .45 1.088l-.95.313a7 7 0 0 0-.179-.483m.53 2.507a7 7 0 0 0-.1-1.025l.985-.17q.1.58.116 1.17zm-.131 1.538q.05-.254.081-.51l.993.123a8 8 0 0 1-.23 1.155l-.964-.267q.069-.247.12-.501m-.952 2.379q.276-.436.486-.908l.914.405q-.24.54-.555 1.038zm-.964 1.205q.183-.183.35-.378l.758.653a8 8 0 0 1-.401.432z" />
              <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0z" />
              <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5" />
            </svg>
          </span>
        ) : (
          <a
            href={lab.credlyUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              fontFamily: "monospace",
              fontSize: "0.72rem",
              letterSpacing: "1px",
              padding: "3px 10px",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              border: `1px solid ${hovered ? "#00d4ff" : "#1a3a4a"}`,
              color: hovered ? "#00d4ff" : "#4a6a7a",
              background: hovered ? "rgba(0,212,255,0.08)" : "transparent",
              transition: "all 0.2s",
              cursor: lab.credlyUrl ? "pointer" : "default",
            }}
          >
            {hovered && lab.credlyUrl && (
              <svg
                style={{
                  width: "16px",
                  height: "16px",
                  color: "#00d4ff",
                  flexShrink: 0,
                }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {lab.Certificacion}
          </a>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "1.2rem",
          alignItems: "flex-start",
          marginTop: "0.5rem",
        }}
      >
        {lab.img &&
          (lab.platform === "coursera-c" ? (
            <div
              style={{
                width: "80px",
                height: "80px",
                flexShrink: 0,
                marginTop: "4px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid #1a3a4a",
                background: "#0a1520",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={lab.img}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ) : (
            <img
              src={lab.img}
              alt=""
              style={{
                width: "80px",
                height: "80px",
                objectFit: "contain",
                flexShrink: 0,
                marginTop: "4px",
                mixBlendMode: "screen",
              }}
            />
          ))}

        <div style={{ flex: 1 }}>
          <div className="lab-title">{lab.title}</div>

          {/* Descripción con ver más */}
          <div>
            <div
              className="lab-desc"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: showFullDesc ? 100 : 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {lab.desc}
            </div>
            {lab.desc.length > 200 && (
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.68rem",
                  color: showFullDesc ? "#4a6a7a" : "#00d4ff",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px 0",
                  marginTop: "2px",
                  letterSpacing: "1px",
                }}
              >
                {showFullDesc ? "- ver menos" : "+ ver más"}
              </button>
            )}
          </div>

          {/* Tags con ver más */}
          <div className="lab-tags" style={{ marginTop: "0.5rem" }}>
            {visibleTags.map((tag, i) => (
              <span key={i} className="lab-tag">
                {tag}
              </span>
            ))}
            {!showAllTags && lab.tags.length > 6 && (
              <button
                onClick={() => setShowAllTags(true)}
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.65rem",
                  color: "#00d4ff",
                  background: "rgba(0,212,255,0.07)",
                  border: "1px solid rgba(0,212,255,0.2)",
                  padding: "2px 8px",
                  cursor: "pointer",
                  letterSpacing: "1px",
                }}
              >
                +{lab.tags.length - 6} más
              </button>
            )}
            {showAllTags && lab.tags.length > 6 && (
              <button
                onClick={() => setShowAllTags(false)}
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.65rem",
                  color: "#4a6a7a",
                  background: "rgba(74,106,122,0.07)",
                  border: "1px solid #1a3a4a",
                  padding: "2px 8px",
                  cursor: "pointer",
                  letterSpacing: "1px",
                }}
              >
                ver menos
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Certs() {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(certs.length / PER_PAGE);
  const visible = certs.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <section
      id="certs"
      style={{ position: "relative", zIndex: 1, padding: "5rem 4rem" }}
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
          04.
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
          Certificaciones
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

      <div className="certs-grid">
        {visible.map((cert, i) => (
          <CertCard key={i} lab={cert} />
        ))}
      </div>

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
        {Math.min((page + 1) * PER_PAGE, certs.length)} de {certs.length} certs
      </div>
    </section>
  );
}
