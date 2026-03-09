import fs from "fs";
import path from "path";
import matter from "gray-matter";

// ── Recursivo: busca todos los .md en cualquier nivel ─────────
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
  const dir = path.join(process.cwd(), "content");
  const files = getAllMdFiles(dir);
  if (!files.length) return Response.json([]);

  const labs = files.map((file) => {
    const raw = fs.readFileSync(file, "utf8");
    const { data } = matter(raw);
    const slug = data.slug || path.basename(file, ".md");

    return {
      slug,
      title: data.title || slug,
      platform: data.platform || "?",
      platformClass: (data.platform || "other")
        .toLowerCase()
        .replace(/\s+/g, "-"),
      difficulty: data.difficulty || "?",
      os: data.os || "?",
      status: data.status || "unknown",
      desc: data.summary ? data.summary.slice(0, 100) + "..." : "",
      tags: data.tags || [],
      date: data.date || "",
      soon: false,
    };
  });

  labs.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date) - new Date(a.date);
  });

  return Response.json(labs);
}
