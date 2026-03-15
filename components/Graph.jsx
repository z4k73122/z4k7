"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── Colores por tipo ─────────────────────────────────────────────────────────
const TYPE_COLOR = {
  platform:  "#00ff88",
  category:  "#00d4ff",
  writeup:   "#7F77DD",
  os:        "#ffcc00",
  difficulty:"#b06aff",
  technique: "#ff3366",
  tool:      "#00ffcc",
  tag:       "#EF9F27",
};

const TYPE_SIZE = {
  platform:  18,
  category:  12,
  writeup:   9,
  os:        13,
  difficulty:11,
  technique: 10,
  tool:      9,
  tag:       8,
};

const TYPE_LABEL = {
  platform:  "Plataforma",
  category:  "Carpeta",
  writeup:   "Writeup",
  os:        "Sistema OS",
  difficulty:"Dificultad",
  technique: "Técnica",
  tool:      "Herramienta",
  tag:       "Tag",
};

// ─── Color resolver — usa node.color si existe (ej: difficulty) ──────────────
const DIFFICULTY_COLORS = {
  easy:   "#00ff88",
  medium: "#ffcc00",
  hard:   "#ff8c00",
  insane: "#ff3366",
};

function resolveColor(node) {
  if (!node) return "#4a6a7a";
  if (node.color) return node.color;
  if (node.type === "difficulty")
    return DIFFICULTY_COLORS[node.id?.toLowerCase()] || TYPE_COLOR.difficulty;
  return TYPE_COLOR[node.type] || "#4a6a7a";
}

// Fuerza X por plataforma — clusters separados (disjoint)
const PLATFORM_X = {};
const ANIM_ORDER = ["platform", "category", "writeup", "os", "difficulty", "technique", "tool", "tag"];

