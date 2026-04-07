import React, { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, File, FileCode, Folder, FolderOpen } from "lucide-react";
import { GitNode } from "@/lib/github";
import { cn } from "@/lib/utils";

interface TreeNode {
  name: string;
  path: string;
  type: "blob" | "tree";
  children: Record<string, TreeNode>;
}

export function FileTree({ tree, selectedFile, onSelect }: { tree?: GitNode[], selectedFile: string | null, onSelect: (path: string) => void }) {
  const fileStructure = useMemo(() => {
    if (!tree) return null;
    const root: TreeNode = { name: "root", path: "", type: "tree", children: {} };

    tree.forEach((node) => {
      const parts = node.path.split("/");
      let current = root;

      parts.forEach((part, index) => {
        if (!current.children[part]) {
          const isLast = index === parts.length - 1;
          current.children[part] = {
            name: part,
            path: parts.slice(0, index + 1).join("/"),
            type: isLast ? node.type : "tree",
            children: {},
          };
        }
        current = current.children[part];
      });
    });

    return root;
  }, [tree]);

  if (!fileStructure) {
    return <div className="p-4 text-zinc-500 text-sm">No files found.</div>;
  }

  return (
    <div className="py-2">
      <TreeLevel nodes={Object.values(fileStructure.children)} selectedFile={selectedFile} onSelect={onSelect} level={0} />
    </div>
  );
}

function TreeLevel({ nodes, selectedFile, onSelect, level }: { nodes: TreeNode[], selectedFile: string | null, onSelect: (path: string) => void, level: number }) {
  // Sort: Folders first, then alphabetically
  const sortedNodes = [...nodes].sort((a, b) => {
    if (a.type !== b.type) return a.type === "tree" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex flex-col w-full">
      {sortedNodes.map((node) => (
        <TreeNodeItem key={node.path} node={node} selectedFile={selectedFile} onSelect={onSelect} level={level} />
      ))}
    </div>
  );
}

function TreeNodeItem({ node, selectedFile, onSelect, level }: { node: TreeNode, selectedFile: string | null, onSelect: (path: string) => void, level: number }) {
  const [isOpen, setIsOpen] = useState(level < 1); // open root folders by default
  const isSelected = selectedFile === node.path;
  const hasChildren = Object.keys(node.children).length > 0;

  const handleClick = () => {
    if (node.type === "tree") {
      setIsOpen(!isOpen);
    } else {
      onSelect(node.path);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center text-sm py-1 px-2 cursor-pointer hover:bg-[var(--panel-border)] transition-colors select-none",
          isSelected && "bg-blue-500/10 text-blue-400 font-medium"
        )}
        style={{ paddingLeft: `${ level * 12 + 8}px` }}
        onClick={handleClick}
      >
        <div className="w-4 h-4 mr-1.5 flex items-center justify-center shrink-0">
          {node.type === "tree" ? (
             isOpen ? <ChevronDown className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          ) : null}
        </div>
        
        <div className="w-4 h-4 mr-2 flex items-center justify-center shrink-0">
          {node.type === "tree" ? (
            isOpen ? <FolderOpen className="w-4 h-4 text-blue-400" /> : <Folder className="w-4 h-4 text-zinc-400" />
          ) : (
            <FileCode className={cn("w-4 h-4", isSelected ? "text-blue-400" : "text-zinc-500")} />
          )}
        </div>
        
        <span className={cn("truncate", node.type === "tree" ? "text-zinc-300" : (isSelected ? "text-blue-400" : "text-zinc-400"))}>
          {node.name}
        </span>
      </div>
      
      {node.type === "tree" && isOpen && hasChildren && (
        <TreeLevel nodes={Object.values(node.children)} selectedFile={selectedFile} onSelect={onSelect} level={level + 1} />
      )}
    </div>
  );
}
