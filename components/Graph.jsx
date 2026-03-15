"use client";
import { useEffect, useRef, useState, useCallback } from "react";

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

// Fuerza X por plataforma — clusters separados (disjoint)
const PLATFORM_X = {};

// ─── ANIM ORDER ───────────────────────────────────────────────────────────────
const ANIM_ORDER = ["platform", "category", "writeup", "os", "difficulty", "technique", "tool", "tag"];

export default function Graph() {
  const svgRef    = useRef(null);
  const nodeRef   = useRef(null);
  const linkRef   = useRef(null);
  const simRef    = useRef(null);
  const gRef      = useRef(null);
  const allNodes  = useRef([]);
  const allLinks  = useRef([]);

  const [graphData,    setGraphData]    = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [tooltip,      setTooltip]      = useState({ visible: false, x: 0, y: 0, node: null });
  const [activeFilter, setActiveFilter] = useState({ type: "all", value: null });
  const [animating,    setAnimating]    = useState(false);
  const [animStep,     setAnimStep]     = useState(null);
  const [showLinks,    setShowLinks]    = useState(true);
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

      // ── DISJOINT simulation ──────────────────────────────────────────────
      const sim = d3.forceSimulation(nodes)
        .force("link",
          d3.forceLink(links).id((d) => d.id)
            .distance((l) => {
              const tt = typeof l.target === "object" ? l.target.type : "";
              if (tt === "category")  return 90;
              if (tt === "writeup")   return 65;
              if (tt === "os")        return 70;
              if (tt === "difficulty")return 70;
              if (tt === "technique") return 55;
              if (tt === "tool")      return 50;
              if (tt === "tag")       return 55;
              return 60;
            })
            .strength((l) => {
              const tt = typeof l.target === "object" ? l.target.type : "";
              const metaTypes = ["tag","technique","tool","os","difficulty"];
              return metaTypes.includes(tt) ? 0.15 : 0.7;
            })
        )
        .force("charge",
          d3.forceManyBody().strength((d) => {
            if (d.type === "platform")  return -400;
            if (d.type === "category")  return -200;
            if (d.type === "os")        return -180;
            if (d.type === "difficulty")return -160;
            if (d.type === "technique") return -150;
            if (d.type === "tool")      return -130;
            if (d.type === "tag")       return -130;
            return -90;
          }).distanceMax(380)
        )
        // DISJOINT — cada plataforma atrae su cluster a su propia zona X
        .force("x",
          d3.forceX((d) => {
            const plat = d.platform || d.id;
            return PLATFORM_X[plat] || W / 2;
          }).strength((d) => d.type === "tag" ? 0.01 : 0.07)
        )
        .force("y", d3.forceY(H / 2).strength(0.04))
        .force("collision", d3.forceCollide().radius((d) => (d.size || 8) + 7).strength(0.9))
        .alphaDecay(0.012);

      simRef.current = sim;

      // ── Links ────────────────────────────────────────────────────────────
      const link = g.append("g").attr("class", "links")
        .selectAll("line").data(links).join("line")
        .attr("stroke", (d) => {
          const tt = typeof d.target === "object" ? d.target.type : d.type || "";
          if (tt === "tag")       return "#3a3020";
          if (tt === "technique") return "#3a1020";
          if (tt === "tool")      return "#0a3a3a";
          if (tt === "os")        return "#3a3a10";
          if (tt === "difficulty")return "#2a1a3a";
          if (tt === "category")  return "#1a3a4a";
          return "#1a2a3a";
        })
        .attr("stroke-width", (d) => {
          const tt = typeof d.target === "object" ? d.target.type : d.type || "";
          if (tt === "category") return 1;
          if (["tag","technique","tool","os","difficulty"].includes(tt)) return 0.5;
          return 0.7;
        })
        .attr("opacity", 0.7);

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
        .attr("stroke", (d) => TYPE_COLOR[d.type])
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.2);

      // Círculo principal
      node.append("circle")
        .attr("r", (d) => d.size)
        .attr("fill", (d) => TYPE_COLOR[d.type] + "18")
        .attr("stroke", (d) => TYPE_COLOR[d.type])
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
            .attr("stroke-opacity", (l) => l.source.id === d.id || l.target.id === d.id ? 1 : 0.02)
            .attr("stroke-width",   (l) => l.source.id === d.id || l.target.id === d.id ? 2 : 0.3)
            .attr("stroke", (l) =>
              l.source.id === d.id || l.target.id === d.id
                ? "#00ff88"
                : (typeof l.target === "object" && l.target.type === "tag" ? "#3a3020" : "#1a3a4a")
            );
        })
        .on("dblclick", (e, d) => {
          e.stopPropagation();
          d.pinned = !d.pinned;
          d.fx = d.pinned ? d.x : null;
          d.fy = d.pinned ? d.y : null;
        });

      // Label
      node.append("text")
        .text((d) => {
          // Para categorías mostrar solo el último segmento
          if (d.type === "category") return d.id.split("/").pop();
          return d.id;
        })
        .attr("dy", (d) => d.size + 11)
        .attr("text-anchor", "middle")
        .attr("fill", (d) => TYPE_COLOR[d.type])
        .attr("font-family", "monospace")
        .attr("font-size", (d) => d.type === "platform" ? "9px" : "7.5px")
        .attr("letter-spacing", "0.5px")
        .attr("pointer-events", "none")
        .attr("opacity", 0.9);

      // Click en fondo — resetear
      svg.on("click", () => {
        node.selectAll("circle").attr("opacity", 1);
        node.selectAll("text").attr("opacity", 0.9);
        link
          .attr("stroke-opacity", 0.7)
          .attr("stroke-width", (d) => {
            const tt = typeof d.target === "object" ? d.target.type : "";
            return tt === "tag" ? 0.5 : tt === "category" ? 1 : 0.7;
          })
          .attr("stroke", (d) => {
            const tt = typeof d.target === "object" ? d.target.type : "";
            return tt === "tag" ? "#3a3020" : tt === "category" ? "#1a3a4a" : "#1a2a3a";
          });
      });

      sim.on("tick", () => {
        link
          .attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
        node.attr("transform", (d) => `translate(${d.x},${d.y})`);
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
      nodeMatchesFilter(l.source, activeFilter) || nodeMatchesFilter(l.target, activeFilter) ? 0.8 : 0.02
    );
  }, [activeFilter]);

  // ─── Toggle links ─────────────────────────────────────────────────────────
  useEffect(() => {
    const link = linkRef.current;
    if (!link) return;
    link.attr("stroke-opacity", showLinks ? 0.7 : 0);
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
                const c          = TYPE_COLOR[group.id] || "#4a6a7a";
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

            {/* Botones desktop */}
            {!isMobile && (
              <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", zIndex: 10 }}>
                {[
                  {
                    label: animating ? `⟳ ${animStep}...` : "▶ Animar grafo",
                    action: runAnimation,
                    disabled: animating,
                    active: animating,
                    activeColor: "#00ff88",
                  },
                  {
                    label: showLinks ? "⋯ Ocultar links" : "⋯ Mostrar links",
                    action: () => setShowLinks((s) => !s),
                    disabled: false,
                    active: showLinks,
                    activeColor: "#00d4ff",
                  },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.action} disabled={btn.disabled}
                    style={{
                      fontFamily: "monospace", fontSize: "0.68rem", padding: "6px 16px",
                      border: `1px solid ${btn.active ? btn.activeColor : "#1a3a4a"}`,
                      background: btn.active ? btn.activeColor + "15" : "rgba(5,10,14,0.95)",
                      color: btn.active ? btn.activeColor : "#c8d8e8",
                      cursor: btn.disabled ? "not-allowed" : "pointer",
                      letterSpacing: "1px", backdropFilter: "blur(8px)", transition: "all 0.2s",
                    }}
                  >
                    {btn.label}
                  </button>
                ))}
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
                : "scroll → zoom · drag → mover · click → resaltar · doble click → fijar"}
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
          border: `1px solid ${TYPE_COLOR[tooltip.node.type] || "#1a3a4a"}44`,
          padding: "0.8rem 1rem", minWidth: "180px",
          fontFamily: "monospace",
        }}>
          <div style={{ fontSize: "0.55rem", color: TYPE_COLOR[tooltip.node.type] || "#4a6a7a", letterSpacing: "2px", marginBottom: "3px" }}>
            {TYPE_LABEL[tooltip.node.type]?.toUpperCase() || tooltip.node.type?.toUpperCase()}
          </div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
            {tooltip.node.type === "category"
              ? tooltip.node.id.split("/").join(" / ")
              : tooltip.node.id}
          </div>
          {tooltip.node.type === "writeup" && (
            <>
              {tooltip.node.folderPath && (
                <div style={{ fontSize: "0.62rem", color: "#00d4ff", marginBottom: "2px" }}>
                  📁 {tooltip.node.folderPath}
                </div>
              )}
              {(tooltip.node.difficulty || tooltip.node.os) && (
                <div style={{ fontSize: "0.62rem", color: "#4a6a7a" }}>
                  {[tooltip.node.difficulty, tooltip.node.os].filter(Boolean).join(" · ")}
                </div>
              )}
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
