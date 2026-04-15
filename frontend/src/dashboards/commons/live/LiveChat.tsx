// src/shared/live/LiveChat.tsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile } from "lucide-react";
import type { LiveChatMessage } from "@/data/liveTypes";

const MY_ID = "me";
const QUICK_REACTIONS = ["👍", "🔥", "💡", "❓", "👏"];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Bubble({ msg, onReact }: { msg: LiveChatMessage; onReact: (id: string, emoji: string) => void }) {
  const isMe = msg.senderId === MY_ID;
  const [showPicker, setShowPicker] = useState(false);
  const initials = msg.senderName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2.5 px-4 py-1.5 group ${isMe ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      {!isMe && (
        <div className={`w-7 h-7 rounded-full ${msg.senderAvatarBg} flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 mt-1`}>
          {initials}
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[75%] ${isMe ? "items-end" : ""}`}>
        {/* Name + time */}
        {!isMe && (
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-black ${
              msg.senderRole === "instructor" ? "text-violet-400" :
              msg.senderRole === "admin" ? "text-amber-400" : "text-white/40"
            }`}>{msg.senderName}</span>
            <span className="text-[9px] text-white/20">{formatTime(msg.createdAt)}</span>
          </div>
        )}

        {/* Bubble */}
        <div className="relative">
          <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isMe
              ? "bg-blue-600 text-white rounded-tr-sm"
              : "bg-white/[0.07] text-white/80 rounded-tl-sm"
          }`}>
            {msg.text}
          </div>

          {/* Reaction hover */}
          <div className={`absolute ${isMe ? "left-0 -translate-x-full pr-1" : "right-0 translate-x-full pl-1"} top-0 opacity-0 group-hover:opacity-100 transition-opacity`}>
            <button onClick={() => setShowPicker(p => !p)}
              className="p-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] transition-colors">
              <Smile className="w-3.5 h-3.5 text-white/40" />
            </button>
          </div>

          <AnimatePresence>
            {showPicker && (
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`absolute top-8 ${isMe ? "right-0" : "left-0"} z-10 flex gap-1 p-2 rounded-2xl bg-[#0a1120] border border-white/[0.1] shadow-xl`}>
                {QUICK_REACTIONS.map(e => (
                  <button key={e} onClick={() => { onReact(msg.id, e); setShowPicker(false); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/[0.1] text-base transition-colors">
                    {e}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reactions */}
        {msg.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {msg.reactions.map(r => (
              <button key={r.emoji} onClick={() => onReact(msg.id, r.emoji)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all ${
                  r.reactedByMe
                    ? "bg-blue-600/20 border-blue-500/40 text-blue-300"
                    : "bg-white/[0.05] border-white/[0.08] text-white/50 hover:bg-white/[0.09]"
                }`}>
                {r.emoji} <span className="font-bold">{r.count}</span>
              </button>
            ))}
          </div>
        )}

        {isMe && <span className="text-[9px] text-white/20">{formatTime(msg.createdAt)}</span>}
      </div>
    </motion.div>
  );
}

export function LiveChat({
  messages, onSend, onReact,
}: {
  messages: LiveChatMessage[];
  onSend: (text: string) => void;
  onReact: (msgId: string, emoji: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = () => {
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-3">
        {messages.map(msg => (
          <Bubble key={msg.id} msg={msg} onReact={onReact} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] focus-within:border-blue-500/40 transition-colors">
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Message everyone…"
            className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/25 focus:outline-none"
          />
          <button onClick={send} disabled={!draft.trim()}
            className="p-1.5 rounded-lg text-blue-400 hover:text-blue-300 disabled:opacity-30 transition-all">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}