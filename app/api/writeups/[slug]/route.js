import fs from "fs";
import path from "path";
import matter from "gray-matter";

export async function GET(request, { params }) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), "content/writeups", `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  const file = fs.readFileSync(filePath, "utf8");
  const { data: frontmatter } = matter(file);
  return Response.json({ frontmatter });
}

export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const { content } = await request.json();

    if (!content) {
      return Response.json({ error: "Falta el contenido" }, { status: 400 });
    }

    const safeSlug = slug.replace(/[^a-z0-9\-]/g, "").toLowerCase();
    if (!safeSlug) {
      return Response.json({ error: "Slug inválido" }, { status: 400 });
    }

    const dir = path.join(process.cwd(), "content", "writeups");
    const filePath = path.join(dir, `${safeSlug}.md`);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, "utf8");

    return Response.json({
      ok: true,
      path: `content/writeups/${safeSlug}.md`,
    });
  } catch (err) {
    console.error("[save-writeup POST]", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
