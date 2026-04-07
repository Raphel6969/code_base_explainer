"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Code2, Sparkles, GitBranch, TerminalSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl) {
      let repoPath = repoUrl;
      try {
        if (repoUrl.includes("github.com/")) {
          // It's a full URL, attempt to parse
          const urlObj = new URL(repoUrl.startsWith("http") ? repoUrl : `https://${repoUrl}`);
          const parts = urlObj.pathname.split("/").filter(Boolean);
          if (parts.length >= 2) {
            let name = parts[1];
            if (name.endsWith(".git")) {
              name = name.slice(0, -4);
            }
            repoPath = `${parts[0]}/${name}`;
          }
        } else if (repoPath.endsWith(".git")) {
          repoPath = repoPath.slice(0, -4);
        }
      } catch (err) {
        // Fallback to whatever was entered
      }
      
      router.push(`/explain?repo=${encodeURIComponent(repoPath)}`);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 bg-[var(--background)]">
      <div className="max-w-4xl w-full mx-auto flex flex-col items-center">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl mb-6 ring-1 ring-blue-500/20">
            <Code2 className="w-10 h-10 text-blue-500" />
            <span className="mx-3 text-2xl font-semibold tracking-tight text-white/50">×</span>
            <Sparkles className="w-10 h-10 text-violet-500" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Understand any codebase.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">
              In seconds.
            </span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Paste a GitHub repository URL below. Our AI analyzes the structure, builds logic diagrams, and visually explains the code line-by-line so you can learn 10x faster.
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-2xl"
        >
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative flex items-center bg-[var(--panel)] ring-1 ring-[var(--panel-border)] shadow-2xl rounded-2xl p-2 h-16">
              <Search className="w-6 h-6 text-zinc-400 ml-4 hidden sm:block" />
              <input
                type="text"
                placeholder="https://github.com/facebook/react"
                className="flex-1 bg-transparent border-none text-white text-lg px-4 focus:outline-none placeholder:text-zinc-600"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
              />
              <button
                type="submit"
                className="h-full px-8 bg-blue-600 hover:bg-blue-500 transition-colors rounded-xl text-white font-medium flex items-center gap-2"
              >
                Analyze
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full max-w-4xl"
        >
          <div className="p-6 rounded-2xl bg-[var(--panel)] ring-1 ring-[var(--panel-border)] flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-white font-semibold mb-2">ELI5 Explanations</h3>
            <p className="text-zinc-400 text-sm">Switch between Beginner & Developer modes to understand code context fluently.</p>
          </div>
          <div className="p-6 rounded-2xl bg-[var(--panel)] ring-1 ring-[var(--panel-border)] flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mb-4 text-violet-400">
              <GitBranch className="w-6 h-6" />
            </div>
            <h3 className="text-white font-semibold mb-2">Logic Flowcharts</h3>
            <p className="text-zinc-400 text-sm">Automated visual diagrams showing how functions interact and files import across the repo.</p>
          </div>
          <div className="p-6 rounded-2xl bg-[var(--panel)] ring-1 ring-[var(--panel-border)] flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-400">
              <TerminalSquare className="w-6 h-6" />
            </div>
            <h3 className="text-white font-semibold mb-2">Setup Guides</h3>
            <p className="text-zinc-400 text-sm">AI reviews the root to generate a customized run, build, and debug setup guide.</p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
