import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page");

  if (!page) {
    return new NextResponse("Missing page parameter", { status: 400 });
  }

  // Sanitize the page parameter to prevent directory traversal
  const sanitizedPage = page.replace(/\.\./g, "").replace(/^\//, "");
  
  // The pages are mapped as /docs/agents -> agents.md, /docs -> index.md
  let filename = "index.md";
  if (sanitizedPage && sanitizedPage !== "docs") {
    const parts = sanitizedPage.split("/");
    filename = `${parts[parts.length - 1]}.md`;
  }

  try {
    const filePath = path.join(process.cwd(), "public", "docs-md", filename);
    const content = fs.readFileSync(filePath, "utf-8");
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/markdown",
        "Cache-Control": "public, max-age=3600"
      }
    });
  } catch (error) {
    return new NextResponse("Markdown not found for page: " + filename, { status: 404 });
  }
}
