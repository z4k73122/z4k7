// app/api/writeups-folders/route.js
// GET  → devuelve árbol recursivo de content/
// POST { path } → crea la ruta completa (mkdir -p) dentro de content/

import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");

// Árbol recursivo: { _files: N, children: { nombre: { _files, children } } }
function buildTree(dir) {
  const result = { _files: 0, children: {} };
  if (!fs.existsSync(dir)) return result;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    result._files = entries.filter(
      (e) => !e.isDirectory() && e.name.endsWith(".md"),
    ).length;
    entries
      .filter((e) => e.isDirectory())
      .forEach((e) => {
        result.children[e.name] = buildTree(path.join(dir, e.name));
      });
  } catch {}
  return result;
}

export async function GET() {
  try {
    if (!fs.existsSync(CONTENT_DIR))
      fs.mkdirSync(CONTENT_DIR, { recursive: true });
    const root = buildTree(CONTENT_DIR);
    return Response.json({ tree: root.children });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { path: relPath } = await request.json();
    if (!relPath?.trim())
      return Response.json({ error: "Ruta requerida" }, { status: 400 });

    const segments = relPath
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
      return Response.json({ error: "Ruta inválida" }, { status: 400 });

    const safePath = segments.join("/");
    const absPath = path.join(CONTENT_DIR, ...segments);

    if (!absPath.startsWith(CONTENT_DIR)) {
      return Response.json({ error: "Ruta no permitida" }, { status: 403 });
    }

    const existed = fs.existsSync(absPath);
    fs.mkdirSync(absPath, { recursive: true });

    return Response.json({
      ok: true,
      path: `content/${safePath}`,
      created: !existed,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
