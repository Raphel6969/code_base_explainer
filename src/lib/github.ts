export interface GitNode {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
}

export interface GitTreeResponse {
  sha: string;
  url: string;
  tree: GitNode[];
  truncated: boolean;
}

export async function fetchRepoTree(owner: string, repo: string, branch: string = "main"): Promise<GitTreeResponse> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const res = await fetch(url, { headers });

  if (!res.ok) {
    if (res.status === 404 && branch === "main") {
      // Fallback to master if main doesn't exist
      return fetchRepoTree(owner, repo, "master");
    }
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function fetchFileContent(owner: string, repo: string, path: string, branch: string = "main"): Promise<string> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  // Using raw.githubusercontent.com is often faster/simpler for file contents
  // If private repo is supported in the future, raw URLs require passing the token as well
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encodeURIComponent(path)}`;
  const res = await fetch(rawUrl, { headers });
  
  if (!res.ok) {
    if (res.status === 404 && branch === "main") {
      // Fallback to master if main doesn't exist
      return fetchFileContent(owner, repo, path, "master");
    }
    throw new Error(`Failed to fetch file content: ${res.status} ${res.statusText}`);
  }

  return res.text();
}
