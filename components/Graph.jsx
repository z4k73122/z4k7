"use client";
import { useEffect, useRef, useState } from "react";

const gColors = {
  machine: "#00d4ff",
  technique: "#ff3366",
  tool: "#00ff88",
  os: "#ffcc00",
  difficulty: "#b06aff",
  platform: "#ff8c00",
};

const gData = {
  nodes: [
    { id: "HackTheBox", type: "platform", label: "HackTheBox", size: 20 },
    { id: "TryHackMe", type: "platform", label: "TryHackMe", size: 20 },
    { id: "Windows", type: "os", label: "Windows", size: 16 },
    { id: "Linux", type: "os", label: "Linux", size: 16 },
    { id: "Easy", type: "difficulty", label: "Easy", size: 13 },
    { id: "Medium", type: "difficulty", label: "Medium", size: 13 },
    {
      id: "Forest",
      type: "machine",
      label: "Forest",
      size: 19,
      platform: "HackTheBox",
      os: "Windows",
      difficulty: "Easy",
      desc: "AS-REP Roasting + DCSync",
    },
    {
      id: "Legacy",
      type: "machine",
      label: "Legacy",
      size: 19,
      platform: "HackTheBox",
      os: "Windows",
      difficulty: "Easy",
      desc: "EternalBlue MS17-010",
    },
    {
      id: "Blue",
      type: "machine",
      label: "Blue",
      size: 16,
      platform: "HackTheBox",
      os: "Windows",
      difficulty: "Easy",
      desc: "EternalBlue SMB exploit",
    },
    {
      id: "Lame",
      type: "machine",
      label: "Lame",
      size: 16,
      platform: "HackTheBox",
      os: "Linux",
      difficulty: "Easy",
      desc: "Samba command injection",
    },
    {
      id: "Offensive",
      type: "machine",
      label: "Offensive Path",
      size: 19,
      platform: "TryHackMe",
      os: "Linux",
      difficulty: "Medium",
      desc: "+40 labs pentesting",
    },
    {
      id: "Kenobi",
      type: "machine",
      label: "Kenobi",
      size: 15,
      platform: "TryHackMe",
      os: "Linux",
      difficulty: "Easy",
      desc: "ProFTPD + NFS + SUID",
    },
    { id: "AS-REP", type: "technique", label: "AS-REP Roasting", size: 15 },
    { id: "DCSync", type: "technique", label: "DCSync", size: 15 },
    { id: "EternalBlue", type: "technique", label: "EternalBlue", size: 15 },
    { id: "WriteDACL", type: "technique", label: "WriteDACL", size: 13 },
    { id: "SQLi", type: "technique", label: "SQL Injection", size: 13 },
    { id: "PrivEsc", type: "technique", label: "Priv Escalation", size: 15 },
    { id: "SMBExploit", type: "technique", label: "SMB Exploit", size: 13 },
    { id: "Nmap", type: "tool", label: "Nmap", size: 15 },
    { id: "BloodHound", type: "tool", label: "BloodHound", size: 15 },
    { id: "Metasploit", type: "tool", label: "Metasploit", size: 15 },
    { id: "Impacket", type: "tool", label: "Impacket", size: 13 },
    { id: "EvilWinRM", type: "tool", label: "Evil-WinRM", size: 13 },
    { id: "Hashcat", type: "tool", label: "Hashcat", size: 13 },
  ],
  links: [
    { source: "HackTheBox", target: "Forest" },
    { source: "HackTheBox", target: "Legacy" },
    { source: "HackTheBox", target: "Blue" },
    { source: "HackTheBox", target: "Lame" },
    { source: "TryHackMe", target: "Offensive" },
    { source: "TryHackMe", target: "Kenobi" },
    { source: "Windows", target: "Forest" },
    { source: "Windows", target: "Legacy" },
    { source: "Windows", target: "Blue" },
    { source: "Linux", target: "Lame" },
    { source: "Linux", target: "Offensive" },
    { source: "Linux", target: "Kenobi" },
    { source: "Easy", target: "Forest" },
    { source: "Easy", target: "Legacy" },
    { source: "Easy", target: "Blue" },
    { source: "Easy", target: "Lame" },
    { source: "Medium", target: "Offensive" },
    { source: "Forest", target: "AS-REP" },
    { source: "Forest", target: "DCSync" },
    { source: "Forest", target: "WriteDACL" },
    { source: "Forest", target: "PrivEsc" },
    { source: "Legacy", target: "EternalBlue" },
    { source: "Legacy", target: "SMBExploit" },
    { source: "Blue", target: "EternalBlue" },
    { source: "Offensive", target: "SQLi" },
    { source: "Offensive", target: "PrivEsc" },
    { source: "Kenobi", target: "PrivEsc" },
    { source: "Forest", target: "BloodHound" },
    { source: "Forest", target: "Impacket" },
    { source: "Forest", target: "EvilWinRM" },
    { source: "Forest", target: "Hashcat" },
    { source: "Legacy", target: "Metasploit" },
    { source: "Blue", target: "Metasploit" },
    { source: "Offensive", target: "Metasploit" },
    { source: "Nmap", target: "Forest" },
    { source: "Nmap", target: "Legacy" },
    { source: "AS-REP", target: "DCSync" },
    { source: "EternalBlue", target: "SMBExploit" },
    { source: "PrivEsc", target: "DCSync" },
  ],
};

