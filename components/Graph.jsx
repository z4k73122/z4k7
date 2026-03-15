"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

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
  platform:  16,
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

const PLATFORM_X = {};
const ANIM_ORDER = ["platform","category","writeup","os","difficulty","technique","tool","tag"];

export default function Graph() {
  const router   = useRouter();
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

  function resolveColor(node) {
    if (!node) return "#4a6a7a";
    if (subColors[node.id])  return subColors[node.id];
    if (node.color)          return node.color;
    if (node.type === "difficulty")
      return DIFFICULTY_COLORS[node.id?.toLowerCase()] || gColors.difficulty || TYPE_COLOR.difficulty;
    return gColors[node.type] || TYPE_COLOR[node.type] || "#4a6a7a";
  }

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    fetch("/api/writeups/--graph")
      .then((r) => r.json())
      .then((data) => {
        if (data?.nodes?.length) setGraphData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filterGroups = graphData ? [
    { id: "platform",  label: "Plataforma",  values: [...new Set(graphData.nodes.filter((n) => n.type === "platform").map((n) => n.id))] },
    { id: "category",  label: "Carpeta",
      values: [...new Set(
        graphData.nodes.filter((n) => n.type === "category")
          .map((n) => ({ full: n.id, display: n.id.split("/").slice(1).join("/") }))
          .filter((n) => n.display)
      )].reduce((acc, n) => { if (!acc.find((a) => a.display === n.display)) acc.push(n); return acc; }, []),
    },
    { id: "os",        label: "Sistema OS",  values: [...new Set(graphData.nodes.filter((n) => n.type === "os").map((n) => n.id))] },
    { id: "difficulty",label: "Dificultad",  values: [...new Set(graphData.nodes.filter((n) => n.type === "difficulty").map((n) => n.id))] },
    { id: "technique", label: "Técnica",     values: [...new Set(graphData.nodes.filter((n) => n.type === "technique").map((n) => n.id))] },
    { id: "tool",      label: "Herramienta", values: [...new Set(graphData.nodes.filter((n) => n.type === "tool").map((n) => n.id))] },
    { id: "tag",       label: "Tag",         values: [...new Set(graphData.nodes.filter((n) => n.type === "tag").map((n) => n.id))] },
  ] : [];

  function nodeMatchesFilter(node, filter) {
    if (filter.type === "all") return true;
    if (filter.type === "platform")   return node.id === filter.value || node.platform === filter.value;
    if (filter.type === "category")   return node.id === filter.value || node.folderPath?.startsWith(filter.value);
    if (filter.type === "os")         return node.id === filter.value || node.os === filter.value;
    if (filter.type === "difficulty") return node.id === filter.value || node.difficulty === filter.value;
    if (["technique","tool","tag"].includes(filter.type))
      return node.id === filter.value || node.type === "writeup";
    return false;
  }

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

      svg.call(d3.zoom().scaleExtent([0.05, 5]).on("zoom", (e) => g.attr("transform", e.transform)));

      const platforms = [...new Set(graphData.nodes.filter((n) => n.type === "platform").map((n) => n.id))];
      platforms.forEach((p, i) => { PLATFORM_X[p] = W * ((i + 1) / (platforms.length + 1)); });

      const nodeIds = new Set(graphData.nodes.map((n) => n.id));
      const nodes   = graphData.nodes.map((n) => ({ ...n, size: n.size || TYPE_SIZE[n.type] || 8 }));
      const links   = graphData.links
        .filter((l) => l.source !== l.target)
        .filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target))
        .map((l) => ({ ...l }));

      allNodes.current = nodes;
      allLinks.current = links;

      const connCount = new Map();
      links.forEach((l) => {
        const s = typeof l.source === "object" ? l.source.id : l.source;
        const t = typeof l.target === "object" ? l.target.id : l.target;
        connCount.set(s, (connCount.get(s) || 0) + 1);
        connCount.set(t, (connCount.get(t) || 0) + 1);
      });
      nodes.forEach((n) => {
        const conn    = connCount.get(n.id) || 0;
        const base    = TYPE_SIZE[n.type] || 7;
        const maxSize = { platform:35, category:25, writeup:18, os:20, difficulty:18, technique:25, tool:22, tag:22 }[n.type] || 20;
        n.size = Math.min(base + conn * 1.2, maxSize);
      });

      const sim = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id((d) => d.id)
          .distance((l) => {
            const tt = typeof l.target === "object" ? l.target.type : "";
            if (tt === "category")   return 80;
            if (tt === "writeup")    return 60;
            if (tt === "os")         return 70;
            if (tt === "difficulty") return 70;
            if (tt === "technique")  return 65;
            if (tt === "tool")       return 60;
            if (tt === "tag")        return 65;
            return 60;
          })
          .strength((l) => {
            const tt = typeof l.target === "object" ? l.target.type : "";
            return ["tag","technique","tool","os","difficulty"].includes(tt) ? 0.08 : 0.6;
          })
        )
        .force("charge", d3.forceManyBody()
          .strength((d) => {
            if (d.type === "platform")   return -800;
            if (d.type === "category")   return -400;
            if (d.type === "os")         return -300;
            if (d.type === "difficulty") return -300;
            if (d.type === "technique")  return -250;
            if (d.type === "tool")       return -250;
            if (d.type === "tag")        return -250;
            return -200;
          })
          .distanceMax(500)
        )
        .force("x", d3.forceX((d) => PLATFORM_X[d.platform || d.id] || W / 2)
          .strength((d) => {
            if (d.type === "platform") return 0.08;
            if (["tag","technique","tool"].includes(d.type)) return 0.01;
            return 0.05;
          })
        )
        .force("y", d3.forceY(H / 2).strength(0.03))
        .force("collision", d3.forceCollide().radius((d) => (d.size || 6) + 10).strength(1))
        .alphaDecay(0.01)
        .velocityDecay(0.4);

      simRef.current = sim;

      const linkStrokeColor = (d) => {
        const tt = typeof d.target === "object" ? d.target.type : d.type || "";
        if (tt === "technique")  return gColors.technique  || TYPE_COLOR.technique;
        if (tt === "tag")        return gColors.tag        || TYPE_COLOR.tag;
        if (tt === "tool")       return gColors.tool       || TYPE_COLOR.tool;
        if (tt === "os")         return gColors.os         || TYPE_COLOR.os;
        if (tt === "difficulty") {
          const did = typeof d.target === "object" ? d.target.id?.toLowerCase() : "";
          return DIFFICULTY_COLORS[did] || gColors.difficulty || TYPE_COLOR.difficulty;
        }
        if (tt === "category")  return gColors.category || TYPE_COLOR.category;
        if (tt === "writeup")   return gColors.writeup  || TYPE_COLOR.writeup;
        return "#2a3a4a";
      };

      const link = g.append("g").attr("class", "links")
        .selectAll("line").data(links).join("line")
        .attr("stroke", linkStrokeColor)
        .attr("stroke-width", (d) => {
          const tt = typeof d.target === "object" ? d.target.type : "";
          return (tt === "category" || tt === "platform") ? 1 : 0.5;
        })
        .attr("stroke-opacity", (d) => {
          const tt = typeof d.target === "object" ? d.target.type : "";
          return (tt === "category" || tt === "writeup") ? 0.5 : 0.3;
        });

      linkRef.current = link;

      const node = g.append("g").attr("class", "nodes")
        .selectAll("g").data(nodes).join("g")
        .call(d3.drag()
          .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on("drag",  (e, d) => { d.fx = e.x; d.fy = e.y; })
          .on("end",   (e, d) => { if (!e.active) sim.alphaTarget(0); if (!d.pinned) { d.fx = null; d.fy = null; } })
        );

      node.filter((d) => d.type === "platform")
        .append("circle")
        .attr("r", (d) => d.size + 7)
        .attr("fill", "none")
        .attr("stroke", (d) => resolveColor(d))
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.2);

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
          node.selectAll("text").attr("opacity",   (n) => conn.has(n.id) ? 1 : 0.02);
          link
            .attr("stroke-opacity", (l) => l.source.id === d.id || l.target.id === d.id ? 0.9 : 0.02)
            .attr("stroke-width",   (l) => l.source.id === d.id || l.target.id === d.id ? 2.5 : 0.3)
            .attr("stroke", linkStrokeColor);
        })
        .on("dblclick", (e, d) => {
          e.stopPropagation();
          if (d.type === "writeup" && d.id) { router.push(`/writeups/${d.id}`); return; }
          d.pinned = !d.pinned;
          d.fx = d.pinned ? d.x : null;
          d.fy = d.pinned ? d.y : null;
        });

      node.append("text")
        .text((d) => {
          if (d.type === "category") return d.id.split("/").pop();
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
        .attr("opacity", 0);

      svg.on("click", () => {
        node.selectAll("circle").attr("opacity", 1);
        node.selectAll("text").attr("opacity", showLabels ? 0.9 : 0);
        link
          .attr("stroke", linkStrokeColor)
          .attr("stroke-width", (d) => { const tt = typeof d.target === "object" ? d.target.type : ""; return tt === "category" ? 1 : 0.6; })
          .attr("stroke-opacity", 0.35);
      });

      sim.on("tick", () => {
        link
          .attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
        node.attr("transform", (d) => `translate(${d.x},${d.y})`);
      });

      sim.on("end", () => {
        const padding = 60;
        const xs = nodes.map((d) => d.x).filter(Boolean);
        const ys = nodes.map((d) => d.y).filter(Boolean);
        if (!xs.length) return;
        const x0 = Math.min(...xs) - padding, x1 = Math.max(...xs) + padding;
        const y0 = Math.min(...ys) - padding, y1 = Math.max(...ys) + padding;
        const scale = Math.min(W / (x1 - x0), H / (y1 - y0), 0.9);
        const tx = W / 2 - scale * (x0 + x1) / 2;
        const ty = H / 2 - scale * (y0 + y1) / 2;
        svg.transition().duration(800)
          .call(d3.zoom().transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
      });

      nodeRef.current = node;
    }
    init();
  }, [graphData]);

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

  useEffect(() => {
    const link = linkRef.current;
    if (!link) return;
    link.attr("stroke-opacity", (d) => {
      if (!showLinks) return 0;
      const tt = typeof d.target === "object" ? d.target.type : "";
      return (tt === "category" || tt === "writeup") ? 0.5 : 0.3;
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
      setAnimStep(TYPE_LABEL[groupType] || groupType);
      for (const n of groupNodes) {
        node.filter((d) => d.id === n.id).selectAll("circle").attr("opacity", 0).transition().duration(250).attr("opacity", 1);
        node.filter((d) => d.id === n.id).selectAll("text").attr("opacity", 0).transition().duration(250).attr("opacity", 0.9);
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

  const totalNodes  = graphData?.nodes?.length       || 0;
  const totalLinks  = graphData?.links?.length        || 0;
  const totalWrites = graphData?.meta?.totalWriteups  || 0;

  const FilterPanel = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <button
        onClick={() => setActiveFilter({ type: "all", value: null })}
        style={{
          fontFamily: "monospace", fontSize: "0.68rem", padding: "4px 10px",
          cursor: "pointer", textAlign: "left", letterSpacing: "1px",
          background: activeFilter.type === "all" ? "rgba(0,255,136,0.1)" : "transparent",
          border: `1px solid ${activeFilter.type === "all" ? "#00ff88" : "#1a3a4a"}`,
          color: activeFilter.type === "all" ? "#00ff88" : "#4a6a7a", marginBottom: "0.3rem",
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
              padding: "4px 10px", cursor: "poin
