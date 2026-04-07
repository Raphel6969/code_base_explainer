import { NextResponse } from "next/server";
import { fetchRepoTree } from "@/lib/github";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get("repo"); // Format: "owner/repo"
  const branch = searchParams.get("branch") || "main";

  if (!repo) {
    return NextResponse.json({ error: "Missing repo parameter" }, { status: 400 });
  }

  let [owner, name] = repo.split("/");
  if (!owner || !name) {
    return NextResponse.json({ error: "Invalid repo format. Should be owner/repo" }, { status: 400 });
  }

  if (name.endsWith(".git")) {
    name = name.slice(0, -4);
  }

  try {
    const data = await fetchRepoTree(owner, name, branch);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
