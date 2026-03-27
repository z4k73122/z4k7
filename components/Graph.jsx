"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════════
   CONSTANTES GLOBALES
   ═══════════════════════════════════════════════ */
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
  category:  10,
  writeup:   7,
  os:        10,
  difficulty:9,
  technique: 8,
  tool:      8,
  tag:       7,
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

const DIFFICULTY_COLORS = {
  easy:   "#00ff88",
  medium: "#ffcc00",
  hard:   "#ff8c00",
  insane: "#ff3366",
};

const HUB_THRESHOLD = 10;
const ANIM_ORDER = ["platform","category","writeup","os","difficulty","technique","tool","tag"];
const PLATFORM_X = {};

/* ═══════════════════════════════════════════════
   UTILIDADES
   ═══════════════════════════════════════════════ */
function resolveColor(node, gColors = TYPE_COLOR, subColors = {}) {
  if (!node) return "#4a6a7a";
  if (subColors[node.id])   return subColors[node.id];
  if (node.color)           return node.color;
  if (node.type === "difficulty")
    return DIFFICULTY_COLORS[node.id?.toLowerCase()] || gColors.difficulty || TYPE_COLOR.difficulty;
  return gColors[node.type] || TYPE_COLOR[node.type] || "#4a6a7a";
}

function normalizeGraphData(raw) {
  const PREFIXED = new Set(["os","difficulty","technique","tool","tag"]);
  const prefixId = (id, type) => {
    if (!PREFIXED.has(type)) return id;
    const map = { os:"os:", difficulty:"diff:", technique:"tech:", tool:"tool:", tag:"tag:" };
    const p = map[type] || `${type}:`;
    return id.startsWith(p) ? id : `${p}${id}`;
  };
  const nodes = raw.nodes.map(n => ({ ...n, id: prefixId(n.id, n.type) }));
  const nodeIds = new Set(nodes.map(n => n.id));
  const links = raw.links
    .map(l => {
      const resolveEnd = (val) => {
        if (nodeIds.has(val)) return val;
        const orig = raw.nodes.find(n => n.id === val);
        if (!orig) return val;
        return prefixId(val, orig.type);
      };
      return { ...l, source: resolveEnd(l.source), target: resolveEnd(l.target) };
    })
    .filter(l => l.source !== l.target && nodeIds.has(l.source) && nodeIds.has(l.target));
  return { ...raw, nodes, links };
}

/* ═══════════════════════════════════════════════
   ESTILOS DE ANIMACIÓN — inyectados una vez
   ═══════════════════════════════════════════════ */
const PLATFORM_RING_CSS = `
@keyframes graphSpinDash {
  from { stroke-dashoffset: 0; }
  to   { stroke-dashoffset: -502; }
}
@keyframes graphSpinDashRev {
  from { stroke-dashoffset: 0; }
  to   { stroke-dashoffset: 376; }
}
.graph-platform-ring-outer {
  stroke-dasharray: 6 10;
  animation: graphSpinDash 6s linear infinite;
}
.graph-platform-ring-outer2 {
  stroke-dasharray: 3 16;
  animation: graphSpinDashRev 10s linear infinite;
}
`;

function injectPlatformRingCSS() {
  if (typeof document === "undefined") return;
  if (document.getElementById("graph-platform-ring-style")) return;
  const style = document.createElement("style");
  style.id = "graph-platform-ring-style";
  style.textContent = PLATFORM_RING_CSS;
  document.head.appendChild(style);
}

