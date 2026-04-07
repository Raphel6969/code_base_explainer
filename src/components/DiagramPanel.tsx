import React, { useState, useEffect, useRef } from "react";
import mermaid from "mermaid";
import { Loader2, Play, GitBranch, Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function DiagramPanel({ repo, path, content }: { repo: string, path: string | null, content: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [cache, setCache] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const isFullscreen = searchParams?.get("diagram") === "fullscreen";
  const setIsFullscreen = (active: boolean) => {
    if (!searchParams) return;
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (active) {
      current.set("diagram", "fullscreen");
    } else {
      current.delete("diagram");
    }
    router.push(`${pathname}?${current.toString()}`);
  };

  const currentDiagram = path ? cache[path] : "";

  useEffect(() => {
    mermaid.initialize({ 
       startOnLoad: false, 
       theme: 'dark',
       fontFamily: 'arial, sans-serif',
       securityLevel: 'loose'
    });
  }, []);

  const handleGenerate = async () => {
    if (!path || !content) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/diagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo, path, content })
      });
      if (!res.ok) throw new Error("API Failed");
      const data = await res.json();
      setCache(prev => ({ ...prev, [path]: data.diagram }));
    } catch (e) {
      setCache(prev => ({ ...prev, [path]: "graph TD\n  A[Error generating diagram]" }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentDiagram && containerRef.current) {
      containerRef.current.innerHTML = '';
      mermaid.render(`mermaid-${Date.now()}`, currentDiagram).then(res => {
         if (containerRef.current) {
            containerRef.current.innerHTML = res.svg;
            const svg = containerRef.current.querySelector('svg');
            if (svg) {
              svg.style.maxWidth = 'none';
              svg.style.height = 'auto';
            }
         }
      }).catch(err => {
         if (containerRef.current) {
            containerRef.current.innerHTML = `<p class="text-red-400 text-sm">Failed to render diagram</p>`;
         }
      });
    }
  }, [currentDiagram]);

  return (
    <div className={cn("flex flex-col bg-[var(--panel)]", isFullscreen ? "fixed inset-0 z-50 h-screen w-screen" : "h-full")}>
      <div className="h-10 border-b border-[var(--panel-border)] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2 text-zinc-400 font-medium text-xs">
          <GitBranch className="w-4 h-4 text-emerald-500" />
          Logic Flow
        </div>
        <div className="flex items-center gap-3">
           {currentDiagram && (
             <div className="flex items-center gap-1 border-r border-[var(--panel-border)] pr-3 mr-1 text-zinc-400">
               <button onClick={() => setZoom(prev => Math.max(0.2, prev - 0.2))} className="hover:text-white p-1 rounded-md hover:bg-white/10" title="Zoom Out">
                 <ZoomOut className="w-3.5 h-3.5" />
               </button>
               <span className="text-[10px] w-8 text-center font-mono">{Math.round(zoom * 100)}%</span>
               <button onClick={() => setZoom(prev => Math.min(3, prev + 0.2))} className="hover:text-white p-1 rounded-md hover:bg-white/10" title="Zoom In">
                 <ZoomIn className="w-3.5 h-3.5" />
               </button>
               <button onClick={() => setIsFullscreen(!isFullscreen)} className="hover:text-white p-1 ml-1 rounded-md hover:bg-white/10" title="Toggle Fullscreen">
                 {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
               </button>
             </div>
           )}
           <button 
              onClick={handleGenerate}
              disabled={!path || loading || !!currentDiagram}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-500/30 rounded disabled:opacity-50 transition-colors text-xs font-medium cursor-pointer"
           >
             {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
             {currentDiagram ? "Generated" : "Generate"}
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative bg-[#0d1117] code-viewer-scroll">
        {loading ? (
           <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-emerald-500/60 p-4">
             <Loader2 className="w-6 h-6 animate-spin" />
             <span className="text-xs font-mono">Mapping logic...</span>
           </div>
        ) : currentDiagram ? (
           <div className="inline-block p-10 min-h-full min-w-full">
             <div 
               ref={containerRef} 
               style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }} 
               className="mermaid-chart transition-transform duration-200 inline-block" 
             />
           </div>
        ) : (
           <div className="text-center text-zinc-600 flex flex-col items-center justify-center h-full p-4">
             <GitBranch className="w-10 h-10 mb-2 opacity-50" />
             <p className="text-xs max-w-[200px]">Generate a flowchart to see how this code functions structurally.</p>
           </div>
        )}
      </div>
    </div>
  );
}
