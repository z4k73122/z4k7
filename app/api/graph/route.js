import fs from "fs";
import path from "path";
import matter from "gray-matter";

const GITHUB_USER   = "z4k73122";
const GITHUB_REPO   = "z4k7";
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

export async function GET() {
  const jsonPath = path.join(process.cwd(), "data", "graph.json");
  if (fs.existsSync(jsonPath)) {
    const raw  = fs.readFileSync(jsonPath, "utf8");
    const data = JSON.parse(raw);
    return Response.json(data);
  }
  return Response.json({ nodes: [], links: [] });
}

export async function POST(request) {
  try {
    const { token, ...body } = await request.json();

    if (!token)
      return Response.json({ ok: false, error: "Falta el token de GitHub" }, { status: 400 });

    const content = Buffer.from(JSON.stringify(body, null, 2)).toString("base64");
    const apiUrl  = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/data/graph.json`;

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

export async function DELETE(request) {
  try {
    const { token } = await request.json();
    if (!token)
      return Response.json({ ok: false, error: "Falta el token" }, { status: 400 });

    const apiUrl = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/data/graph.json`;

    const getRes = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    if (!getRes.ok) return Response.json({ ok: true });

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