/* ═══════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════ */
export default function Graph() {
  const router = useRouter();

  const svgRef   = useRef(null);
  const nodeRef  = useRef(null);
  const linkRef  = useRef(null);
  const simRef   = useRef(null);
  const gRef     = useRef(null);
  const allNodes = useRef([]);
  const allLinks = useRef([]);

  const [graphData,    setGraphData]    = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [tooltip,      setTooltip]      = useState({ visible: false, x: 0, y: 0, node: null });
  const [activeFilter, setActiveFilter] = useState({ type: "all", value: null });
  const [animating,    setAnimating]    = useState(false);
  const [animStep,     setAnimStep]     = useState(null);
  const [showLinks,    setShowLinks]    = useState(true);
  const [showLabels,   setShowLabels]   = useState(false);
  const [openSection,  setOpenSection]  = useState(null);
  const [isMobile,     setIsMobile]     = useState(false);
  const [showPanel,    setShowPanel]    = useState(false);

  const gColors   = graphData?.colors    || TYPE_COLOR;
  const subColors = graphData?.subColors || {};

  /* Inyectar CSS de animación al montar */
  useEffect(() => { injectPlatformRingCSS(); }, []);

  /* Responsive */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Carga de datos */
  useEffect(() => {
    fetch("/api/writeups/--graph")
      .then(r => r.json())
      .then(data => {
        if (data?.nodes?.length) setGraphData(normalizeGraphData(data));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* Grupos de filtros */
  const filterGroups = graphData ? [
    {
      id: "platform",
      label: "Plataforma",
      values: [...new Set(graphData.nodes.filter(n => n.type === "platform").map(n => n.id))],
    },
    {
      id: "category",
      label: "Carpeta",
      values: [...new Set(
        graphData.nodes.filter(n => n.type === "category")
          .map(n => ({ full: n.id, display: n.id.split("/").slice(1).join("/") }))
          .filter(n => n.display)
      )].reduce((acc, n) => {
        if (!acc.find(a => a.display === n.display)) acc.push(n);
        return acc;
      }, []),
    },
    {
      id: "os",
      label: "Sistema OS",
      values: [...new Set(graphData.nodes.filter(n => n.type === "os").map(n => n.id))],
    },
    {
      id: "difficulty",
      label: "Dificultad",
      values: [...new Set(graphData.nodes.filter(n => n.type === "difficulty").map(n => n.id))],
    },
    {
      id: "technique",
      label: "Técnica",
      values: [...new Set(graphData.nodes.filter(n => n.type === "technique").map(n => n.id))],
    },
    {
      id: "tool",
      label: "Herramienta",
      values: [...new Set(graphData.nodes.filter(n => n.type === "tool").map(n => n.id))],
    },
    {
      id: "tag",
      label: "Tag",
      values: [...new Set(graphData.nodes.filter(n => n.type === "tag").map(n => n.id))],
    },
  ] : [];

  /* Lógica de filtrado */
  function nodeMatchesFilter(node, filter) {
    if (filter.type === "all") return true;
    if (filter.type === "platform")
      return node.id === filter.value || node.platform === filter.value;
    if (filter.type === "category")
      return node.id === filter.value || node.folderPath?.startsWith(filter.value);
    if (filter.type === "os")
      return node.id === filter.value || `os:${node.os}` === filter.value;
    if (filter.type === "difficulty")
      return node.id === filter.value || `diff:${node.difficulty}` === filter.value;
    if (["technique", "tool", "tag"].includes(filter.type))
      return node.id === filter.value || node.type === "writeup";
    return false;
  }

  /* ══════════════════════════════════════════════
     INICIALIZACIÓN D3
     ══════════════════════════════════════════════ */
  useEffect(() => {
    if (!graphData) return;

    async function init() {
      const d3        = await import("d3");
      const container = svgRef.current?.parentElement;
      if (!container) return;

      const W = container.clientWidth;
      const H = Math.max(500, Math.min(900, graphData.nodes.length * 3));

      const svg = d3.select(svgRef.current).attr("width", W).attr("height", H);
      svg.selectAll("*").remove();

      const g = svg.append("g");
      gRef.current = g;
      svg.call(
        d3.zoom()
          .scaleExtent([0.05, 5])
          .on("zoom", e => g.attr("transform", e.transform))
      );

      const platforms = [...new Set(graphData.nodes.filter(n => n.type === "platform").map(n => n.id))];
      platforms.forEach((p, i) => {
        PLATFORM_X[p] = W * ((i + 1) / (platforms.length + 1));
      });

      const nodeIds = new Set(graphData.nodes.map(n => n.id));
      const nodes   = graphData.nodes.map(n => ({ ...n, size: n.size || TYPE_SIZE[n.type] || 8 }));
      const links   = graphData.links
        .filter(l => l.source !== l.target)
        .filter(l => nodeIds.has(l.source) && nodeIds.has(l.target))
        .map(l => ({ ...l }));

      allNodes.current = nodes;
      allLinks.current = links;

      const connCount = new Map();
      links.forEach(l => {
        const s = typeof l.source === "object" ? l.source.id : l.source;
        const t = typeof l.target === "object" ? l.target.id : l.target;
        connCount.set(s, (connCount.get(s) || 0) + 1);
        connCount.set(t, (connCount.get(t) || 0) + 1);
      });

      nodes.forEach(n => {
        const conn  = connCount.get(n.id) || 0;
        const base  = TYPE_SIZE[n.type] || 7;
        n.connCount = conn;

        if (n.type === "writeup") {
          n.size  = Math.min(base + conn * 0.4, 18);
          n.isHub = false;
        } else {
          const maxSize = {
            platform:  40,
            category:  28,
            os:        26,
            difficulty:24,
            technique: 30,
            tool:      28,
            tag:       28,
          }[n.type] || 24;
          n.size  = Math.min(base + conn * 2, maxSize);
          n.isHub = n.type === "platform" || conn > HUB_THRESHOLD;
        }
      });

      const linkStrokeColor = d => {
        const target = typeof d.target === "object" ? d.target : nodes.find(n => n.id === d.target);
        if (!target) return "#2a3a4a";
        return resolveColor(target, gColors, subColors);
      };

      const sim = d3.forceSimulation(nodes)
        .force("link",
          d3.forceLink(links).id(d => d.id)
            .distance(l => {
              const tt = typeof l.target === "object" ? l.target.type : "";
              if (tt === "category")   return 90;
              if (tt === "writeup")    return 65;
              if (tt === "os")         return 75;
              if (tt === "difficulty") return 75;
              if (tt === "technique")  return 70;
              if (tt === "tool")       return 65;
              if (tt === "tag")        return 70;
              return 65;
            })
            .strength(l => {
              const tt = typeof l.target === "object" ? l.target.type : "";
              return ["tag","technique","tool","os","difficulty"].includes(tt) ? 0.08 : 0.6;
            })
        )
        .force("charge",
          d3.forceManyBody()
            .strength(d => {
              if (d.type === "platform")   return -1000;
              if (d.type === "category")   return -450;
              if (d.isHub)                 return -600;
              if (d.type === "os")         return -300;
              if (d.type === "difficulty") return -300;
              if (d.type === "technique")  return -250;
              if (d.type === "tool")       return -250;
              if (d.type === "tag")        return -250;
              return -200;
            })
            .distanceMax(600)
        )
        .force("x",
          d3.forceX(d => PLATFORM_X[d.platform || d.id] || W / 2)
            .strength(d => {
              if (d.type === "platform") return 0.08;
              if (["tag","technique","tool"].includes(d.type)) return 0.01;
              return 0.05;
            })
        )
        .force("y", d3.forceY(H / 2).strength(0.03))
        .force("collision",
          d3.forceCollide()
            .radius(d => (d.size || 6) + (d.isHub ? 18 : 10))
            .strength(1)
        )
        .alphaDecay(0.01)
        .velocityDecay(0.4);

      simRef.current = sim;

      /* ── Links ── */
      const link = g.append("g").attr("class", "links")
        .selectAll("line").data(links).join("line")
        .attr("stroke", linkStrokeColor)
        .attr("stroke-width", d => {
          const tt = typeof d.target === "object" ? d.target.type : "";
          return (tt === "category" || tt === "platform") ? 1 : 0.5;
        })
        .attr("stroke-opacity", d => {
          const tt = typeof d.target === "object" ? d.target.type : "";
          return (tt === "category" || tt === "writeup") ? 0.5 : 0.3;
        });

      linkRef.current = link;

      /* ── Nodos ── */
      const node = g.append("g").attr("class", "nodes")
        .selectAll("g").data(nodes).join("g")
        .call(
          d3.drag()
            .on("start", (e, d) => {
              if (!e.active) sim.alphaTarget(0.3).restart();
              d.fx = d.x; d.fy = d.y;
            })
            .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
            .on("end",  (e, d) => {
              if (!e.active) sim.alphaTarget(0);
              if (!d.pinned) { d.fx = null; d.fy = null; }
            })
        );

      /* ── Anillos para nodos HUB secundarios ── */
      node.filter(d => d.isHub && d.type !== "platform")
        .append("circle")
        .attr("class", "hub-outer-ring")
        .attr("r", d => d.size + 14)
        .attr("fill", "none")
        .attr("stroke", d => resolveColor(d, gColors, subColors))
        .attr("stroke-width", 0.5)
        .attr("stroke-dasharray", "4 6")
        .attr("opacity", 0.3);

      node.filter(d => d.isHub && d.type !== "platform")
        .append("circle")
        .attr("class", "hub-inner-ring")
        .attr("r", d => d.size + 7)
        .attr("fill", "none")
        .attr("stroke", d => resolveColor(d, gColors, subColors))
        .attr("stroke-width", 0.4)
        .attr("opacity", 0.2);

      /* ════════════════════════════════════════
         ANILLOS PARA PLATAFORMAS
         — el anillo punteado externo GIRA via CSS
         ════════════════════════════════════════ */
      node.filter(d => d.type === "platform")
        .append("circle")
        /* Anillo sólido interior */
        .attr("r", d => d.size + 6)
        .attr("fill", "none")
        .attr("stroke", d => resolveColor(d, gColors, subColors))
        .attr("stroke-width", 0.4)
        .attr("opacity", 0.15);

      node.filter(d => d.type === "platform")
        .append("circle")
        /*
         * ANILLO PUNTEADO EXTERIOR — el que gira.
         * La circunferencia = 2π × r. Para r = size + 12 ≈ 30
         * → circunf ≈ 188. stroke-dashoffset se anima en CSS.
         * La clase graph-platform-ring-outer aplica la animación.
         */
        .attr("r", d => d.size + 12)
        .attr("fill", "none")
        .attr("stroke", d => resolveColor(d, gColors, subColors))
        .attr("stroke-width", 1.2)
        .attr("class", "graph-platform-ring-outer")
        .attr("opacity", 0.65);

      /* ── Círculo principal del nodo ── */
      node.append("circle")
        .attr("r", d => d.size)
        .attr("fill", d => resolveColor(d, gColors, subColors) + "18")
        .attr("stroke", d => resolveColor(d, gColors, subColors))
        .attr("stroke-width", d => {
          if (d.type === "platform") return 1.8;
          if (d.type === "category") return 1.2;
          if (d.isHub)               return 1.4;
          return 0.8;
        })
        .style("cursor", "pointer")
        .on("mouseover", (e, d) =>
          setTooltip({ visible: true, x: e.clientX, y: e.clientY, node: d })
        )
        .on("mousemove", e =>
          setTooltip(t => ({ ...t, x: e.clientX, y: e.clientY }))
        )
        .on("mouseout", () =>
          setTooltip(t => ({ ...t, visible: false }))
        )
        .on("click", (e, d) => {
          e.stopPropagation();
          const connected = new Set([d.id]);
          links.forEach(l => {
            if (l.source.id === d.id) connected.add(l.target.id);
            if (l.target.id === d.id) connected.add(l.source.id);
          });
          node.selectAll("circle")
            .attr("opacity", n => connected.has(n.id) ? 1 : 0.05);
          node.selectAll("text")
            .attr("opacity", n => connected.has(n.id) ? 1 : 0.02);
          link
            .attr("stroke-opacity", l =>
              l.source.id === d.id || l.target.id === d.id ? 0.9 : 0.02
            )
            .attr("stroke-width", l =>
              l.source.id === d.id || l.target.id === d.id ? 2.5 : 0.3
            )
            .attr("stroke", linkStrokeColor);
        })
        .on("dblclick", (e, d) => {
          e.stopPropagation();
          if (d.type === "writeup" && d.id) {
            router.push(`/writeups/${d.id}`);
            return;
          }
          d.pinned = !d.pinned;
          d.fx     = d.pinned ? d.x : null;
          d.fy     = d.pinned ? d.y : null;
        });

      /* ── Etiquetas ── */
      node.append("text")
        .text(d => {
          if (d.type === "category") return d.id.split("/").pop();
          if (d.type === "writeup") {
            const label = d.title || d.id;
            return label.length > 15 ? label.slice(0, 15) + "…" : label;
          }
          const prefixes = ["os:","diff:","tech:","tool:","tag:"];
          let label = d.id;
          prefixes.forEach(p => { if (label.startsWith(p)) label = label.slice(p.length); });
          return label;
        })
        .attr("dy", d => d.size + 11)
        .attr("text-anchor", "middle")
        .attr("fill", d => resolveColor(d, gColors, subColors))
        .attr("font-family", "monospace")
        .attr("font-size", d => d.type === "platform" ? "9px" : d.isHub ? "8px" : "7.5px")
        .attr("letter-spacing", "0.5px")
        .attr("pointer-events", "none")
        .attr("opacity", 0);

      /* ── Click en fondo: resetear ── */
      svg.on("click", () => {
        node.selectAll("circle").attr("opacity", 1);
        node.selectAll("text").attr("opacity", showLabels ? 0.9 : 0);
        link
          .attr("stroke", linkStrokeColor)
          .attr("stroke-width", d => {
            const tt = typeof d.target === "object" ? d.target.type : "";
            return tt === "category" ? 1 : 0.6;
          })
          .attr("stroke-opacity", 0.35);
      });

      sim.on("tick", () => {
        link
          .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
      });

      sim.on("end", () => {
        const padding = 60;
        const xs = nodes.map(d => d.x).filter(Boolean);
        const ys = nodes.map(d => d.y).filter(Boolean);
        if (!xs.length) return;
        const x0 = Math.min(...xs) - padding, x1 = Math.max(...xs) + padding;
        const y0 = Math.min(...ys) - padding, y1 = Math.max(...ys) + padding;
        const scale = Math.min(W / (x1 - x0), H / (y1 - y0), 0.9);
        const tx    = W / 2 - scale * (x0 + x1) / 2;
        const ty    = H / 2 - scale * (y0 + y1) / 2;
        svg.transition().duration(800)
          .call(d3.zoom().transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
      });

      nodeRef.current = node;
    }

    init();
  }, [graphData]);

  /* Filtro activo → D3 */
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
    node.selectAll("circle")
      .attr("opacity", d => nodeMatchesFilter(d, activeFilter) ? 1 : 0.04);
    node.selectAll("text")
      .attr("opacity", d => nodeMatchesFilter(d, activeFilter) ? 1 : 0.02);
    link.attr("stroke-opacity", l =>
      nodeMatchesFilter(l.source, activeFilter) || nodeMatchesFilter(l.target, activeFilter)
        ? 0.6 : 0.02
    );
  }, [activeFilter]);

  /* Toggle links */
  useEffect(() => {
    const link = linkRef.current;
    if (!link) return;
    link.attr("stroke-opacity", d => {
      if (!showLinks) return 0;
      const tt = typeof d.target === "object" ? d.target.type : "";
      return (tt === "category" || tt === "writeup") ? 0.5 : 0.3;
    });
  }, [showLinks]);

  /* Animación por capas */
  const runAnimation = useCallback(async () => {
    const node = nodeRef.current;
    const link = linkRef.current;
    if (!node || !link || !graphData) return;
    setAnimating(true);
    node.selectAll("circle").attr("opacity", 0);
    node.selectAll("text").attr("opacity", 0);
    link.attr("stroke-opacity", 0);
    const delay  = ms => new Promise(r => setTimeout(r, ms));
    const nodes  = allNodes.current;
    const links  = allLinks.current;
    for (const groupType of ANIM_ORDER) {
      const groupNodes = nodes.filter(n => n.type === groupType);
      if (!groupNodes.length) continue;
      setAnimStep(TYPE_LABEL[groupType] || groupType);
      for (const n of groupNodes) {
        node.filter(d => d.id === n.id).selectAll("circle")
          .attr("opacity", 0).transition().duration(250).attr("opacity", 1);
        node.filter(d => d.id === n.id).selectAll("text")
          .attr("opacity", 0).transition().duration(250).attr("opacity", 0.9);
        await delay(groupNodes.length > 20 ? 20 : 50);
      }
      const groupLinks = links.filter(l => {
        const src = typeof l.source === "object" ? l.source : nodes.find(n => n.id === l.source);
        const tgt = typeof l.target === "object" ? l.target : nodes.find(n => n.id === l.target);
        return src?.type === groupType || tgt?.type === groupType;
      });
      for (const l of groupLinks) {
        link.filter(d => d === l).transition().duration(200).attr("stroke-opacity", 0.7);
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

  const totalNodes  = graphData?.nodes?.length      || 0;
  const totalLinks  = graphData?.links?.length       || 0;
  const totalWrites = graphData?.meta?.totalWriteups || 0;
  const totalHubs   = graphData?.nodes?.filter(n =>
    n.type !== "platform" && (allNodes.current.find(a => a.id === n.id)?.isHub)
  ).length || 0;

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
      {filterGroups.map(group => (
        <div key={group.id} style={{ marginBottom: "0.2rem" }}>
          <button
            onClick={() => setOpenSection(openSection === group.id ? null : group.id)}
            style={{
              width: "100%", fontFamily: "monospace", fontSize: "0.62rem",
              padding: "4px 10px", cursor: "pointer", background: "transparent",
              border: "1px solid #1a3a4a",
              color: gColors[group.id] || TYPE_COLOR[group.id] || "#4a6a7a",
              textAlign: "left", display: "flex", justifyContent: "space-between",
              alignItems: "center", letterSpacing: "1px",
            }}
          >
            <span>{group.label}</span>
            <span style={{
              transform: openSection === group.id ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s", fontSize: "0.55rem",
            }}>▶</span>
          </button>
          {openSection === group.id && (
            <div style={{
              background: "#030810", border: "1px solid #1a3a4a",
              borderTop: "none", maxHeight: "160px", overflowY: "auto",
            }}>
              {(group.id === "category"
                ? group.values
                : group.values.map(v => ({ full: v, display: v }))
              ).map(item => {
                const fullVal    = item.full    || item;
                const displayVal = item.display || item;
                const prefixes = ["os:","diff:","tech:","tool:","tag:"];
                let cleanLabel = displayVal;
                prefixes.forEach(p => { if (cleanLabel.startsWith(p)) cleanLabel = cleanLabel.slice(p.length); });
                const isActive = activeFilter.type === group.id && activeFilter.value === fullVal;
                const c = group.id === "difficulty"
                  ? (DIFFICULTY_COLORS[fullVal?.toLowerCase().replace("diff:","")] || gColors.difficulty || TYPE_COLOR.difficulty)
                  : (gColors[group.id] || TYPE_COLOR[group.id] || "#4a6a7a");
                return (
                  <button
                    key={fullVal}
                    onClick={() => setFilter(group.id, fullVal)}
                    style={{
                      width: "100%", fontFamily: "monospace", fontSize: "0.62rem",
                      padding: "3px 12px", cursor: "pointer",
                      background: isActive ? c + "18" : "transparent",
                      border: "none",
                      borderLeft: `2px solid ${isActive ? c : "transparent"}`,
                      color: isActive ? c : "#4a6a7a",
                      textAlign: "left", display: "flex", alignItems: "center", gap: "0.5rem",
                    }}
                  >
                    <div style={{
                      width: 4, height: 4, borderRadius: "50%",
                      background: c, flexShrink: 0,
                    }} />
                    {cleanLabel}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  /* ══════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════ */
  return (
    <section
      id="graph"
      style={{ background: "#050a0e", padding: "2rem 0", fontFamily: "monospace" }}
    >
      <div style={{
        display: "flex", alignItems: "center", gap: "0.8rem",
        marginBottom: "0.5rem", flexWrap: "wrap",
      }}>
        <span style={{ color: "#00ff88", fontSize: "0.85rem", flexShrink: 0 }}>03.</span>
        <h2 style={{
          fontSize: "1.4rem", fontWeight: 700, color: "#fff",
          letterSpacing: "3px", textTransform: "uppercase", margin: 0,
        }}>
          Knowledge Graph
        </h2>
        <div style={{
          flex: 1, height: "1px",
          background: "linear-gradient(to right,#1a3a4a,transparent)",
          minWidth: "20px",
        }} />
        {!loading && (
          <span style={{ fontSize: "0.62rem", color: "#4a6a7a", flexShrink: 0 }}>
            {totalWrites} writeups · {totalNodes} nodos · {totalLinks} links
            {totalHubs > 0 && ` · ${totalHubs} hubs`}
          </span>
        )}
      </div>

      <p style={{ fontSize: "0.75rem", color: "#4a6a7a", marginBottom: "1.2rem" }}>
        // Mapa interactivo — plataformas, carpetas, writeups, técnicas y hubs dinámicos
      </p>

      {loading && (
        <div style={{
          background: "#050a0e", border: "1px solid #1a3a4a",
          padding: "4rem", textAlign: "center",
        }}>
          <p style={{ color: "#00d4ff", fontSize: "0.85rem", letterSpacing: "2px" }}>
            // Cargando grafo...
          </p>
        </div>
      )}

      {!loading && !graphData?.nodes?.length && (
        <div style={{
          background: "#050a0e", border: "1px solid #1a3a4a",
          padding: "4rem", textAlign: "center",
        }}>
          <p style={{ color: "#4a6a7a", fontSize: "0.85rem", letterSpacing: "2px" }}>
            // No hay writeups aún
          </p>
        </div>
      )}

      {!loading && graphData?.nodes?.length > 0 && (
        <>
          {isMobile && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "0.8rem" }}>
              {[
                { label: animating ? `⟳ ${animStep}` : "▶ Animar", action: runAnimation, active: animating },
                { label: showLinks ? "⋯ Ocultar links" : "⋯ Links", action: () => setShowLinks(s => !s), active: showLinks },
                { label: "⊞ Filtros" + (activeFilter.type !== "all" ? " ●" : ""), action: () => setShowPanel(s => !s), active: showPanel },
              ].map((btn, i) => (
                <button key={i} onClick={btn.action} disabled={animating && i === 0}
                  style={{
                    fontFamily: "monospace", fontSize: "0.65rem", padding: "5px 12px",
                    border: `1px solid ${btn.active ? "#00ff88" : "#1a3a4a"}`,
                    background: btn.active ? "rgba(0,255,136,0.08)" : "transparent",
                    color: btn.active ? "#00ff88" : "#4a6a7a",
                    cursor: "pointer", letterSpacing: "1px",
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}

          {isMobile && showPanel && (
            <div style={{
              background: "#060d14", border: "1px solid #1a3a4a",
              padding: "0.8rem", marginBottom: "0.8rem",
            }}>
              <FilterPanel />
            </div>
          )}

          <div style={{
            position: "relative", background: "#050a0e",
            border: "1px solid #1a3a4a", overflow: "hidden",
          }}>
            {!isMobile && (
              <div style={{
                position: "absolute", top: 10, left: "50%",
                transform: "translateX(-50%)", zIndex: 10,
                display: "flex", gap: "6px", alignItems: "center",
                backdropFilter: "blur(8px)",
              }}>
                <input
                  type="text"
                  placeholder="// buscar..."
                  onChange={e => {
                    const v    = e.target.value.toLowerCase();
                    const node = nodeRef.current;
                    const link = linkRef.current;
                    if (!node || !link) return;
                    node.selectAll("circle")
                      .attr("opacity", d => !v ? 1 : d.id.toLowerCase().includes(v) ? 1 : 0.05);
                    node.selectAll("text")
                      .attr("opacity", d => !v ? 0.9 : d.id.toLowerCase().includes(v) ? 1 : 0.02);
                    link.attr("stroke-opacity", l => {
                      if (!v) return 0.7;
                      return (l.source.id?.toLowerCase().includes(v) || l.target.id?.toLowerCase().includes(v))
                        ? 0.9 : 0.02;
                    });
                  }}
                  style={{
                    fontFamily: "monospace", fontSize: "0.68rem",
                    padding: "5px 12px", width: "160px",
                    background: "rgba(5,10,14,0.95)", border: "1px solid #1a3a4a",
                    color: "#c8d8e8", outline: "none",
                    letterSpacing: "0.5px", caretColor: "#00ff88",
                  }}
                  onFocus={e  => (e.target.style.borderColor = "#00d4ff")}
                  onBlur={e   => (e.target.style.borderColor = "#1a3a4a")}
                />
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
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = "#00d4ff"; e.currentTarget.style.color = "#00d4ff"; }}
                  onMouseOut={e  => { e.currentTarget.style.borderColor = "#1a3a4a"; e.currentTarget.style.color = "#c8d8e8"; }}
                >
                  reset
                </button>
                <button
                  onClick={() => {
                    setShowLabels(s => {
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
                    cursor: "pointer", letterSpacing: "1px",
                  }}
                >
                  labels
                </button>
                <button
                  onClick={runAnimation}
                  disabled={animating}
                  style={{
                    fontFamily: "monospace", fontSize: "0.68rem", padding: "5px 14px",
                    border: `1px solid ${animating ? "#00ff88" : "#1a3a4a"}`,
                    background: animating ? "rgba(0,255,136,0.08)" : "rgba(5,10,14,0.95)",
                    color: animating ? "#00ff88" : "#c8d8e8",
                    cursor: animating ? "not-allowed" : "pointer",
                    letterSpacing: "1px",
                  }}
                >
                  {animating ? `⟳ ${animStep}` : "▶ animar"}
                </button>
                <button
                  onClick={() => setShowLinks(s => !s)}
                  style={{
                    fontFamily: "monospace", fontSize: "0.68rem", padding: "5px 14px",
                    border: `1px solid ${showLinks ? "#00d4ff" : "#1a3a4a"}`,
                    background: showLinks ? "rgba(0,212,255,0.08)" : "rgba(5,10,14,0.95)",
                    color: showLinks ? "#00d4ff" : "#c8d8e8",
                    cursor: "pointer", letterSpacing: "1px",
                  }}
                >
                  {showLinks ? "⋯ links" : "⋯ links"}
                </button>
              </div>
            )}

            {!isMobile && (
              <div style={{
                position: "absolute", top: 10, left: 10, zIndex: 10,
                background: "rgba(5,10,14,0.92)", border: "1px solid #1a3a4a",
                padding: "0.7rem 0.9rem", backdropFilter: "blur(8px)",
              }}>
                <div style={{ fontSize: "0.55rem", color: "#4a6a7a", letterSpacing: "2px", marginBottom: "0.5rem" }}>
                  // TIPOS
                </div>
                {Object.entries(TYPE_LABEL).map(([type, label]) => (
                  <div key={type} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: gColors[type] || TYPE_COLOR[type] }} />
                    <span style={{ fontSize: "0.62rem", color: "#c8d8e8" }}>{label}</span>
                  </div>
                ))}
                <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px solid #1a3a4a" }}>
                  {Object.entries(DIFFICULTY_COLORS).map(([diff, color]) => (
                    <div key={diff} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
                      <span style={{ fontSize: "0.60rem", color: "#4a6a7a", textTransform: "capitalize" }}>{diff}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px solid #1a3a4a" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{
                      width: 9, height: 9, borderRadius: "50%",
                      background: "transparent", border: "1.2px solid #EF9F27",
                    }} />
                    <span style={{ fontSize: "0.58rem", color: "#4a6a7a" }}>hub (&gt;{HUB_THRESHOLD} links)</span>
                  </div>
                </div>
              </div>
            )}

            {!isMobile && (
              <div style={{
                position: "absolute", top: 10, right: 10, zIndex: 10, width: "160px",
                background: "rgba(5,10,14,0.92)", border: "1px solid #1a3a4a",
                padding: "0.7rem 0.9rem", backdropFilter: "blur(8px)",
              }}>
                <div style={{ fontSize: "0.55rem", color: "#4a6a7a", letterSpacing: "2px", marginBottom: "0.5rem" }}>
                  // FILTRAR
                </div>
                <FilterPanel />
              </div>
            )}

            <svg ref={svgRef} style={{ width: "100%", display: "block" }} />

            <div style={{
              fontFamily: "monospace", fontSize: "0.6rem",
              color: "#2a4a5a", textAlign: "center",
              padding: "0.4rem", borderTop: "1px solid #1a3a4a",
            }}>
              {isMobile
                ? "pinch → zoom · drag → mover · tap → conexiones"
                : "scroll → zoom · drag → mover · click → resaltar · doble click writeup → abrir · doble click nodo → fijar"
              }
            </div>
          </div>
        </>
      )}

      {tooltip.visible && tooltip.node && (
        <div style={{
          position: "fixed", zIndex: 2000, pointerEvents: "none",
          left: Math.min(tooltip.x + 14, (typeof window !== "undefined" ? window.innerWidth : 800) - 230),
          top: tooltip.y - 10,
          background: "rgba(8,16,26,0.97)",
          border: `1px solid ${resolveColor(tooltip.node, gColors, subColors)}44`,
          padding: "0.8rem 1rem", minWidth: "180px",
          fontFamily: "monospace",
        }}>
          <div style={{
            fontSize: "0.55rem",
            color: resolveColor(tooltip.node, gColors, subColors),
            letterSpacing: "2px", marginBottom: "3px",
          }}>
            {TYPE_LABEL[tooltip.node.type]?.toUpperCase() || tooltip.node.type?.toUpperCase()}
          </div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
            {tooltip.node.type === "writeup"
              ? (tooltip.node.title || tooltip.node.id)
              : tooltip.node.type === "category"
              ? tooltip.node.id.split("/").pop()
              : (() => {
                  const prefixes = ["os:","diff:","tech:","tool:","tag:"];
                  let label = tooltip.node.id;
                  prefixes.forEach(p => { if (label.startsWith(p)) label = label.slice(p.length); });
                  return label;
                })()
            }
          </div>
          {tooltip.node.type === "writeup" && (
            <>
              {(tooltip.node.difficulty || tooltip.node.os) && (
                <div style={{ fontSize: "0.62rem", color: "#4a6a7a", marginBottom: "4px" }}>
                  {[tooltip.node.difficulty, tooltip.node.os].filter(Boolean).join(" · ")}
                </div>
              )}
              <div style={{
                fontSize: "0.6rem", color: "#00ff88", marginTop: "4px",
                borderTop: "1px solid #1a3a4a", paddingTop: "4px",
              }}>
                doble click → ver write-up ↗
              </div>
            </>
          )}
          {["os","difficulty","technique","tool","tag"].includes(tooltip.node.type) && (
            <div style={{ fontSize: "0.62rem", color: "#4a6a7a" }}>
              {tooltip.node.connCount || tooltip.node.count || 1} conexión
              {(tooltip.node.connCount || tooltip.node.count || 1) > 1 ? "es" : ""}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
