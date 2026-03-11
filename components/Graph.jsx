"use client";
import { useEffect, useRef, useState, useCallback } from "react";

const legendLabels = {
  machine: "Máquina",
  technique: "Técnica",
  tool: "Herramienta",
  os: "OS",
  difficulty: "Dificultad",
  platform: "Plataforma",
  tag: "Tag",
};
const TYPE_SIZE = {
  machine: 19,
  platform: 20,
  os: 16,
  difficulty: 13,
  technique: 15,
  tool: 13,
  tag: 11,
};
const DEFAULT_COLORS = {
  machine: "#00d4ff",
  platform: "#ff8c00",
  os: "#ffcc00",
  difficulty: "#b06aff",
  technique: "#ff3366",
  tool: "#00ffcc",
  tag: "#00ff88",
};
const ANIM_ORDER = [
  "os",
  "machine",
  "difficulty",
  "technique",
  "tag",
  "tool",
  "platform",
];

export default function Graph() {
  const svgRef = useRef(null);
  const nodeRef = useRef(null);
  const linkRef = useRef(null);
  const simRef = useRef(null);
  const gRef = useRef(null);
  const allNodes = useRef([]);
  const allLinks = useRef([]);

  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    node: null,
  });
  const [activeFilters, setActive] = useState({ type: "all", value: null });
  const [openSection, setOpen] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [animStep, setAnimStep] = useState(null);
  const [showLinks, setShowLinks] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    fetch("/api/graph")
      .then((r) => r.json())
      .then((data) => {
        if (data?.nodes?.length) setGraphData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const gColors = graphData?.colors || DEFAULT_COLORS;
  const subColors = graphData?.subColors || {};
  const nodeColor = (n) => {
    if (!n) return "#4a6a7a";
    if (n.color) return n.color;
    if (subColors[n.label]) return subColors[n.label];
    return gColors[n.type] || "#4a6a7a";
  };

  const filterGroups = graphData
    ? [
        {
          id: "platform",
          label: "Plataforma",
          values: [
            ...new Set(
              graphData.nodes
                .filter((n) => n.type === "platform")
                .map((n) => n.label),
            ),
          ],
        },
        {
          id: "os",
          label: "Sistema OS",
          values: [
            ...new Set(
              graphData.nodes
                .filter((n) => n.type === "os")
                .map((n) => n.label),
            ),
          ],
        },
        {
          id: "difficulty",
          label: "Dificultad",
          values: [
            ...new Set(
              graphData.nodes
                .filter((n) => n.type === "difficulty")
                .map((n) => n.label),
            ),
          ],
        },
        {
          id: "technique",
          label: "Técnica",
          values: [
            ...new Set(
              graphData.nodes
                .filter((n) => n.type === "technique")
                .map((n) => n.label),
            ),
          ],
        },
        {
          id: "tool",
          label: "Herramienta",
          values: [
            ...new Set(
              graphData.nodes
                .filter((n) => n.type === "tool")
                .map((n) => n.label),
            ),
          ],
        },
        {
          id: "tag",
          label: "Tag",
          values: [
            ...new Set(
              graphData.nodes
                .filter((n) => n.type === "tag")
                .map((n) => n.label),
            ),
          ],
        },
      ]
    : [];

  function nodeMatchesFilter(node, filters) {
    if (filters.type === "all") return true;
    if (filters.type === "platform")
      return node.platform === filters.value || node.label === filters.value;
    if (filters.type === "os")
      return node.os === filters.value || node.label === filters.value;
    if (filters.type === "difficulty")
      return node.difficulty === filters.value || node.label === filters.value;
    if (filters.type === "technique")
      return (
        (node.type === "technique" && node.label === filters.value) ||
        node.type === "machine"
      );
    if (filters.type === "tool")
      return (
        (node.type === "tool" && node.label === filters.value) ||
        node.type === "machine"
      );
    if (filters.type === "tag")
      return (
        (node.type === "tag" && node.label === filters.value) ||
        node.type === "machine"
      );
    return false;
  }

  useEffect(() => {
    if (!graphData) return;
    async function init() {
      const d3 = await import("d3");
      const container = svgRef.current?.parentElement;
      if (!container) return;
      const W = container.clientWidth;
      const H = Math.max(400, Math.min(1000, graphData.nodes.length * 2.5));
      const svg = d3.select(svgRef.current).attr("width", W).attr("height", H);
      svg.selectAll("*").remove();
      const g = svg.append("g");
      gRef.current = g;
      svg.call(
        d3
          .zoom()
          .scaleExtent([0.05, 4])
          .on("zoom", (e) => g.attr("transform", e.transform)),
      );

      const nodeIds = new Set(graphData.nodes.map((n) => n.id));
      const nodes = graphData.nodes.map((n) => ({
        ...n,
        size: n.size || TYPE_SIZE[n.type] || 12,
      }));
      const links = graphData.links
        .filter((l) => l.source !== l.target)
        .filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target))
        .map((l) => ({ ...l }));
      allNodes.current = nodes;
      allLinks.current = links;

      const sim = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3
            .forceLink(links)
            .id((d) => d.id)
            .distance((l) => {
              const t = typeof l.target === "object" ? l.target.type : "";
              if (t === "platform" || t === "os") return 140;
              if (t === "difficulty") return 110;
              if (t === "technique" || t === "tool") return 85;
              if (l.rel === "related") return 55;
              return 70;
            }),
        )
        .force(
          "charge",
          d3.forceManyBody().strength((d) => -(d.size || 12) * 12),
        )
        .force("center", d3.forceCenter(W / 2, H / 2))
        .force(
          "collision",
          d3.forceCollide().radius((d) => (d.size || 12) + 8),
        );
      simRef.current = sim;

      const link = g
        .append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke", (d) => {
          if (d.rel === "related") return "#ffffff";
          const src =
            typeof d.source === "object"
              ? d.source
              : nodes.find((n) => n.id === d.source);
          return nodeColor(src);
        })
        .attr("stroke-opacity", (d) => (d.rel === "related" ? 0.12 : 0.3))
        .attr("stroke-width", (d) => (d.rel === "related" ? 0.6 : 1))
        .attr("stroke-dasharray", (d) =>
          d.rel === "related" ? "3,3" : "none",
        );

      const node = g
        .append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .call(
          d3
            .drag()
            .on("start", (e, d) => {
              if (!e.active) sim.alphaTarget(0.3).restart();
              d.fx = d.x;
              d.fy = d.y;
            })
            .on("drag", (e, d) => {
              d.fx = e.x;
              d.fy = e.y;
            })
            .on("end", (e, d) => {
              if (!e.active) sim.alphaTarget(0);
              if (!d.pinned) {
                d.fx = null;
                d.fy = null;
              }
            }),
        );

      node
        .append("circle")
        .attr("r", (d) => d.size)
        .attr("fill", (d) => nodeColor(d) + "20")
        .attr("stroke", (d) => nodeColor(d))
        .attr("stroke-width", (d) => (d.type === "machine" ? 2 : 1.2))
        .style("cursor", "pointer")
        .on("mouseover", (e, d) =>
          setTooltip({ visible: true, x: e.clientX, y: e.clientY, node: d }),
        )
        .on("mousemove", (e) =>
          setTooltip((t) => ({ ...t, x: e.clientX, y: e.clientY })),
        )
        .on("mouseout", () => setTooltip((t) => ({ ...t, visible: false })))
        .on("click", (e, d) => {
          e.stopPropagation();
          const conn = new Set([d.id]);
          links.forEach((l) => {
            if (l.source.id === d.id) conn.add(l.target.id);
            if (l.target.id === d.id) conn.add(l.source.id);
          });
          node
            .selectAll("circle")
            .attr("opacity", (n) => (conn.has(n.id) ? 1 : 0.06));
          node
            .selectAll("text")
            .attr("opacity", (n) => (conn.has(n.id) ? 1 : 0.03));
          link
            .attr("stroke-opacity", (l) =>
              l.source.id === d.id || l.target.id === d.id ? 0.9 : 0.02,
            )
            .attr("stroke-width", (l) =>
              l.source.id === d.id || l.target.id === d.id ? 2 : 0.6,
            );
        })
        .on("dblclick", (e, d) => {
          e.stopPropagation();
          d.pinned = !d.pinned;
          d.fx = d.pinned ? d.x : null;
          d.fy = d.pinned ? d.y : null;
        });

      node
        .append("text")
        .text((d) => d.label)
        .attr("dy", (d) => d.size + 12)
        .attr("text-anchor", "middle")
        .attr("fill", (d) => nodeColor(d))
        .attr("font-family", "monospace")
        .attr("font-size", (d) => (d.type === "machine" ? "11px" : "9px"))
        .attr("pointer-events", "none")
        .attr("opacity", 0.85);

      svg.on("click", () => {
        node.selectAll("circle").attr("opacity", 1);
        node.selectAll("text").attr("opacity", 0.85);
        link
          .attr("stroke-opacity", (d) => (d.rel === "related" ? 0.12 : 0.3))
          .attr("stroke-width", (d) => (d.rel === "related" ? 0.6 : 1));
      });

      sim.on("tick", () => {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);
        node.attr("transform", (d) => `translate(${d.x},${d.y})`);
      });

      nodeRef.current = node;
      linkRef.current = link;
    }
    init();
  }, [graphData]);

  useEffect(() => {
    const node = nodeRef.current;
    const link = linkRef.current;
    if (!node || !link) return;
    if (activeFilters.type === "all") {
      node.selectAll("circle").attr("opacity", 1);
      node.selectAll("text").attr("opacity", 0.85);
      link.attr("stroke-opacity", (d) => (d.rel === "related" ? 0.12 : 0.3));
      return;
    }
    node
      .selectAll("circle")
      .attr("opacity", (d) => (nodeMatchesFilter(d, activeFilters) ? 1 : 0.05));
    node
      .selectAll("text")
      .attr("opacity", (d) => (nodeMatchesFilter(d, activeFilters) ? 1 : 0.02));
    link.attr("stroke-opacity", (l) =>
      nodeMatchesFilter(l.source, activeFilters) ||
      nodeMatchesFilter(l.target, activeFilters)
        ? 0.7
        : 0.02,
    );
  }, [activeFilters]);

  useEffect(() => {
    const link = linkRef.current;
    if (!link) return;
    link.attr("stroke-opacity", (d) => {
      if (!showLinks) return 0;
      return d.rel === "related" ? 0.12 : 0.3;
    });
  }, [showLinks]);

  const runAnimation = useCallback(async () => {
    const node = nodeRef.current;
    const link = linkRef.current;
    if (!node || !link || !graphData) return;
    setAnimating(true);
    node.selectAll("circle").attr("opacity", 0);
    node.selectAll("text").attr("opacity", 0);
    link.attr("stroke-opacity", 0);
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    const nodes = allNodes.current;
    const links = allLinks.current;
    for (const groupType of ANIM_ORDER) {
      const groupNodes = nodes.filter((n) => n.type === groupType);
      if (!groupNodes.length) continue;
      setAnimStep(legendLabels[groupType] || groupType);
      for (const n of groupNodes) {
        node
          .filter((d) => d.id === n.id)
          .selectAll("circle")
          .attr("opacity", 0)
          .transition()
          .duration(300)
          .attr("opacity", 1);
        node
          .filter((d) => d.id === n.id)
          .selectAll("text")
          .attr("opacity", 0)
          .transition()
          .duration(300)
          .attr("opacity", 0.85);
        await delay(groupNodes.length > 30 ? 15 : 40);
      }
      const groupLinks = links.filter((l) => {
        const src =
          typeof l.source === "object"
            ? l.source
            : nodes.find((n) => n.id === l.source);
        const tgt =
          typeof l.target === "object"
            ? l.target
            : nodes.find((n) => n.id === l.target);
        return src?.type === groupType || tgt?.type === groupType;
      });
      for (const l of groupLinks) {
        link
          .filter((d) => d === l)
          .transition()
          .duration(200)
          .attr("stroke-opacity", l.rel === "related" ? 0.12 : 0.3);
        await delay(groupLinks.length > 100 ? 5 : 20);
      }
      await delay(300);
    }
    setAnimating(false);
    setAnimStep(null);
  }, [graphData]);

  const setFilter = (type, value) => {
    if (activeFilters.type === type && activeFilters.value === value)
      setActive({ type: "all", value: null });
    else setActive({ type, value });
  };

  const totalNodes = graphData?.nodes?.length || 0;
  const totalLinks =
    graphData?.links?.filter((l) => l.source !== l.target).length || 0;

  const FilterList = () => (
    <>
      <button
        onClick={() => setActive({ type: "all", value: null })}
        style={{
          width: "100%",
          fontFamily: "monospace",
          fontSize: "0.7rem",
          padding: "4px 10px",
          cursor: "pointer",
          background: activeFilters.type === "all" ? "#00d4ff" : "transparent",
          border: `1px solid ${activeFilters.type === "all" ? "#00d4ff" : "#1a3a4a"}`,
          color: activeFilters.type === "all" ? "#050a0e" : "#4a6a7a",
          fontWeight: activeFilters.type === "all" ? 700 : 400,
          marginBottom: "0.5rem",
          textAlign: "left",
        }}
      >
        Todos
      </button>
      {filterGroups.map((group) => (
        <div key={group.id} style={{ marginBottom: "0.4rem" }}>
          <button
            onClick={() => setOpen(openSection === group.id ? null : group.id)}
            style={{
              width: "100%",
              fontFamily: "monospace",
              fontSize: "0.65rem",
              padding: "4px 10px",
              cursor: "pointer",
              background: "transparent",
              border: "1px solid #1a3a4a",
              color: gColors[group.id] || "#4a6a7a",
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              letterSpacing: "1px",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.borderColor =
                gColors[group.id] || "#4a6a7a")
            }
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "#1a3a4a")}
          >
            <span>{group.label}</span>
            <span
              style={{
                fontSize: "0.6rem",
                display: "inline-block",
                transition: "transform 0.2s",
                transform:
                  openSection === group.id ? "rotate(90deg)" : "rotate(0deg)",
              }}
            >
              ▶
            </span>
          </button>
          {openSection === group.id && (
            <div
              style={{
                background: "#060d14",
                border: "1px solid #1a3a4a",
                borderTop: "none",
              }}
            >
              {group.values.map((val) => {
                const isActive =
                  activeFilters.type === group.id &&
                  activeFilters.value === val;
                const nodeForVal = graphData.nodes.find(
                  (n) => n.label === val && n.type === group.id,
                );
                const valColor =
                  nodeForVal?.color ||
                  subColors[val] ||
                  gColors[group.id] ||
                  "#4a6a7a";
                return (
                  <button
                    key={val}
                    onClick={() => setFilter(group.id, val)}
                    style={{
                      width: "100%",
                      fontFamily: "monospace",
                      fontSize: "0.65rem",
                      padding: "3px 14px",
                      cursor: "pointer",
                      background: isActive ? valColor + "22" : "transparent",
                      border: "none",
                      borderLeft: `2px solid ${isActive ? valColor : "transparent"}`,
                      color: isActive ? valColor : "#4a6a7a",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = valColor;
                      e.currentTarget.style.borderLeftColor = valColor;
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = "#4a6a7a";
                        e.currentTarget.style.borderLeftColor = "transparent";
                      }
                    }}
                  >
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: valColor,
                        flexShrink: 0,
                      }}
                    />
                    {val}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </>
  );

  return (
    <section id="graph" className="graph-section">
      <div className="graph-header">
        <span
          style={{
            fontFamily: "monospace",
            color: "#00ff88",
            fontSize: "0.85rem",
            flexShrink: 0,
          }}
        >
          03.
        </span>
        <h2 className="graph-title">Knowledge Graph</h2>
        <div className="graph-divider" />
        {!loading && (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.65rem",
              color: "#4a6a7a",
              flexShrink: 0,
            }}
          >
            {totalNodes} nodos · {totalLinks} links
          </span>
        )}
      </div>

      <p
        style={{
          fontFamily: "monospace",
          fontSize: "0.78rem",
          color: "#4a6a7a",
          marginBottom: "1.5rem",
        }}
      >
        // Mapa interactivo de conexiones entre máquinas, técnicas y
        herramientas
      </p>

      {/* Controles móvil */}
      {!loading && graphData?.nodes?.length > 0 && (
        <>
          <div className="graph-mobile-controls">
            <button
              className={`graph-mobile-btn ${animating ? "active" : ""}`}
              onClick={runAnimation}
              disabled={animating}
            >
              {animating ? `⟳ ${animStep}...` : "▶ Animar"}
            </button>
            <button
              className={`graph-mobile-btn ${showLinks ? "active" : ""}`}
              onClick={() => setShowLinks((s) => !s)}
            >
              {showLinks ? "⋯ Ocultar links" : "⋯ Mostrar links"}
            </button>
            <button
              className={`graph-mobile-btn ${showLegend ? "active" : ""}`}
              onClick={() => {
                setShowLegend((s) => !s);
                setShowFilters(false);
              }}
            >
              ◉ Leyenda
            </button>
            <button
              className={`graph-mobile-btn ${showFilters ? "active" : ""}`}
              onClick={() => {
                setShowFilters((s) => !s);
                setShowLegend(false);
              }}
            >
              ⊞ Filtros {activeFilters.type !== "all" ? "●" : ""}
            </button>
          </div>

          {showLegend && (
            <div className="graph-mobile-panel">
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.62rem",
                  color: "#4a6a7a",
                  letterSpacing: "2px",
                  marginBottom: "0.6rem",
                }}
              >
                // Tipos
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                {Object.entries(legendLabels).map(([type, label]) => (
                  <div
                    key={type}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: gColors[type] || "#4a6a7a",
                        boxShadow: `0 0 5px ${gColors[type] || "#4a6a7a"}`,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.68rem",
                        color: "#c8d8e8",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showFilters && (
            <div className="graph-mobile-panel">
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.62rem",
                  color: "#4a6a7a",
                  letterSpacing: "2px",
                  marginBottom: "0.6rem",
                }}
              >
                // Filtrar
              </div>
              <FilterList />
            </div>
          )}
        </>
      )}

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
            // Cargando write-ups...
          </p>
        </div>
      )}

      {!loading && !graphData?.nodes?.length && (
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

      {!loading && graphData?.nodes?.length > 0 && (
        <div
          style={{
            position: "relative",
            background: "#050a0e",
            border: "1px solid #1a3a4a",
            overflow: "hidden",
          }}
        >
          {/* Botones superiores desktop */}
          <div className="graph-top-btns">
            <button
              onClick={runAnimation}
              disabled={animating}
              style={{
                fontFamily: "monospace",
                fontSize: "0.7rem",
                padding: "6px 16px",
                border: `1px solid ${animating ? "#00ff88" : "#1a3a4a"}`,
                background: animating
                  ? "rgba(0,255,136,0.1)"
                  : "rgba(5,10,14,0.95)",
                color: animating ? "#00ff88" : "#c8d8e8",
                cursor: animating ? "not-allowed" : "pointer",
                letterSpacing: "1px",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s",
              }}
              onMouseOver={(e) => {
                if (!animating) {
                  e.currentTarget.style.borderColor = "#00ff88";
                  e.currentTarget.style.color = "#00ff88";
                }
              }}
              onMouseOut={(e) => {
                if (!animating) {
                  e.currentTarget.style.borderColor = "#1a3a4a";
                  e.currentTarget.style.color = "#c8d8e8";
                }
              }}
            >
              <span style={{ fontSize: "0.8rem" }}>
                {animating ? "⟳" : "▶"}
              </span>
              {animating
                ? `Animando: ${animStep}...`
                : "Iniciar animación del grafo"}
            </button>
            <button
              onClick={() => setShowLinks((s) => !s)}
              style={{
                fontFamily: "monospace",
                fontSize: "0.7rem",
                padding: "6px 16px",
                border: `1px solid ${showLinks ? "#00d4ff" : "#1a3a4a"}`,
                background: showLinks
                  ? "rgba(0,212,255,0.1)"
                  : "rgba(5,10,14,0.95)",
                color: showLinks ? "#00d4ff" : "#4a6a7a",
                cursor: "pointer",
                letterSpacing: "1px",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#00d4ff";
                e.currentTarget.style.color = "#00d4ff";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = showLinks
                  ? "#00d4ff"
                  : "#1a3a4a";
                e.currentTarget.style.color = showLinks ? "#00d4ff" : "#4a6a7a";
              }}
            >
              {showLinks ? "⋯ Ocultar conexiones" : "⋯ Mostrar conexiones"}
            </button>
          </div>

          {/* Leyenda desktop */}
          <div className="graph-legend">
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "0.62rem",
                color: "#4a6a7a",
                letterSpacing: "2px",
                marginBottom: "0.6rem",
              }}
            >
              // Tipos
            </div>
            {Object.entries(legendLabels).map(([type, label]) => (
              <div
                key={type}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.3rem",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: gColors[type] || "#4a6a7a",
                    boxShadow: `0 0 5px ${gColors[type] || "#4a6a7a"}`,
                  }}
                />
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.68rem",
                    color: "#c8d8e8",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginTop: "0.5rem",
                paddingTop: "0.5rem",
                borderTop: "1px solid #1a3a4a",
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 0,
                  borderTop: "1px dashed #ffffff44",
                }}
              />
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.62rem",
                  color: "#4a6a7a",
                }}
              >
                Relacionadas
              </span>
            </div>
          </div>

          {/* Filtros desktop */}
          <div className="graph-filter-panel">
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "0.62rem",
                color: "#4a6a7a",
                letterSpacing: "2px",
                marginBottom: "0.6rem",
              }}
            >
              // Filtrar
            </div>
            <FilterList />
          </div>

          <svg ref={svgRef} style={{ width: "100%", display: "block" }} />

          <div
            style={{
              fontFamily: "monospace",
              fontSize: "0.65rem",
              color: "#4a6a7a",
              textAlign: "center",
              padding: "0.5rem",
              borderTop: "1px solid #1a3a4a",
            }}
          >
            {isMobile
              ? "pinch → zoom · drag → mover · tap → conexiones"
              : "scroll → zoom · drag → mover · click → conexiones · doble click → fijar"}
          </div>
        </div>
      )}

      {tooltip.visible && tooltip.node && (
        <div
          style={{
            position: "fixed",
            zIndex: 2000,
            pointerEvents: "none",
            left: Math.min(
              tooltip.x + 14,
              (typeof window !== "undefined" ? window.innerWidth : 800) - 220,
            ),
            top: tooltip.y - 10,
            background: "rgba(10,21,32,0.97)",
            border: `1px solid ${nodeColor(tooltip.node)}44`,
            padding: "0.8rem 1rem",
            minWidth: "180px",
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "0.62rem",
              color: nodeColor(tooltip.node),
              letterSpacing: "2px",
              marginBottom: "0.3rem",
            }}
          >
            {tooltip.node.type?.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "0.3rem",
            }}
          >
            {tooltip.node.label}
          </div>
          {tooltip.node.platform && (
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "0.65rem",
                color: "#4a6a7a",
                marginBottom: "0.2rem",
              }}
            >
              {tooltip.node.platform} · {tooltip.node.os} ·{" "}
              {tooltip.node.difficulty}
            </div>
          )}
          {tooltip.node.desc && (
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "0.65rem",
                color: "#4a6a7a",
                marginTop: "0.3rem",
                lineHeight: 1.5,
              }}
            >
              {tooltip.node.desc}
            </div>
          )}
          {tooltip.node.status === "pwned" && (
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "0.6rem",
                color: "#00ff88",
                marginTop: "0.4rem",
              }}
            >
              ● pwned
            </div>
          )}
        </div>
      )}
    </section>
  );
}
