import fs from "fs";
import path from "path";
import matter from "gray-matter";

const GITHUB_USER = "z4k73122";
const GITHUB_REPO = "z4k7";
const GITHUB_BRANCH = "main";

const TYPE_SIZE = {
  machine: 19,
  platform: 20,
  os: 16,
  difficulty: 13,
  technique: 15,
  tool: 13,
  tag: 11,
};

const getAllMdFiles = (dirPath) => {
  if (!fs.existsSync(dirPath)) return [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) return getAllMdFiles(fullPath);
    if (entry.name.endsWith(".md")) return [fullPath];
    return [];
  });
};

export async function GET() {
  const jsonPath = path.join(process.cwd(), "data", "graph.json");
  if (fs.existsSync(jsonPath)) {
    const raw = fs.readFileSync(jsonPath, "utf8");
    const data = JSON.parse(raw);
    return Response.json(data);
  }

  const dir = path.join(process.cwd(), "content");
  const files = getAllMdFiles(dir);
  if (!files.length) return Response.json({ nodes: [], links: [] });

  const nodes = [],
    links = [];
  const nodeSet = new Set(),
    linkSet = new Set();
  const sharedMap = {};

  const addNode = (id, label, type, extra = {}) => {
    if (!nodeSet.has(id)) {
      nodeSet.add(id);
      nodes.push({ id, label, type, size: TYPE_SIZE[type] || 12, ...extra });
    }
  };
  const addLink = (source, target, rel) => {
    if (source === target) return;
    const key = `${source}→${target}`;
    if (!linkSet.has(key)) {
      linkSet.add(key);
      links.push({ source, target, rel });
    }
  };

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const { data } = matter(raw);
    const slug = data.slug || path.basename(file, ".md");
    const title = data.title || slug;

    addNode(slug, title, "machine", {
      platform: data.platform || "?",
      os: data.os || "?",
      difficulty: data.difficulty || "?",
      status: data.status || "unknown",
      desc: data.summary ? data.summary.slice(0, 80) + "..." : "",
      slug,
    });

    if (data.platform) {
      const pid = `plat_${data.platform}`;
      addNode(pid, data.platform, "platform");
      addLink(pid, slug, "platform");
    }
    if (data.os) {
      const oid = `os_${data.os}`;
      addNode(oid, data.os, "os");
      addLink(oid, slug, "os");
    }
    if (data.difficulty) {
      const did = `diff_${data.difficulty}`;
      addNode(did, data.difficulty, "difficulty");
      addLink(did, slug, "difficulty");
    }

    (data.techniques || []).forEach((t) => {
      if (!t || t === "Completar manualmente") return;
      const tid = `tech_${t.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_")}`;
      addNode(tid, t, "technique");
      addLink(slug, tid, "technique");
      if (!sharedMap[tid]) sharedMap[tid] = [];
      sharedMap[tid].push(slug);
    });
    (data.tools || []).forEach((tool) => {
      if (!tool) return;
      const tid = `tool_${tool.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_")}`;
      addNode(tid, tool, "tool");
      addLink(slug, tid, "tool");
      if (!sharedMap[tid]) sharedMap[tid] = [];
      sharedMap[tid].push(slug);
    });
    (data.tags || []).forEach((tag) => {
      if (!tag) return;
      const tagid = `tag_${tag.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_")}`;
      addNode(tagid, tag, "tag");
      addLink(slug, tagid, "tag");
      if (!sharedMap[tagid]) sharedMap[tagid] = [];
      sharedMap[tagid].push(slug);
    });
  }

  Object.entries(sharedMap).forEach(([, slugs]) => {
    const unique = [...new Set(slugs)];
    if (unique.length < 2) return;
    for (let i = 0; i < unique.length; i++)
      for (let j = i + 1; j < unique.length; j++)
        addLink(unique[i], unique[j], "related");
  });

  return Response.json({ nodes, links });
}

// ── POST — guarda via GitHub API ──────────────────────────────
export async function POST(request) {
  try {
    const { token, ...body } = await request.json();

    if (!token) {
      return Response.json(
        { ok: false, error: "Falta el token de GitHub" },
        { status: 400 },
      );
    }

    const content = Buffer.from(JSON.stringify(body, null, 2)).toString(
      "base64",
    );
    const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/data/graph.json`;

    // Obtener SHA del archivo si ya existe
    let sha;
    const getRes = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    if (getRes.ok) {
      const existing = await getRes.json();
      sha = existing.sha;
    }

    // Crear o actualizar
    const putRes = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "update graph.json",
        content,
        branch: GITHUB_BRANCH,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!putRes.ok) {
      const err = await putRes.json();
      return Response.json({ ok: false, error: err.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}

// ── DELETE — borra via GitHub API ─────────────────────────────
export async function DELETE(request) {
  try {
    const { token } = await request.json();
    if (!token)
      return Response.json(
        { ok: false, error: "Falta el token" },
        { status: 400 },
      );

    const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/data/graph.json`;

    const getRes = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    if (!getRes.ok) return Response.json({ ok: true }); // ya no existe

    const { sha } = await getRes.json();

    await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "delete graph.json",
        sha,
        branch: GITHUB_BRANCH,
      }),
    });

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