export default function Graph() {
  const router    = useRouter();
  const svgRef    = useRef(null);
  const nodeRef   = useRef(null);
  const linkRef   = useRef(null);
  const simRef    = useRef(null);
  const gRef      = useRef(null);
  const d3Select  = useRef(null);
  const allNodes  = useRef([]);
  const allLinks  = useRef([]);

  const [graphData,    setGraphData]    = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [tooltip,      setTooltip]      = useState({ visible: false, x: 0, y: 0, node: null });
  const [activeFilter, setActiveFilter] = useState({ type: "all", value: null });
  const [animating,    setAnimating]    = useState(false);
  const [animStep,     setAnimStep]     = useState(null);
  const [showLinks,    setShowLinks]    = useState(true);
  const [showLabels,   setShowLabels]   = useState(false); // inician ocultos
  const [openSection,  setOpenSection]  = useState(null);
  const [isMobile,     setIsMobile]     = useState(false);
  const [showPanel,    setShowPanel]    = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ─── Fetch /api/writeups/--graph ─────────────────────────────────────────
  useEffect(() => {
    fetch("/api/writeups/--graph")
      .then((r) => r.json())
      .then((data) => {
        if (data?.nodes?.length) setGraphData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ─── Grupos de filtros dinámicos ─────────────────────────────────────────
  const filterGroups = graphData
    ? [
        {
          id: "platform",
          label: "Plataforma",
          values: [...new Set(graphData.nodes.filter((n) => n.type === "platform").map((n) => n.id))],
        },
        {
          id: "category",
          label: "Carpeta",
          // Mostrar sin el prefijo de plataforma: "portswigger/sql/blind" → "sql/blind"
          values: [...new Set(
            graphData.nodes
              .filter((n) => n.type === "category")
              .map((n) => ({ full: n.id, display: n.id.split("/").slice(1).join("/") }))
              .filter((n) => n.display) // excluir los que son solo plataforma
          )].reduce((acc, n) => {
            if (!acc.find((a) => a.display === n.display)) acc.push(n);
            return acc;
          }, []),
        },
        {
          id: "os",
          label: "Sistema OS",
          values: [...new Set(graphData.nodes.filter((n) => n.type === "os").map((n) => n.id))],
        },
        {
          id: "difficulty",
          label: "Dificultad",
          values: [...new Set(graphData.nodes.filter((n) => n.type === "difficulty").map((n) => n.id))],
        },
        {
          id: "technique",
          label: "Técnica",
          values: [...new Set(graphData.nodes.filter((n) => n.type === "technique").map((n) => n.id))],
        },
        {
          id: "tool",
          label: "Herramienta",
          values: [...new Set(graphData.nodes.filter((n) => n.type === "tool").map((n) => n.id))],
        },
        {
          id: "tag",
          label: "Tag",
          values: [...new Set(graphData.nodes.filter((n) => n.type === "tag").map((n) => n.id))],
        },
      ]
    : [];

  function nodeMatchesFilter(node, filter) {
    if (filter.type === "all") return true;
    if (filter.type === "platform")
      return node.id === filter.value || node.platform === filter.value;
    if (filter.type === "category")
      return node.id === filter.value || node.folderPath?.startsWith(filter.value);
    if (filter.type === "os")
      return node.id === filter.value || node.os === filter.value;
    if (filter.type === "difficulty")
      return node.id === filter.value || node.difficulty === filter.value;
    if (filter.type === "technique" || filter.type === "tool" || filter.type === "tag")
      return node.id === filter.value || node.type === "writeup";
    return false;
  }

  // ─── Init D3 ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!graphData) return;

    async function init() {
      const d3 = await import("d3");
      const container = svgRef.current?.parentElement;
      if (!container) return;

      const W = container.clientWidth;
      const H = Math.max(500, Math.min(900, graphData.nodes.length * 3));

      const svg = d3.select(svgRef.current).attr("width", W).attr("height", H);
      svg.selectAll("*").remove();

      const g = svg.append("g");
      gRef.current = g;

      svg.call(
        d3.zoom().scaleExtent([0.05, 5])
          .on("zoom", (e) => g.attr("transform", e.transform))
      );

      // Calcular posición X por plataforma para disjoint
      const platforms = [...new Set(graphData.nodes.filter((n) => n.type === "platform").map((n) => n.id))];
      platforms.forEach((p, i) => {
        PLATFORM_X[p] = W * ((i + 1) / (platforms.length + 1));
      });

      const nodeIds = new Set(graphData.nodes.map((n) => n.id));
      const nodes = graphData.nodes.map((n) => ({
        ...n,
        size: n.size || TYPE_SIZE[n.type] || 8,
      }));
      const links = graphData.links
        .filter((l) => l.source !== l.target)
        .filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target))
        .map((l) => ({ ...l }));

      allNodes.current = nodes;
      allLinks.current = links;

      // ── Simulación disjoint — compacta por plataforma ────────────────────
      const sim = d3.forceSimulation(nodes)
        .force("link",
          d3.forceLink(links).id((d) => d.id)
            .distance((l) => {
              const tt = typeof l.target === "object" ? l.target.type : "";
              if (tt === "category")  return 60;
              if (tt === "writeup")   return 45;
              if (tt === "os")        return 50;
              if (tt === "difficulty")return 50;
              if (tt === "technique") return 40;
              if (tt === "tool")      return 35;
              if (tt === "tag")       return 40;
              return 40;
            })
            .strength((l) => {
              const tt = typeof l.target === "object" ? l.target.type : "";
              const metaTypes = ["tag","technique","tool","os","difficulty"];
              return metaTypes.includes(tt) ? 0.2 : 0.8;
            })
        )
        .force("charge",
          d3.forceManyBody()
            .strength((d) => {
              if (d.type === "platform")  return -200;
              if (d.type === "category")  return -100;
              if (d.type === "os")        return -80;
              if (d.type === "difficulty")return -70;
              if (d.type === "technique") return -60;
              if (d.type === "tool")      return -55;
              if (d.type === "tag")       return -55;
              return -45;
            })
            .distanceMax(200)
        )
        .force("x",
          d3.forceX((d) => {
            const plat = d.platform || d.id;
            return PLATFORM_X[plat] || W / 2;
          }).strength((d) => {
            if (d.type === "platform") return 0.12;
            if (["tag","technique","tool"].includes(d.type)) return 0.02;
            return 0.08;
          })
        )
        .force("y", d3.forceY(H / 2).strength(0.06))
        .force("collision", d3.forceCollide().radius((d) => (d.size || 6) + 4).strength(0.8))
        .alphaDecay(0.018);

      simRef.current = sim;

      // ── Links ────────────────────────────────────────────────────────────
      const link = g.append("g").attr("class", "links")
        .selectAll("line").data(links).join("line")
        .attr("stroke", (d) => {
          const target = typeof d.target === "object" ? d.target : null;
          if (target) return resolveColor(target);
          return "#334455";
        })
        .attr("stroke-width", (d) => {
          const tt = typeof d.target === "object" ? d.target.type : "";
          return tt === "category" ? 1.2 : 0.8;
        })
        .attr("stroke-opacity", 0.5);

      linkRef.current = link;

      // ── Nodes ────────────────────────────────────────────────────────────
      const node = g.append("g").attr("class", "nodes")
        .selectAll("g").data(nodes).join("g")
        .call(
          d3.drag()
            .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
            .on("drag",  (e, d) => { d.fx = e.x; d.fy = e.y; })
            .on("end",   (e, d) => { if (!e.active) sim.alphaTarget(0); if (!d.pinned) { d.fx = null; d.fy = null; } })
        );

      // Anillo exterior para plataformas
      node.filter((d) => d.type === "platform")
        .append("circle")
        .attr("r", (d) => d.size + 7)
        .attr("fill", "none")
        .attr("stroke", (d) => resolveColor(d))
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.2);

      // Círculo principal
      node.append("circle")
        .attr("r", (d) => d.size)
        .attr("fill", (d) => resolveColor(d) + "18")
        .attr("stroke", (d) => resolveColor(d))
        .attr("stroke-width", (d) => d.type === "platform" ? 1.8 : d.type === "category" ? 1.2 : 0.8)
        .style("cursor", "pointer")
        .on("mouseover", (e, d) => setTooltip({ visible: true, x: e.clientX, y: e.clientY, node: d }))
        .on("mousemove", (e) => setTooltip((t) => ({ ...t, x: e.clientX, y: e.clientY })))
        .on("mouseout",  () => setTooltip((t) => ({ ...t, visible: false })))
        .on("click", (e, d) => {
          e.stopPropagation();
          const conn = new Set([d.id]);
          links.forEach((l) => {
            if (l.source.id === d.id) conn.add(l.target.id);
            if (l.target.id === d.id) conn.add(l.source.id);
          });
          node.selectAll("circle").attr("opacity", (n) => conn.has(n.id) ? 1 : 0.05);
          node.selectAll("text").attr("opacity", (n) => conn.has(n.id) ? 1 : 0.02);
          link
            .attr("stroke-opacity", (l) => l.source.id === d.id || l.target.id === d.id ? 0.9 : 0.02)
            .attr("stroke-width",   (l) => l.source.id === d.id || l.target.id === d.id ? 2 : 0.3)
            .attr("stroke", (l) => {
              if (l.source.id === d.id || l.target.id === d.id) return "#00ff88";
              const target = typeof l.target === "object" ? l.target : null;
              return target ? resolveColor(target) : "#334455";
            });
        })
        .on("dblclick", (e, d) => {
          e.stopPropagation();
          // Writeup → navegar al write-up
          if (d.type === "writeup" && d.id) {
            router.push(`/writeups/${d.id}`);
            return;
          }
          // Otros nodos → fijar/desfijar posición
          d.pinned = !d.pinned;
          d.fx = d.pinned ? d.x : null;
          d.fy = d.pinned ? d.y : null;
        });

      // Label — inician OCULTOS (opacity 0)
      node.append("text")
        .text((d) => {
          if (d.type === "category") return d.id.split("/").pop();
          // writeup — usar title si existe, truncado a 15 chars
          if (d.type === "writeup") {
            const label = d.title || d.id;
            return label.length > 15 ? label.slice(0, 15) + "…" : label;
          }
          return d.id;
        })
        .attr("dy", (d) => d.size + 11)
        .attr("text-anchor", "middle")
        .attr("fill", (d) => resolveColor(d))
        .attr("font-family", "monospace")
        .attr("font-size", (d) => d.type === "platform" ? "9px" : "7.5px")
        .attr("letter-spacing", "0.5px")
        .attr("pointer-events", "none")
        .attr("opacity", 0); // ← inician ocultos, se activan con botón "labels"

      // Click en fondo — resetear
      svg.on("click", () => {
        node.selectAll("circle").attr("opacity", 1);
        node.selectAll("text").attr("opacity", showLabels ? 0.9 : 0);
        link
          .attr("stroke", (d) => {
            const target = typeof d.target === "object" ? d.target : null;
            return target ? resolveColor(target) : "#334455";
          })
          .attr("stroke-width", (d) => {
            const tt = typeof d.target === "object" ? d.target.type : "";
            return tt === "category" ? 1.2 : 0.8;
          })
          .attr("stroke-opacity", 0.5);
      });

      sim.on("tick", () => {
        link
          .attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
        node.attr("transform", (d) => `translate(${d.x},${d.y})`);
      });

      // Auto-fit: cuando la sim converge, encuadra todos los nodos
      sim.on("end", () => {
        const padding = 40;
        const xs = nodes.map((d) => d.x).filter(Boolean);
        const ys = nodes.map((d) => d.y).filter(Boolean);
        if (!xs.length) return;
        const x0 = Math.min(...xs) - padding;
        const y0 = Math.min(...ys) - padding;
        const x1 = Math.max(...xs) + padding;
        const y1 = Math.max(...ys) + padding;
        const scaleX = W / (x1 - x0);
        const scaleY = H / (y1 - y0);
        const scale  = Math.min(scaleX, scaleY, 1.2); // máximo 1.2x
        const tx = W / 2 - scale * (x0 + x1) / 2;
        const ty = H / 2 - scale * (y0 + y1) / 2;
        svg.transition().duration(600)
          .call(
            d3.zoom().transform,
            d3.zoomIdentity.translate(tx, ty).scale(scale)
          );
      });

      nodeRef.current = node;
    }

    init();
  }, [graphData]);

  // ─── Filtros ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const node = nodeRef.current;
    const link = linkRef.current;
    if (!node || !link) return;

    if (activeFilter.type === "all") {
      node.selectAll("circle").attr("opacity", 1);
      node.selectAll("text").attr("opacity", 0.9);
      link.attr("stroke-opacity", 0.7);
      return;
    }

    node.selectAll("circle").attr("opacity", (d) => nodeMatchesFilter(d, activeFilter) ? 1 : 0.04);
    node.selectAll("text").attr("opacity",   (d) => nodeMatchesFilter(d, activeFilter) ? 1 : 0.02);
    link.attr("stroke-opacity", (l) =>
      nodeMatchesFilter(l.source, activeFilter) || nodeMatchesFilter(l.target, activeFilter) ? 0.6 : 0.02
    );
  }, [activeFilter]);

  // ─── Toggle links ─────────────────────────────────────────────────────────
  useEffect(() => {
    const link = linkRef.current;
    if (!link) return;
    link.attr("stroke-opacity", showLinks ? 0.5 : 0);
  }, [showLinks]);

  // ─── Animación por grupos ─────────────────────────────────────────────────
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

      setAnimStep(TYPE_LABEL[groupType] || groupType);

      for (const n of groupNodes) {
        node.filter((d) => d.id === n.id).selectAll("circle")
          .attr("opacity", 0).transition().duration(250).attr("opacity", 1);
        node.filter((d) => d.id === n.id).selectAll("text")
          .attr("opacity", 0).transition().duration(250).attr("opacity", 0.9);
        await delay(groupNodes.length > 20 ? 20 : 50);
      }

      const groupLinks = links.filter((l) => {
        const src = typeof l.source === "object" ? l.source : nodes.find((n) => n.id === l.source);
        const tgt = typeof l.target === "object" ? l.target : nodes.find((n) => n.id === l.target);
        return src?.type === groupType || tgt?.type === groupType;
      });

      for (const l of groupLinks) {
        link.filter((d) => d === l).transition().duration(200).attr("stroke-opacity", 0.7);
        await delay(groupLinks.length > 80 ? 5 : 15);
      }

      await delay(250);
    }

    setAnimating(false);
    setAnimStep(null);
  }, [graphData]);

  const setFilter = (type, value) => {
    if (activeFilter.type === type && activeFilter.value === value)
      setActiveFilter({ type: "all", value: null });
    else
      setActiveFilter({ type, value });
  };

  const totalNodes  = graphData?.nodes?.length  || 0;
  const totalLinks  = graphData?.links?.length   || 0;
  const totalWrites = graphData?.meta?.totalWriteups || 0;

  // ─── Panel de filtros ─────────────────────────────────────────────────────
  const FilterPanel = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <button
        onClick={() => setActiveFilter({ type: "all", value: null })}
        style={{
          fontFamily: "monospace", fontSize: "0.68rem", padding: "4px 10px",
          cursor: "pointer", textAlign: "left", letterSpacing: "1px",
          background: activeFilter.type === "all" ? "rgba(0,255,136,0.1)" : "transparent",
          border: `1px solid ${activeFilter.type === "all" ? "#00ff88" : "#1a3a4a"}`,
          color: activeFilter.type === "all" ? "#00ff88" : "#4a6a7a",
          marginBottom: "0.3rem",
        }}
      >
        // Todos
      </button>

      {filterGroups.map((group) => (
        <div key={group.id} style={{ marginBottom: "0.2rem" }}>
          <button
            onClick={() => setOpenSection(openSection === group.id ? null : group.id)}
            style={{
              width: "100%", fontFamily: "monospace", fontSize: "0.62rem",
              padding: "4px 10px", cursor: "pointer", background: "transparent",
              border: "1px solid #1a3a4a", color: TYPE_COLOR[group.id] || "#4a6a7a",
              textAlign: "left", display: "flex", justifyContent: "space-between",
              alignItems: "center", letterSpacing: "1px",
            }}
          >
            <span>{group.label}</span>
            <span style={{ transform: openSection === group.id ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", fontSize: "0.55rem" }}>▶</span>
          </button>

          {openSection === group.id && (
            <div style={{ background: "#030810", border: "1px solid #1a3a4a", borderTop: "none", maxHeight: "160px", overflowY: "auto" }}>
              {(group.id === "category" ? group.values : group.values.map((v) => ({ full: v, display: v }))).map((item) => {
                const fullVal    = item.full    || item;
                const displayVal = item.display || item;
                const isActive   = activeFilter.type === group.id && activeFilter.value === fullVal;
                  const c = group.id === "difficulty"
                    ? (DIFFICULTY_COLORS[fullVal?.toLowerCase()] || TYPE_COLOR.difficulty)
                    : TYPE_COLOR[group.id] || "#4a6a7a";
                return (
                  <button
                    key={fullVal}
                    onClick={() => setFilter(group.id, fullVal)}
                    style={{
                      width: "100%", fontFamily: "monospace", fontSize: "0.62rem",
                      padding: "3px 12px", cursor: "pointer",
                      background: isActive ? c + "18" : "transparent",
                      border: "none", borderLeft: `2px solid ${isActive ? c : "transparent"}`,
                      color: isActive ? c : "#4a6a7a", textAlign: "left",
                      display: "flex", alignItems: "center", gap: "0.5rem",
                    }}
                  >
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: c, flexShrink: 0 }} />
                    {displayVal}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <section
      id="graph"
      style={{
        background: "#050a0e",
        padding: "2rem 0",
        fontFamily: "monospace",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
        <span style={{ color: "#00ff88", fontSize: "0.85rem", flexShrink: 0 }}>03.</span>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff", letterSpacing: "3px", textTransform: "uppercase", margin: 0 }}>
          Knowledge Graph
        </h2>
        <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right,#1a3a4a,transparent)", minWidth: "20px" }} />
        {!loading && (
          <span style={{ fontSize: "0.62rem", color: "#4a6a7a", flexShrink: 0 }}>
            {totalWrites} writeups · {totalNodes} nodos · {totalLinks} links
          </span>
        )}
      </div>

      <p style={{ fontSize: "0.75rem", color: "#4a6a7a", marginBottom: "1.2rem" }}>
        // Mapa interactivo — plataformas, carpetas, writeups y técnicas
      </p>

      {/* ── Loading ─────────────────────────────────────────────────────────── */}
      {loading && (
        <div style={{ background: "#050a0e", border: "1px solid #1a3a4a", padding: "4rem", textAlign: "center" }}>
          <p style={{ color: "#00d4ff", fontSize: "0.85rem", letterSpacing: "2px" }}>// Cargando grafo...</p>
        </div>
      )}

      {/* ── Empty ────────────────────────────────────────────────────────────── */}
      {!loading && !graphData?.nodes?.length && (
        <div style={{ background: "#050a0e", border: "1px solid #1a3a4a", padding: "4rem", textAlign: "center" }}>
          <p style={{ color: "#4a6a7a", fontSize: "0.85rem", letterSpacing: "2px" }}>// No hay writeups aún</p>
        </div>
      )}

      {/* ── Graph ────────────────────────────────────────────────────────────── */}
      {!loading && graphData?.nodes?.length > 0 && (
        <>
          {/* Controles móvil */}
          {isMobile && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "0.8rem" }}>
              {[
                { label: animating ? `⟳ ${animStep}` : "▶ Animar", action: runAnimation, active: animating },
                { label: showLinks ? "⋯ Ocultar links" : "⋯ Links", action: () => setShowLinks((s) => !s), active: showLinks },
                { label: "⊞ Filtros" + (activeFilter.type !== "all" ? " ●" : ""), action: () => setShowPanel((s) => !s), active: showPanel },
              ].map((btn, i) => (
                <button key={i} onClick={btn.action} disabled={animating && i === 0}
                  style={{
                    fontFamily: "monospace", fontSize: "0.65rem", padding: "5px 12px",
                    border: `1px solid ${btn.active ? "#00ff88" : "#1a3a4a"}`,
                    background: btn.active ? "rgba(0,255,136,0.08)" : "transparent",
                    color: btn.active ? "#00ff88" : "#4a6a7a", cursor: "pointer", letterSpacing: "1px",
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}

          {/* Panel filtros móvil */}
          {isMobile && showPanel && (
            <div style={{ background: "#060d14", border: "1px solid #1a3a4a", padding: "0.8rem", marginBottom: "0.8rem" }}>
              <FilterPanel />
            </div>
          )}

          {/* Contenedor principal */}
          <div style={{ position: "relative", background: "#050a0e", border: "1px solid #1a3a4a", overflow: "hidden" }}>

            {/* Controles top-center: buscar + reset + labels + animar + links */}
            {!isMobile && (
              <div style={{
                position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
                zIndex: 10, display: "flex", gap: "6px", alignItems: "center",
                backdropFilter: "blur(8px)",
              }}>
                {/* Búsqueda */}
                <input
                  type="text"
                  placeholder="// buscar..."
                  onChange={(e) => {
                    const v = e.target.value.toLowerCase();
                    const node = nodeRef.current;
                    const link = linkRef.current;
                    if (!node || !link) return;
                    node.selectAll("circle").attr("opacity", (d) =>
                      !v ? 1 : d.id.toLowerCase().includes(v) ? 1 : 0.05
                    );
                    node.selectAll("text").attr("opacity", (d) =>
                      !v ? 0.9 : d.id.toLowerCase().includes(v) ? 1 : 0.02
                    );
                    link.attr("stroke-opacity", (l) => {
                      if (!v) return 0.7;
                      return (l.source.id?.toLowerCase().includes(v) || l.target.id?.toLowerCase().includes(v)) ? 0.9 : 0.02;
                    });
                  }}
                  style={{
                    fontFamily: "monospace", fontSize: "0.68rem",
                    padding: "5px 12px", width: "160px",
                    background: "rgba(5,10,14,0.95)",
                    border: "1px solid #1a3a4a",
                    color: "#c8d8e8",
                    outline: "none", letterSpacing: "0.5px",
                    caretColor: "#00ff88",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#00d4ff")}
                  onBlur={(e)  => (e.target.style.borderColor = "#1a3a4a")}
                />

                {/* Reset */}
                <button
                  onClick={async () => {
                    const node = nodeRef.current;
                    const link = linkRef.current;
                    if (!node || !link) return;
                    node.selectAll("circle").attr("opacity", 1);
                    node.selectAll("text").attr("opacity", showLabels ? 0.9 : 0);
                    link.attr("stroke-opacity", showLinks ? 0.7 : 0);
                    const d3 = await import("d3");
                    d3.select(svgRef.current).transition().duration(400)
                      .call(d3.zoom().transform, d3.zoomIdentity);
                  }}
                  style={{
                    fontFamily: "monospace", fontSize: "0.68rem", padding: "5px 14px",
                    border: "1px solid #1a3a4a", background: "rgba(5,10,14,0.95)",
                    color: "#c8d8e8", cursor: "pointer", letterSpacing: "1px",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = "#00d4ff"; e.currentTarget.style.color = "#00d4ff"; }}
                  onMouseOut={(e)  => { e.currentTarget.style.borderColor = "#1a3a4a"; e.currentTarget.style.color = "#c8d8e8"; }}
                >
                  reset
                </button>

                {/* Labels */}
                <button
                  onClick={() => {
                    setShowLabels((s) => {
                      const next = !s;
                      if (nodeRef.current)
                        nodeRef.current.selectAll("text").attr("opacity", next ? 0.9 : 0);
                      return next;
                    });
                  }}
                  style={{
                    fontFamily: "monospace", fontSize: "0.68rem", padding: "5px 14px",
                    border: `1px solid ${showLabels ? "#00ff88" : "#1a3a4a"}`,
                    background: showLabels ? "rgba(0,255,136,0.08)" : "rgba(5,10,14,0.95)",
                    color: showLabels ? "#00ff88" : "#c8d8e8",
                    cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s",
                  }}
                >
                  labels
                </button>

                {/* Animar */}
                <button onClick={runAnimation} disabled={animating}
                  style={{
                    fontFamily: "monospace", fontSize: "0.68rem", padding: "5px 14px",
                    border: `1px solid ${animating ? "#00ff88" : "#1a3a4a"}`,
                    background: animating ? "rgba(0,255,136,0.08)" : "rgba(5,10,14,0.95)",
                    color: animating ? "#00ff88" : "#c8d8e8",
                    cursor: animating ? "not-allowed" : "pointer", letterSpacing: "1px", transition: "all 0.2s",
                  }}
                >
                  {animating ? `⟳ ${animStep}` : "▶ animar"}
                </button>

                {/* Links */}
                <button onClick={() => setShowLinks((s) => !s)}
                  style={{
                    fontFamily: "monospace", fontSize: "0.68rem", padding: "5px 14px",
                    border: `1px solid ${showLinks ? "#00d4ff" : "#1a3a4a"}`,
                    background: showLinks ? "rgba(0,212,255,0.08)" : "rgba(5,10,14,0.95)",
                    color: showLinks ? "#00d4ff" : "#c8d8e8",
                    cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s",
                  }}
                >
                  {showLinks ? "⋯ links" : "⋯ links"}
                </button>
              </div>
            )}

            {/* Leyenda desktop */}
            {!isMobile && (
              <div style={{
                position: "absolute", top: 10, left: 10, zIndex: 10,
                background: "rgba(5,10,14,0.92)", border: "1px solid #1a3a4a",
                padding: "0.7rem 0.9rem", backdropFilter: "blur(8px)",
              }}>
                <div style={{ fontSize: "0.55rem", color: "#4a6a7a", letterSpacing: "2px", marginBottom: "0.5rem" }}>// TIPOS</div>
                {Object.entries(TYPE_LABEL).map(([type, label]) => (
                  <div key={type} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: TYPE_COLOR[type], boxShadow: `0 0 4px ${TYPE_COLOR[type]}` }} />
                    <span style={{ fontSize: "0.62rem", color: "#c8d8e8" }}>{label}</span>
                  </div>
                ))}
                {/* Escala de dificultad */}
                <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px solid #1a3a4a" }}>
                  {Object.entries(DIFFICULTY_COLORS).map(([diff, color]) => (
                    <div key={diff} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: `0 0 4px ${color}` }} />
                      <span style={{ fontSize: "0.60rem", color: "#4a6a7a", textTransform: "capitalize" }}>{diff}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Panel filtros desktop */}
            {!isMobile && (
              <div style={{
                position: "absolute", top: 10, right: 10, zIndex: 10, width: "160px",
                background: "rgba(5,10,14,0.92)", border: "1px solid #1a3a4a",
                padding: "0.7rem 0.9rem", backdropFilter: "blur(8px)",
              }}>
                <div style={{ fontSize: "0.55rem", color: "#4a6a7a", letterSpacing: "2px", marginBottom: "0.5rem" }}>// FILTRAR</div>
                <FilterPanel />
              </div>
            )}

            <svg ref={svgRef} style={{ width: "100%", display: "block" }} />

            <div style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#2a4a5a", textAlign: "center", padding: "0.4rem", borderTop: "1px solid #1a3a4a" }}>
              {isMobile
                ? "pinch → zoom · drag → mover · tap → conexiones"
                : "scroll → zoom · drag → mover · click → resaltar · doble click writeup → abrir · doble click nodo → fijar"}
            </div>
          </div>
        </>
      )}

      {/* ── Tooltip ───────────────────────────────────────────────────────────── */}
      {tooltip.visible && tooltip.node && (
        <div style={{
          position: "fixed", zIndex: 2000, pointerEvents: "none",
          left: Math.min(tooltip.x + 14, (typeof window !== "undefined" ? window.innerWidth : 800) - 230),
          top: tooltip.y - 10,
          background: "rgba(8,16,26,0.97)",
          border: `1px solid ${resolveColor(tooltip.node)}44`,
          padding: "0.8rem 1rem", minWidth: "180px",
          fontFamily: "monospace",
        }}>
          <div style={{ fontSize: "0.55rem", color: resolveColor(tooltip.node), letterSpacing: "2px", marginBottom: "3px" }}>
            {TYPE_LABEL[tooltip.node.type]?.toUpperCase() || tooltip.node.type?.toUpperCase()}
          </div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
            {tooltip.node.type === "writeup"
              ? (tooltip.node.title || tooltip.node.id)
              : tooltip.node.type === "category"
              ? tooltip.node.id.split("/").pop()
              : tooltip.node.id}
          </div>
          {tooltip.node.type === "writeup" && (
            <>
              {(tooltip.node.difficulty || tooltip.node.os) && (
                <div style={{ fontSize: "0.62rem", color: "#4a6a7a", marginBottom: "4px" }}>
                  {[tooltip.node.difficulty, tooltip.node.os].filter(Boolean).join(" · ")}
                </div>
              )}
              <div style={{ fontSize: "0.6rem", color: "#00ff88", marginTop: "4px", borderTop: "1px solid #1a3a4a", paddingTop: "4px" }}>
                doble click → ver write-up ↗
              </div>
            </>
          )}
          {["os","difficulty","technique","tool","tag"].includes(tooltip.node.type) && (
            <div style={{ fontSize: "0.62rem", color: "#4a6a7a" }}>
              {tooltip.node.count || 1} writeup{(tooltip.node.count || 1) > 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
