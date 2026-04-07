"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { FileTree } from "@/components/FileTree";
import { CodeViewer } from "@/components/CodeViewer";
import { ExplanationPanel } from "@/components/ExplanationPanel";
import { DiagramPanel } from "@/components/DiagramPanel";
import { ChatPanel } from "@/components/ChatPanel";
import { GitTreeResponse } from "@/lib/github";

function ExplainerLayout() {
  const searchParams = useSearchParams();
  const repo = searchParams?.get("repo") || "";

  const [repoData, setRepoData] = useState<GitTreeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [loadingFile, setLoadingFile] = useState(false);

  useEffect(() => {
    if (!repo) return;
    
    // Fetch Repo Tree
    async function initTree() {
      try {
        setLoading(true);
        const res = await fetch(`/api/github/tree?repo=${encodeURIComponent(repo)}`);
        if (!res.ok) throw new Error("Repository not found or API limits reached");
        const data = await res.json();
        setRepoData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    initTree();
  }, [repo]);

  // Load file content when a file is selected
  useEffect(() => {
    if (!selectedFile || !repo) return;
    
    async function loadFile() {
      try {
        setLoadingFile(true);
        setFileContent("");
        const res = await fetch(`/api/github/file?repo=${encodeURIComponent(repo)}&path=${encodeURIComponent(selectedFile as string)}`);
        if (!res.ok) throw new Error("Failed to fetch file content");
        const content = await res.text();
        setFileContent(content);
      } catch (err: any) {
        setFileContent(`// Error loading file:\n// ${err.message}`);
      } finally {
        setLoadingFile(false);
      }
    }
    loadFile();
  }, [selectedFile, repo]);


  if (!repo) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--background)]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No repository provided</h2>
        <Link href="/" className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500">Go Back</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--background)] overflow-hidden">
      {/* Top Navbar */}
      <header className="h-14 border-b border-[var(--panel-border)] bg-[var(--panel)] flex items-center px-4 shrink-0">
        <Link href="/" className="flex items-center text-zinc-400 hover:text-white transition-colors mr-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-sm">Back</span>
        </Link>
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="text-zinc-500">Repository</span>
          <span className="text-zinc-600">/</span>
          <span className="font-semibold text-zinc-100">{repo}</span>
          {loading && <Loader2 className="w-4 h-4 ml-2 animate-spin text-blue-500" />}
        </div>
      </header>

      {/* Main 3-Column Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Column 1: File Tree (Left pane) */}
        <div className="w-72 border-r border-[var(--panel-border)] flex flex-col bg-[var(--panel)] overflow-hidden shrink-0">
          <div className="p-3 border-b border-[var(--panel-border)] shrink-0">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Explorer</h3>
          </div>
          <div className="flex-1 overflow-y-auto w-full">
             {error ? (
               <div className="p-4 text-sm text-red-400">{error}</div>
             ) : (
               <FileTree tree={repoData?.tree} selectedFile={selectedFile} onSelect={setSelectedFile} />
             )}
          </div>
        </div>

        {/* Column 2: Code & Explanation (Center pane) */}
        <div className="flex-1 border-r border-[var(--panel-border)] flex flex-col overflow-hidden bg-[var(--background)]">
          {/* File Tab */}
          <div className="h-10 border-b border-[var(--panel-border)] flex items-center bg-[var(--panel)] shrink-0 px-2 overflow-x-auto">
             {selectedFile ? (
               <div className="px-3 py-1.5 bg-[var(--background)] border border-[var(--panel-border)] border-b-transparent rounded-t-md text-sm font-mono text-blue-400 flex items-center gap-2">
                 <span>{selectedFile.split("/").pop()}</span>
                 {loadingFile && <Loader2 className="w-3 h-3 animate-spin text-zinc-500" />}
               </div>
             ) : (
               <span className="text-xs text-zinc-500 italic px-3">No file selected</span>
             )}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {selectedFile ? (
               <CodeViewer content={fileContent} path={selectedFile} />
            ) : (
               <div className="h-full flex items-center justify-center text-zinc-600 bg-[var(--background)]">
                  Select a file from the explorer to view its contents
               </div>
            )}
          </div>
          
          {/* Explanation Panel (Bottom of Center Pane) */}
          <div className="h-2/5 border-t border-[var(--panel-border)] bg-[var(--panel)] flex flex-col">
             <ExplanationPanel repo={repo} path={selectedFile} content={fileContent} />
          </div>
        </div>

        {/* Column 3: Diagrams & Chat (Right pane) */}
        <div className="w-[400px] flex flex-col bg-[var(--panel)] overflow-hidden shrink-0 hidden lg:flex">
          <div className="flex-1 border-b border-[var(--panel-border)] flex flex-col overflow-hidden">
            <DiagramPanel repo={repo} path={selectedFile} content={fileContent} />
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatPanel repo={repo} path={selectedFile} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-[var(--background)] text-white">Loading Viewer...</div>}>
      <ExplainerLayout />
    </Suspense>
  );
}
