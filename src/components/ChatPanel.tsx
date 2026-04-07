"use client";
import React, { useState } from "react";
import { MessageSquare, Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatPanel({ repo, path }: { repo: string, path: string | null }) {
  const [messages, setMessages] = useState<{role: "user" | "ai", text: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !path) return;
    
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo, path, message: userMsg, history: messages })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", text: data.response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "ai", text: "Error connecting to AI." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--panel)]">
      <div className="h-10 border-b border-[var(--panel-border)] flex items-center px-4 shrink-0">
        <div className="flex items-center gap-2 text-zinc-400 font-medium text-xs">
          <MessageSquare className="w-4 h-4 text-accent" />
          Chat with Codebase
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center">
            <Bot className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-xs max-w-[200px]">Ask questions about {path ? "this file" : "the repository"}.</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
              <div className={cn("w-6 h-6 shrink-0 rounded-md flex items-center justify-center", msg.role === "user" ? "bg-blue-600 text-white" : "bg-violet-600 text-white")}>
                {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div className={cn("px-3 py-2 rounded-xl text-sm max-w-[85%]", msg.role === "user" ? "bg-blue-600/20 text-blue-50 rounded-tr-none" : "bg-[var(--panel-border)] text-zinc-300 rounded-tl-none")}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex gap-3">
             <div className="w-6 h-6 shrink-0 rounded-md flex items-center justify-center bg-violet-600 text-white">
                <Bot className="w-3.5 h-3.5" />
             </div>
             <div className="px-3 py-2 rounded-xl text-sm bg-[var(--panel-border)] text-zinc-400 rounded-tl-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce delay-150"></span>
             </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-[var(--panel-border)] shrink-0">
        <form onSubmit={handleSend} className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!path || loading}
            placeholder={path ? "Ask about this file..." : "Select a file to chat..."}
            className="w-full bg-[var(--background)] border border-[var(--panel-border)] rounded-lg pl-3 pr-10 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!path || !input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-accent disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
