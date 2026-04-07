"use client";
import React, { useState, useEffect } from "react";
import { Sparkles, BrainCircuit, Code2, Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";

type ExplainMode = "beginner" | "developer" | "pseudocode";

export function ExplanationPanel({ repo, path, content }: { repo: string, path: string | null, content: string }) {
  const [mode, setMode] = useState<ExplainMode>("beginner");
  
  // Cache to store explanations for a file path
  const [cache, setCache] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  
  const currentExplanation = path && cache[path] ? cache[path][mode] : "";

  const handleExplain = async () => {
    if (!path || !content) return;
    if (cache[path]) return; // already loaded

    setLoading(true);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo, path, content })
      });
      if (!res.ok) throw new Error("Explanation API failed");
      const data = await res.json();
      setCache(prev => ({ ...prev, [path]: data }));
    } catch (e) {
      setCache(prev => ({ ...prev, [path]: { 
         beginner: "Failed to load beginner expl.", 
         developer: "Failed to load dev expl.", 
         pseudocode: "Failed to load pseudocode." 
      }}));
    } finally {
      setLoading(false);
    }
  };

  const modes = [
    { id: "beginner", icon: Sparkles, label: "Beginner" },
    { id: "developer", icon: BrainCircuit, label: "Developer" },
    { id: "pseudocode", icon: Code2, label: "Pseudocode" }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--panel-border)] bg-[var(--panel)]">
        <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg">
          {modes.map(m => {
             const Icon = m.icon;
             const isSelected = mode === m.id;
             return (
               <button
                 key={m.id}
                 onClick={() => setMode(m.id as ExplainMode)}
                 className={cn(
                   "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                   isSelected ? "bg-[var(--panel)] text-white shadow-sm ring-1 ring-[var(--panel-border)]" : "text-zinc-400 hover:text-zinc-200"
                 )}
               >
                 <Icon className="w-3.5 h-3.5" />
                 {m.label}
               </button>
             )
          })}
        </div>
        
        <button 
           onClick={handleExplain}
           disabled={!path || loading || !!cache[path!]}
           className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors rounded-lg text-white font-medium text-xs"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {cache[path!] ? "Explained" : "Explain File"}
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 p-4 overflow-y-auto">
        {!path ? (
          <div className="h-full flex items-center justify-center text-zinc-500 text-sm italic">
            Select a file first
          </div>
        ) : loading ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-3">
             <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
             <span className="text-sm">AI is thinking...</span>
             <div className="flex gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500/20 animate-pulse"></div>
                 <div className="w-2 h-2 rounded-full bg-blue-500/40 animate-pulse delay-75"></div>
                 <div className="w-2 h-2 rounded-full bg-blue-500/60 animate-pulse delay-150"></div>
             </div>
          </div>
        ) : currentExplanation ? (
          <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-[var(--panel-border)]">
             {/* If we render markdown, we can just use dangerouslySetInnerHTML or a markdown component, for now a simple pre-wrap div */}
             <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-300 font-sans">
               {currentExplanation}
             </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-2">
            <Sparkles className="w-8 h-8 text-zinc-700" />
            <p className="text-sm">Click "Explain File" to analyze this code.</p>
          </div>
        )}
      </div>
    </div>
  );
}
