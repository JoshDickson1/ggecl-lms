import { useState, useEffect } from "react";
// import { Save } from "lucide-react";

export interface StudentNotesProps {
  sessionId: string;
}

export function StudentNotes({ sessionId }: StudentNotesProps) {
  const key = `notes:session:${sessionId}`;
  const [notes, setNotes] = useState(() => localStorage.getItem(key) ?? "");
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    setSaved(false);
    const t = setTimeout(() => {
      localStorage.setItem(key, notes);
      setSaved(true);
    }, 800);
    return () => clearTimeout(t);
  }, [notes]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/[0.07]">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">My notes</h3>
        <span className={`text-xs transition-colors ${saved ? "text-green-500" : "text-gray-400"}`}>
          {saved ? "Saved" : "Saving…"}
        </span>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Take notes during class…"
        className="flex-1 resize-none p-4 text-sm text-gray-900 dark:text-white bg-transparent placeholder-gray-400 outline-none leading-relaxed"
      />
    </div>
  );
}