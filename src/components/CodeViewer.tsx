"use client";
import React from "react";
import { Highlight, themes } from "prism-react-renderer";

export function CodeViewer({ content, path }: { content: string, path: string }) {
  const getLanguage = (p: string) => {
    const ext = p.split('.').pop()?.toLowerCase() || "";
    switch(ext) {
       case "js": case "jsx": return "javascript";
       case "ts": case "tsx": return "typescript";
       case "css": return "css";
       case "py": return "python";
       case "json": return "json";
       case "md": return "markdown";
       case "html": return "html";
       case "go": return "go";
       case "rs": return "rust";
       default: return "typescript";
    }
  };

  const codeLang = getLanguage(path);

  return (
    <div className="w-full bg-[#0d1117] p-4 text-sm font-mono overflow-auto h-full">
      <Highlight theme={themes.vsDark} code={content || ""} language={codeLang as any}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`${className} bg-transparent m-0`} style={style}>
            {tokens.map((line, i) => {
              const { key: lineKey, ...lineProps } = getLineProps({ line, key: i });
              return (
                <div key={lineKey as React.Key} {...lineProps} className="table-row">
                  <span className="table-cell text-right pr-4 text-zinc-600 select-none w-10">
                    {i + 1}
                  </span>
                  <span className="table-cell">
                    {line.map((token, key) => {
                      const { key: tokenKey, ...tokenProps } = getTokenProps({ token, key });
                      return <span key={tokenKey as React.Key} {...tokenProps} />;
                    })}
                  </span>
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
