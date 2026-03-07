import fs from "fs";
import path from "path";
import matter from "gray-matter";

const TYPE_SIZE = {
  machine: 19,
  platform: 20,
  os: 16,
  difficulty: 13,
  technique: 15,
  tool: 13,
  tag: 11,
};

export async function GET() {
  const dir = path.join(process.cwd(), "content/writeups");
  if (!fs.existsSync(dir)) return Response.json({ nodes: [], links: [] });

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

  const nodes = [];
  const links = [];
  const nodeSet = new Set();
  const linkSet = new Set();

  // Mapa: técnica/herramienta/tag → [slugs que la usan]
  const sharedMap = {};

  const addNode = (id, label, type, extra = {}) => {
    if (!nodeSet.has(id)) {
      nodeSet.add(id);
      nodes.push({ id, label, type, size: TYPE_SIZE[type] || 12, ...extra });
    }
  };

  const addLink = (source, target, rel) => {
    const key = `${source}→${target}`;
    if (!linkSet.has(key)) {
      linkSet.add(key);
      links.push({ source, target, rel });
    }
  };

  const machineData = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data } = matter(raw);

    const slug = data.slug || file.replace(".md", "");
    const title = data.title || slug;

    addNode(slug, title, "machine", {
      platform: data.platform || "?",
      os: data.os || "?",
      difficulty: data.difficulty || "?",
      status: data.status || "unknown",
      desc: data.summary ? data.summary.slice(0, 80) + "..." : "",
      slug,
    });

    // Plataforma
    if (data.platform) {
      const pid = `plat_${data.platform}`;
      addNode(pid, data.platform, "platform");
      addLink(pid, slug, "platform");
    }

    // OS
    if (data.os) {
      const oid = `os_${data.os}`;
      addNode(oid, data.os, "os");
      addLink(oid, slug, "os");
    }

    // Dificultad
    if (data.difficulty) {
      const did = `diff_${data.difficulty}`;
      addNode(did, data.difficulty, "difficulty");
      addLink(did, slug, "difficulty");
    }

    // Técnicas
    (data.techniques || []).forEach((t) => {
      if (!t || t === "Completar manualmente") return;
      const tid = `tech_${t.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_")}`;
      addNode(tid, t, "technique");
      addLink(slug, tid, "technique");
      if (!sharedMap[tid]) sharedMap[tid] = [];
      sharedMap[tid].push(slug);
    });

    // Herramientas
    (data.tools || []).forEach((tool) => {
      if (!tool) return;
      const tid = `tool_${tool.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_")}`;
      addNode(tid, tool, "tool");
      addLink(slug, tid, "tool");
      if (!sharedMap[tid]) sharedMap[tid] = [];
      sharedMap[tid].push(slug);
    });

    // Tags
    (data.tags || []).forEach((tag) => {
      if (!tag) return;
      const tagid = `tag_${tag.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_")}`;
      addNode(tagid, tag, "tag");
      addLink(slug, tagid, "tag");
      if (!sharedMap[tagid]) sharedMap[tagid] = [];
      sharedMap[tagid].push(slug);
    });

    machineData.push({ slug, data });
  }

  // ── AUTO-LINK: máquinas que comparten técnica/herramienta/tag ──
  Object.entries(sharedMap).forEach(([, slugs]) => {
    if (slugs.length < 2) return;
    // Solo enlazar maquinas diferentes
    const uniqueSlugs = [...new Set(slugs)];
    for (let i = 0; i < uniqueSlugs.length; i++) {
      for (let j = i + 1; j < slugs.length; j++) {
        addLink(uniqueSlugs[i], uniqueSlugs[j], "related");
      }
    }
  });

  return Response.json({ nodes, links });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "graph.json");

    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), "utf8");
    return Response.json({ ok: true, path: "data/graph.json" });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
