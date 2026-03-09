// app/api/writeups/[slug]/route.js

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

// ─── Árbol recursivo de content/ ─────────────────────────────────────────────
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

// ─── GET /api/writeups/[slug] → lee frontmatter del writeup ──────────────────
// ─── GET /api/writeups/--tree → devuelve árbol de carpetas  ──────────────────
export async function GET(request, { params }) {
  const { slug } = await params;

  // Ruta especial para el árbol
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

  // Si viene ?folder= → verificar si el archivo ya existe ahí (chequeo de duplicado)
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

  // Lectura normal — busca en writeups/ por defecto
  // Búsqueda recursiva por slug en todo content/
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

  const allFiles = getAllMdFiles(CONTENT_DIR);
  const match = allFiles.find((f) => {
    const { data } = matter(fs.readFileSync(f, "utf8"));
    return (data.slug || path.basename(f, ".md")) === slug;
  });

  if (!match) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  const file = fs.readFileSync(match, "utf8");
  const { data: frontmatter } = matter(file);
  return Response.json({ frontmatter });
}

// ─── POST /api/writeups/[slug] → guarda el .md en la ruta indicada ───────────
// Body: { content: string, folder?: string }
//   folder puede ser ruta simple "writeups" o anidada "htb/maquinas/linux"
//   Si no se pasa folder, usa "writeups" por defecto
export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const { content, folder } = await request.json();

    if (!content) {
      return Response.json({ error: "Falta el contenido" }, { status: 400 });
    }

    // Sanitizar slug
    const safeSlug = slug.replace(/[^a-z0-9\-]/g, "").toLowerCase();
    if (!safeSlug) {
      return Response.json({ error: "Slug inválido" }, { status: 400 });
    }

    // Sanitizar carpeta destino (puede ser ruta anidada a/b/c)
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

    if (!segments.length) {
      return Response.json({ error: "Carpeta inválida" }, { status: 400 });
    }

    const destDir = path.join(CONTENT_DIR, ...segments);
    const filePath = path.join(destDir, `${safeSlug}.md`);

    // Verificar que no salga de CONTENT_DIR (seguridad)
    if (!destDir.startsWith(CONTENT_DIR)) {
      return Response.json({ error: "Ruta no permitida" }, { status: 403 });
    }

    // Crear carpetas si no existen (mkdir -p)
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, "utf8");

    const savedPath = `content/${segments.join("/")}/${safeSlug}.md`;
    return Response.json({ ok: true, path: savedPath });
  } catch (err) {
    console.error("[writeups POST]", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
