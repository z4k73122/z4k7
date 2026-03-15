import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");
const GITHUB_USER = "z4k73122";
const GITHUB_REPO = "z4k7";
const GITHUB_BRANCH = "main";

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

function buildTree(dir) {
  const node = { _files: 0, children: {} };
  if (!fs.existsSync(dir)) return node;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    node._files = entries.filter(
      (e) => !e.isDirectory() && e.name.endsWith(".md"),
    ).length;
    entries
      .filter((e) => e.isDirectory())
      .forEach((e) => {
        node.children[e.name] = buildTree(path.join(dir, e.name));
      });
  } catch {}
  return node;
}

export async function GET(request, { params }) {
  const { slug } = await params;

  // ── --tree ────────────────────────────────────────────────
  if (slug === "--tree") {
    try {
      if (!fs.existsSync(CONTENT_DIR))
        fs.mkdirSync(CONTENT_DIR, { recursive: true });
      const root = buildTree(CONTENT_DIR);
      return Response.json({ tree: root.children });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  // ── --graph — NUEVO ───────────────────────────────────────
  // Devuelve todos los writeups como nodos para el grafo D3
  if (slug === "--graph") {
    try {
      const allFiles = getAllMdFiles(CONTENT_DIR);
      const writeupNodes = [];
      const categorySet = new Set(); // todos los niveles de carpeta

      for (const filePath of allFiles) {
        const file = fs.readFileSync(filePath, "utf8");
        const { data } = matter(file);

        const relative = path.relative(CONTENT_DIR, filePath);
        const segments = relative.split(path.sep);
        const folderPath = segments.slice(0, -1).join("/");
        const parts = folderPath.split("/").filter(Boolean);

        const platform = parts[0] || "other";

        // Registrar cada nivel de carpeta como nodo
        // ej: portswigger/sql/blind → genera "portswigger", "portswigger/sql", "portswigger/sql/blind"
        for (let i = 1; i <= parts.length; i++) {
          categorySet.add(parts.slice(0, i).join("/"));
        }

        writeupNodes.push({
          slug:       data.slug || path.basename(filePath, ".md"),
          title:      data.title || "",
          platform,
          folderPath,
          parts,
          tags:       data.tags       || [],
          techniques: data.techniques || [],
          difficulty: data.difficulty || "",
          os:         data.os         || "",
          size:       (data.tags?.length || 0) + (data.techniques?.length || 0),
        });
      }

      // Separar plataformas (nivel 0) de subcarpetas (nivel 1+)
      const platformSet = new Set(writeupNodes.map((w) => w.platform));

      const platformNodes = [...platformSet].map((p) => ({
        id:       p,
        type:     "platform",
        platform: p,
        size:     18,
      }));

      // Categorías = todos los niveles EXCEPTO el nivel 0 (plataforma)
      const categoryNodes = [...categorySet]
        .filter((c) => c.split("/").length > 1 || !platformSet.has(c))
        .filter((c) => {
          // excluir los que son solo plataforma (ya están en platformNodes)
          const parts = c.split("/");
          return parts.length > 1;
        })
        .map((c) => ({
          id:       c,
          type:     "category",
          platform: c.split("/")[0],
          depth:    c.split("/").length, // profundidad del nodo
          size:     Math.max(8, 14 - c.split("/").length * 2),
        }));

      // Construir links struct encadenando cada nivel
      const structLinks = [];
      for (const w of writeupNodes) {
        const parts = w.parts;

        if (parts.length === 0) continue;

        // encadenar niveles: plataforma → sub1 → sub2 → ... → writeup
        for (let i = 0; i < parts.length; i++) {
          const parent = i === 0 ? parts[0] : parts.slice(0, i).join("/");
          const child  = parts.slice(0, i + 1).join("/");
          if (parent !== child) {
            structLinks.push({ source: parent, target: child, type: "struct" });
          }
        }

        // último nivel de carpeta → writeup
        structLinks.push({
          source: parts.join("/"),
          target: w.slug,
          type:   "struct",
        });
      }

      // Construir nodos de tags y técnicas + links tag
      const tagMap = new Map();
      const tagLinks = [];

      for (const w of writeupNodes) {
        const allTags = [...(w.tags || []), ...(w.techniques || [])];
        for (const tag of allTags) {
          if (!tagMap.has(tag)) {
            tagMap.set(tag, { id: tag, type: "tag", count: 0, size: 6 });
          }
          tagMap.get(tag).count++;
          tagMap.get(tag).size = 6 + tagMap.get(tag).count * 2;
          tagLinks.push({ source: w.slug, target: tag, type: "tag" });
        }
      }

      const tagNodes = [...tagMap.values()];

      // Nodos finales de writeup con size calculado
      const finalWriteupNodes = writeupNodes.map((w) => ({
        id:         w.slug,
        type:       "writeup",
        title:      w.title,
        platform:   w.platform,
        folderPath: w.folderPath,  // "portswigger/sql/blind"
        difficulty: w.difficulty,
        os:         w.os,
        size:       Math.min(7 + w.size * 0.5, 14),
      }));

      // Deduplicar links struct
      const seenLinks = new Set();
      const dedupedLinks = [...structLinks, ...tagLinks].filter((l) => {
        const key = `${l.source}→${l.target}`;
        if (seenLinks.has(key)) return false;
        seenLinks.add(key);
        return true;
      });

      return Response.json({
        nodes: [...platformNodes, ...categoryNodes, ...finalWriteupNodes, ...tagNodes],
        links: dedupedLinks,
        meta: {
          totalWriteups:  writeupNodes.length,
          totalPlatforms: platformNodes.length,
          totalTags:      tagNodes.length,
        },
      });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  // ── GET por folder (check existencia) ────────────────────
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder");

  if (folder) {
    const segments = folder
      .split("/")
      .map((s) =>
        s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-_]/g, ""),
      )
      .filter(Boolean);
    const safeSlug = slug.replace(/[^a-z0-9\-]/g, "").toLowerCase();
    const filePath = path.join(CONTENT_DIR, ...segments, `${safeSlug}.md`);
    if (fs.existsSync(filePath)) {
      const file = fs.readFileSync(filePath, "utf8");
      const { data: frontmatter } = matter(file);
      return Response.json({ frontmatter, exists: true });
    }
    return Response.json({ error: "not found" }, { status: 404 });
  }

  // ── GET por slug — búsqueda recursiva ────────────────────
  const allFiles = getAllMdFiles(CONTENT_DIR);
  const match = allFiles.find((f) => {
    const { data } = matter(fs.readFileSync(f, "utf8"));
    return (data.slug || path.basename(f, ".md")) === slug;
  });

  if (!match) return Response.json({ error: "not found" }, { status: 404 });

  const file = fs.readFileSync(match, "utf8");
  const { data: frontmatter } = matter(file);

  // ── CAMBIO 1: agregar folderPath al response ──────────────
  const relative = path.relative(CONTENT_DIR, match);
  const segments = relative.split(path.sep);
  const folderPath = segments.slice(0, -1).join("/");

  return Response.json({ frontmatter, folderPath });
}

// ── POST — guarda .md via GitHub API ─────────────────────────
export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const { content, folder, token } = await request.json();

    if (!content)
      return Response.json({ error: "Falta el contenido" }, { status: 400 });
    if (!token)
      return Response.json({ error: "Falta el token de GitHub" }, { status: 400 });

    const safeSlug = slug.replace(/[^a-z0-9\-]/g, "").toLowerCase();
    if (!safeSlug)
      return Response.json({ error: "Slug inválido" }, { status: 400 });

    const rawFolder = folder || "writeups";
    const segments = rawFolder
      .split("/")
      .map((s) =>
        s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-_]/g, ""),
      )
      .filter(Boolean);
    if (!segments.length)
      return Response.json({ error: "Carpeta inválida" }, { status: 400 });

    const filePath = `content/${segments.join("/")}/${safeSlug}.md`;
    const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${filePath}`;
    const encoded = Buffer.from(content).toString("base64");

    // Verificar si ya existe (para obtener SHA)
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

    const putRes = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `add writeup: ${safeSlug}`,
        content: encoded,
        branch: GITHUB_BRANCH,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!putRes.ok) {
      const err = await putRes.json();
      return Response.json({ error: err.message }, { status: 500 });
    }

    return Response.json({ ok: true, path: filePath });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