const legendLabels = {
  machine: "Máquina",
  technique: "Técnica",
  tool: "Herramienta",
  os: "OS",
  difficulty: "Dificultad",
  platform: "Plataforma",
};

function nodeMatchesFilter(node, filter) {
  if (filter === "all") return true;
  return (
    node.platform === filter ||
    node.os === filter ||
    node.difficulty === filter ||
    node.id === filter
  );
}

export default function Graph() {
  const svgRef = useRef(null);
  const nodeRef = useRef(null);
  const linkRef = useRef(null);
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    node: null,
  });
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function init() {
      const d3 = await import("d3");
      const container = svgRef.current?.parentElement;
      if (!container) return;

      const W = container.clientWidth;
      const H = 420;

      const svg = d3.select(svgRef.current).attr("width", W).attr("height", H);
      svg.selectAll("*").remove();

      const g = svg.append("g");
      svg.call(
        d3
          .zoom()
          .scaleExtent([0.2, 4])
          .on("zoom", (e) => g.attr("transform", e.transform)),
      );

      const nodes = gData.nodes.map((n) => ({ ...n }));
      const links = gData.links.map((l) => ({ ...l }));

      const sim = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3
            .forceLink(links)
            .id((d) => d.id)
            .distance(80),
        )
        .force(
          "charge",
          d3.forceManyBody().strength((d) => -d.size * 14),
        )
        .force("center", d3.forceCenter(W / 2, H / 2))
        .force(
          "collision",
          d3.forceCollide().radius((d) => d.size + 10),
        );

      const link = g
        .append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke", (d) => gColors[d.source.type] || "#1a3a4a")
        .attr("stroke-opacity", 0.3)
        .attr("stroke-width", 1);

      const node = g
        .append("g")
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
        .attr("fill", (d) => gColors[d.type] + "20")
        .attr("stroke", (d) => gColors[d.type])
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
            .attr("opacity", (n) => (conn.has(n.id) ? 1 : 0.08));
          node
            .selectAll("text")
            .attr("opacity", (n) => (conn.has(n.id) ? 1 : 0.05));
          link
            .attr("stroke-opacity", (l) =>
              l.source.id === d.id || l.target.id === d.id ? 0.9 : 0.02,
            )
            .attr("stroke-width", (l) =>
              l.source.id === d.id || l.target.id === d.id ? 2 : 1,
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
        .attr("fill", (d) => gColors[d.type])
        .attr("font-family", "monospace")
        .attr("font-size", (d) => (d.type === "machine" ? "11px" : "9px"))
        .attr("pointer-events", "none")
        .attr("opacity", 0.85);

      svg.on("click", () => {
        node.selectAll("circle").attr("opacity", 1);
        node.selectAll("text").attr("opacity", 0.85);
        link.attr("stroke-opacity", 0.3).attr("stroke-width", 1);
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
  }, []);

  useEffect(() => {
    const node = nodeRef.current;
    const link = linkRef.current;
    if (!node || !link) return;
    if (filter === "all") {
      node.selectAll("circle").attr("opacity", 1);
      node.selectAll("text").attr("opacity", 0.85);
      link.attr("stroke-opacity", 0.3);
      return;
    }
    node
      .selectAll("circle")
      .attr("opacity", (d) => (nodeMatchesFilter(d, filter) ? 1 : 0.06));
    node
      .selectAll("text")
      .attr("opacity", (d) => (nodeMatchesFilter(d, filter) ? 1 : 0.03));
    link.attr("stroke-opacity", (l) =>
      nodeMatchesFilter(l.source, filter) || nodeMatchesFilter(l.target, filter)
        ? 0.7
        : 0.02,
    );
  }, [filter]);

  const filters = [
    "all",
    "HackTheBox",
    "TryHackMe",
    "Windows",
    "Linux",
    "Easy",
    "Medium",
  ];
  const filterLabels = {
    all: "Todos",
    HackTheBox: "HackTheBox",
    TryHackMe: "TryHackMe",
    Windows: "Windows",
    Linux: "Linux",
    Easy: "Easy",
    Medium: "Medium",
  };

  return (
    <section
      id="graph"
      style={{ position: "relative", zIndex: 1, padding: "5rem 4rem" }}
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
          03.
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
          Knowledge Graph
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

      {/* Contenedor principal */}
      <div
        style={{
          position: "relative",
          background: "#050a0e",
          border: "1px solid #1a3a4a",
          overflow: "hidden",
        }}
      >
        {/* Leyenda — izquierda */}
        <div
          style={{
            position: "absolute",
            top: "1rem",
            left: "1rem",
            zIndex: 10,
            background: "rgba(5,10,14,0.92)",
            border: "1px solid #1a3a4a",
            padding: "0.8rem 1rem",
          }}
        >
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
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: gColors[type],
                  boxShadow: `0 0 5px ${gColors[type]}`,
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

        {/* Filtros — derecha */}
        <div
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            zIndex: 10,
            background: "rgba(5,10,14,0.92)",
            border: "1px solid #1a3a4a",
            padding: "0.8rem 1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.3rem",
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "0.62rem",
              color: "#4a6a7a",
              letterSpacing: "2px",
              marginBottom: "0.3rem",
            }}
          >
            // Filtrar
          </div>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontFamily: "monospace",
                fontSize: "0.7rem",
                letterSpacing: "1px",
                padding: "4px 12px",
                cursor: "pointer",
                textTransform: "capitalize",
                background: filter === f ? "#00d4ff" : "transparent",
                border: `1px solid ${filter === f ? "#00d4ff" : "#1a3a4a"}`,
                color: filter === f ? "#050a0e" : "#4a6a7a",
                fontWeight: filter === f ? 700 : 400,
                transition: "all 0.2s",
                textAlign: "left",
              }}
            >
              {filterLabels[f]}
            </button>
          ))}
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
          scroll → zoom &nbsp;·&nbsp; drag → mover &nbsp;·&nbsp; click →
          conexiones &nbsp;·&nbsp; doble click → fijar
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.visible && tooltip.node && (
        <div
          style={{
            position: "fixed",
            zIndex: 2000,
            pointerEvents: "none",
            left: Math.min(tooltip.x + 14, window.innerWidth - 220),
            top: tooltip.y - 10,
            background: "rgba(10,21,32,0.97)",
            border: "1px solid #1a3a4a",
            padding: "0.8rem 1rem",
            minWidth: "180px",
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "0.62rem",
              color: gColors[tooltip.node.type],
              letterSpacing: "2px",
              marginBottom: "0.3rem",
            }}
          >
            {tooltip.node.type.toUpperCase()}
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
          {tooltip.node.desc && (
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "0.68rem",
                color: "#4a6a7a",
              }}
            >
              {tooltip.node.desc}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
