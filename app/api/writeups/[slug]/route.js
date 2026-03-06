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
