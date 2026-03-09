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

  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder");

  if (folder) {
    const segments = folder
      .split("/")
      .map((s) =>
        s
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9\-_]/g, ""),
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

  // Búsqueda recursiva por slug
  const allFiles = getAllMdFiles(CONTENT_DIR);
  const match = allFiles.find((f) => {
    const { data } = matter(fs.readFileSync(f, "utf8"));
    return (data.slug || path.basename(f, ".md")) === slug;
  });

  if (!match) return Response.json({ error: "not found" }, { status: 404 });
  const file = fs.readFileSync(match, "utf8");
  const { data: frontmatter } = matter(file);
  return Response.json({ frontmatter });
}

// ── POST — guarda .md via GitHub API ─────────────────────────
export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const { content, folder, token } = await request.json();

    if (!content)
      return Response.json({ error: "Falta el contenido" }, { status: 400 });
    if (!token)
      return Response.json(
        { error: "Falta el token de GitHub" },
        { status: 400 },
      );

    const safeSlug = slug.replace(/[^a-z0-9\-]/g, "").toLowerCase();
    if (!safeSlug)
      return Response.json({ error: "Slug inválido" }, { status: 400 });

    const rawFolder = folder || "writeups";
    const segments = rawFolder
      .split("/")
      .map((s) =>
        s
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9\-_]/g, ""),
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
