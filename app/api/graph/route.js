import fs from "fs";
import path from "path";

const GITHUB_USER  = "z4k73122";
const GITHUB_REPO  = "z4k7";
const GITHUB_BRANCH = "main";
const JSON_PATH    = path.join(process.cwd(), "data", "graph-colors.json");
const API_URL      = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/data/graph-colors.json`;

// ─── GET — devuelve nodos del nuevo endpoint + colores guardados ──────────────
export async function GET() {
  try {
    // 1. Leer estructura desde /api/writeups/--graph (interno)
    const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const graphRes = await fetch(`${base}/api/writeups/--graph`);
    const graphData = await graphRes.json();

    if (!graphData?.nodes?.length) {
      return Response.json({ nodes: [], links: [], colors: {}, subColors: {} });
    }

    // 2. Leer colores guardados (si existen)
    let savedColors = {};
    let savedSubColors = {};
    if (fs.existsSync(JSON_PATH)) {
      try {
        const raw = fs.readFileSync(JSON_PATH, "utf8");
        const parsed = JSON.parse(raw);
        savedColors    = parsed.colors    || {};
        savedSubColors = parsed.subColors || {};
      } catch {}
    }

    // 3. Aplicar subColors a los nodos que tengan color custom
    const enrichedNodes = graphData.nodes.map((n) => {
      const custom = savedSubColors[n.id];
      return custom ? { ...n, color: custom } : n;
    });

    return Response.json({
      nodes:     enrichedNodes,
      links:     graphData.links,
      colors:    savedColors,
      subColors: savedSubColors,
      meta:      graphData.meta,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// ─── POST — guarda solo los colores en GitHub ────────────────────────────────
export async function POST(request) {
  try {
    const { token, colors, subColors } = await request.json();

    if (!token) {
      return Response.json({ ok: false, error: "Falta el token de GitHub" }, { status: 400 });
    }

    // Solo guardar colores — no la estructura completa
    const body = { colors, subColors, updatedAt: new Date().toISOString() };
    const content = Buffer.from(JSON.stringify(body, null, 2)).toString("base64");

    // Obtener SHA si ya existe
    let sha;
    const getRes = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    if (getRes.ok) {
      const existing = await getRes.json();
      sha = existing.sha;
    }

    const putRes = await fetch(API_URL, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "update graph colors",
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

// ─── DELETE — borra los colores guardados ────────────────────────────────────
export async function DELETE(request) {
  try {
    const { token } = await request.json();
    if (!token) return Response.json({ ok: false, error: "Falta el token" }, { status: 400 });

    const getRes = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    if (!getRes.ok) return Response.json({ ok: true });

    const { sha } = await getRes.json();

    await fetch(API_URL, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "reset graph colors",
        sha,
        branch: GITHUB_BRANCH,
      }),
    });

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
