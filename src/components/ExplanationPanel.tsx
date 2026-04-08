"use client";
import React, { useState, useEffect } from "react";
import { Sparkles, BrainCircuit, Code2, Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

type ExplainMode = "beginner" | "developer" | "pseudocode";

export function ExplanationPanel({ repo, path, content }: { repo: string, path: string | null, content: string }) {
  const [mode, setMode] = useState<ExplainMode>("beginner");
  
  // Cache to store explanations for a file path
  const [cache, setCache] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [errorPath, setErrorPath] = useState<string | null>(null);

  useEffect(() => {
    setErrorPath(null);
  }, [path]);
  
  const currentExplanation = path && cache[path] ? cache[path][mode] : "";

  const handleExplain = async () => {
    if (!path || !content) return;
    if (cache[path]) return; // already loaded

    setLoading(true);
    setErrorPath(null);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo, path, content })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Explanation API failed");
      setCache(prev => ({ ...prev, [path]: data }));
    } catch (e) {
      setErrorPath(path);
      // Removed the pseudo-cache saving to allow retrying!
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
           suppressHydrationWarning
           onClick={handleExplain}
           disabled={!path || loading || !!cache[path!]}
           className={cn(
             "flex items-center gap-2 px-4 py-1.5 transition-colors rounded-lg text-white font-medium shadow-sm active:scale-95 disabled:pointer-events-none disabled:active:scale-100",
             (errorPath && errorPath === path) 
               ? "bg-rose-600 hover:bg-rose-500 disabled:bg-rose-600/50" 
               : "bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-500"
           )}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {cache[path!] ? "Explained" : (errorPath && errorPath === path) ? "Retry Explain" : "Explain File"}
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
        ) : (errorPath && errorPath === path) ? (
          <div className="h-full flex flex-col items-center justify-center text-rose-400 gap-2">
            <Sparkles className="w-8 h-8 text-rose-500/50 mb-2" />
            <p className="text-sm font-medium">Google AI Servers Overloaded</p>
            <p className="text-xs text-rose-400/80 max-w-[250px] text-center">
              The Gemini model rejected the request due to high traffic volume. Please wait 10 seconds and click Retry.
            </p>
          </div>
        ) : currentExplanation ? (
          <div className="prose prose-invert prose-sm min-w-0 w-full max-w-none overflow-x-auto prose-p:leading-relaxed prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-[var(--panel-border)] prose-pre:overflow-x-auto prose-pre:max-w-full prose-pre:whitespace-pre prose-code:break-normal prose-p:last:mb-0">
             <ReactMarkdown>{currentExplanation}</ReactMarkdown>
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
