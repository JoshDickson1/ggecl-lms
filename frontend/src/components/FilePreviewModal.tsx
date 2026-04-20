// src/components/FilePreviewModal.tsx
// Reusable file preview modal — supports images, PDFs, and generic files.
// Multiple files become a slider with thumbnail strip.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { FILE_META, getFileType } from "@/data/academicData";

export interface PreviewFile {
  name: string;
  url: string;
  size?: string;
  mimeType?: string;
}

function isImage(name: string) { return /\.(jpe?g|png|gif|webp|svg|bmp|ico)$/i.test(name); }
function isPDF(name: string, mime?: string) { return /\.pdf$/i.test(name) || mime === "application/pdf"; }

export function FilePreviewModal({
  files,
  initialIndex = 0,
  onClose,
}: {
  files: PreviewFile[];
  initialIndex?: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(initialIndex);
  const file = files[idx];
  const meta = FILE_META[getFileType(file?.name)];
  const showImage = isImage(file?.name ?? "");
  const showPDF   = isPDF(file?.name ?? "", file?.mimeType);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")  setIdx(i => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setIdx(i => Math.min(files.length - 1, i + 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [files.length, onClose]);

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-4xl flex flex-col rounded-[24px]
          bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07]
          shadow-[0_32px_80px_rgba(0,0,0,0.4)] z-10 overflow-hidden"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5
          border-b border-gray-100 dark:border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl leading-none flex-shrink-0">{meta?.icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{file.name}</p>
              <p className="text-[11px] text-gray-400">
                {file.size && <span>{file.size}</span>}
                {file.size && files.length > 1 && <span className="mx-1.5">·</span>}
                {files.length > 1 && <span>{idx + 1} of {files.length}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <a href={file.url} target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400
                hover:border-blue-300 hover:text-blue-600 transition-all">
              <ExternalLink className="w-3.5 h-3.5" /> Open
            </a>
            <a href={file.url} download={file.name}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                bg-blue-600 hover:bg-blue-500 text-white transition-all">
              <Download className="w-3.5 h-3.5" /> Download
            </a>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
              <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 relative overflow-hidden" style={{ minHeight: "360px", maxHeight: "calc(90vh - 160px)" }}>
          <AnimatePresence mode="wait">
            <motion.div key={idx}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full flex items-center justify-center"
              style={{ minHeight: "360px" }}
            >
              {showImage ? (
                <img src={file.url} alt={file.name}
                  className="max-w-full max-h-full object-contain p-4" />
              ) : showPDF ? (
                <iframe src={file.url} title={file.name}
                  className="w-full border-0"
                  style={{ height: "calc(90vh - 160px)" }} />
              ) : (
                <div className="flex flex-col items-center gap-4 py-16 px-8 text-center">
                  <div className={`w-20 h-20 rounded-2xl ${meta?.bg} flex items-center justify-center`}>
                    <span className="text-5xl leading-none">{meta?.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{file.name}</p>
                    <p className="text-xs text-gray-400">Preview not available for this file type</p>
                    {file.size && <p className="text-xs text-gray-400 mt-0.5">{file.size}</p>}
                  </div>
                  <div className="flex gap-3 mt-2">
                    <a href={file.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                        border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400
                        hover:border-blue-300 hover:text-blue-600 transition-all">
                      <ExternalLink className="w-4 h-4" /> Open in new tab
                    </a>
                    <a href={file.url} download={file.name}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
                        bg-blue-600 hover:bg-blue-500 text-white transition-all">
                      <Download className="w-4 h-4" /> Download
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next arrows */}
          {files.length > 1 && (
            <>
              <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl
                  bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-white/[0.08]
                  flex items-center justify-center shadow-sm disabled:opacity-30 hover:border-blue-300
                  transition-all z-10">
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button onClick={() => setIdx(i => Math.min(files.length - 1, i + 1))} disabled={idx === files.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl
                  bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-white/[0.08]
                  flex items-center justify-center shadow-sm disabled:opacity-30 hover:border-blue-300
                  transition-all z-10">
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip (only when multiple files) */}
        {files.length > 1 && (
          <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 dark:border-white/[0.06] overflow-x-auto flex-shrink-0">
            {files.map((f, i) => {
              const m = FILE_META[getFileType(f.name)];
              const img = isImage(f.name);
              return (
                <button key={i} onClick={() => setIdx(i)}
                  className={`flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                    i === idx
                      ? "border-blue-500 scale-110 shadow"
                      : "border-gray-200 dark:border-white/[0.08] opacity-60 hover:opacity-100"
                  }`}>
                  {img
                    ? <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                    : <div className={`w-full h-full flex items-center justify-center text-xl ${m?.bg}`}>{m?.icon}</div>
                  }
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
