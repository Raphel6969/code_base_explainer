import { NextResponse } from "next/server";
import { fetchFileContent } from "@/lib/github";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get("repo");
  const path = searchParams.get("path");
  const branch = searchParams.get("branch") || "main";

  if (!repo || !path) {
    return NextResponse.json({ error: "Missing repo or path parameter" }, { status: 400 });
  }

  let [owner, name] = repo.split("/");
  
  if (name && name.endsWith(".git")) {
    name = name.slice(0, -4);
  }
  
  try {
    const content = await fetchFileContent(owner, name, path, branch);
    return new NextResponse(content, {
      headers: { "Content-Type": "text/plain" }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
