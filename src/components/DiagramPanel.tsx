import React, { useState, useEffect, useRef } from "react";
import mermaid from "mermaid";
import { Loader2, Play, GitBranch, Maximize2, Minimize2, ZoomIn, ZoomOut, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function DiagramPanel({ repo, path, content }: { repo: string, path: string | null, content: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [cache, setCache] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [diagramError, setDiagramError] = useState<{path: string, message: string} | null>(null);
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
    setDiagramError(null);
  }, [path]);

  useEffect(() => {
    mermaid.initialize({ 
       startOnLoad: false, 
       theme: 'dark',
       fontFamily: 'arial, sans-serif',
       securityLevel: 'loose',
       suppressErrorRendering: true
    });
  }, []);

  const handleGenerate = async () => {
    if (!path || !content) return;
    if (cache[path]) return;
    
    setLoading(true);
    setDiagramError(null);
    try {
      const res = await fetch("/api/ai/diagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo, path, content })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "API Failed");
      setCache(prev => ({ ...prev, [path]: data.diagram }));
    } catch (e) {
      setDiagramError({ 
         path, 
         message: "The Gemini model returned an error or was temporarily overloaded. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentDiagram || !containerRef.current) return;
    
    let isMounted = true;
    
    const renderMap = async () => {
      try {
        containerRef.current!.innerHTML = '';
        const { svg } = await mermaid.render(`mermaid-${Date.now()}`, currentDiagram);
        
        if (isMounted && containerRef.current) {
           containerRef.current.innerHTML = svg;
           const targetSvg = containerRef.current.querySelector('svg');
           if (targetSvg) {
             targetSvg.style.maxWidth = 'none';
             targetSvg.style.height = 'auto';
           }
        }
      } catch (err) {
         console.error("Mermaid syntax error handled locally:", err);
         if (isMounted) {
            if (containerRef.current) containerRef.current.innerHTML = '';
            if (path) {
               setDiagramError({ 
                  path, 
                  message: "The AI generated an invalid flowchart structure containing syntax errors. Please click Retry." 
               });
               setCache(prev => {
                  const newCache = { ...prev };
                  delete newCache[path];
                  return newCache;
               });
            }
         }
      }
    };
    
    renderMap();
    return () => { isMounted = false; };
  }, [currentDiagram, path]);

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
               <button onClick={() => setZoom(prev => Math.max(0.2, prev - 0.25))} className="hover:text-white p-1 rounded-md hover:bg-white/10" title="Zoom Out">
                 <ZoomOut className="w-3.5 h-3.5" />
               </button>
               <span className="text-[10px] w-8 text-center font-mono">{Math.round(zoom * 100)}%</span>
               <button onClick={() => setZoom(prev => Math.min(10, prev + 0.25))} className="hover:text-white p-1 rounded-md hover:bg-white/10" title="Zoom In">
                 <ZoomIn className="w-3.5 h-3.5" />
               </button>
               <button onClick={() => setIsFullscreen(!isFullscreen)} className="hover:text-white p-1 ml-1 rounded-md hover:bg-white/10" title="Toggle Fullscreen">
                 {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
               </button>
             </div>
           )}
           <button 
              suppressHydrationWarning
              onClick={handleGenerate}
              disabled={!path || loading || !!currentDiagram}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 ring-1 rounded disabled:opacity-50 transition-colors text-xs font-medium cursor-pointer",
                (diagramError?.path === path) 
                  ? "bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 ring-rose-500/30" 
                  : "bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 ring-emerald-500/30"
              )}
           >
             {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
             {currentDiagram ? "Generated" : (diagramError?.path === path) ? "Retry Map" : "Generate"}
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative bg-[#0d1117] code-viewer-scroll">
        {loading ? (
           <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-emerald-500/60 p-4">
             <Loader2 className="w-6 h-6 animate-spin" />
             <span className="text-xs font-mono">Mapping logic...</span>
           </div>
        ) : (diagramError?.path === path) ? (
           <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-rose-400/80 p-4">
             <AlertCircle className="w-8 h-8 mb-1" />
             <span className="text-sm font-medium">Generation Failed</span>
             <p className="text-xs max-w-[240px] text-center text-rose-400/60 leading-relaxed">
                {diagramError.message}
             </p>
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
