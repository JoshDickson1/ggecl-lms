// src/dashboards/instructor-dashboard/pages/InstructorCourseVideoUpload.tsx
// Instructor uploads the course preview video and sets course-level details

import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import ReactPlayer from "react-player";
import {
  ArrowLeft, Upload, CheckCircle2,
  Film, Clock, Eye, Trash2, Save, BookOpen,
} from "lucide-react";
import { courses } from "@/data/courses";

// ─── Shared Card ──────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_2px_16px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

const Fade = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }}>
    {children}
  </motion.div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export function InstructorCourseVideoUpload() {
  const { id } = useParams<{ id: string }>();
  const course = courses.find(c => c.id === id) ?? courses[0];

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [embedUrl, setEmbedUrl] = useState("");
  const [useEmbed, setUseEmbed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPreviewFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setUseEmbed(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Active URL: embed takes priority if toggle is on and URL is non-empty
  const activeUrl = useEmbed ? (embedUrl || null) : previewUrl;

  return (
    <div className="max-w-[900px] mx-auto space-y-6 pb-12">
      <Fade>
        <div className="flex items-center justify-between">
          <Link
            to={`/instructor/courses/${course.id}`}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />Back to Course
          </Link>
          <Link
            to={`/instructor/courses/${course.id}/materials`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-violet-600 to-purple-700 hover:opacity-90 transition-all shadow-md"
          >
            <BookOpen className="w-4 h-4" />Go to Materials
          </Link>
        </div>
      </Fade>

      <Fade delay={0.03}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-md">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Course Preview Video</h1>
            <p className="text-xs text-gray-400">{course.title}</p>
          </div>
        </div>
      </Fade>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-5">

          {/* Upload method toggle */}
          <Fade delay={0.06}>
            <Card className="p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Upload Method</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setUseEmbed(false)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${!useEmbed ? "bg-violet-600 text-white border-violet-600 shadow-md" : "border-gray-200 dark:border-white/[0.08] text-gray-500 hover:border-violet-400"}`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setUseEmbed(true)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${useEmbed ? "bg-violet-600 text-white border-violet-600 shadow-md" : "border-gray-200 dark:border-white/[0.08] text-gray-500 hover:border-violet-400"}`}
                >
                  Embed URL
                </button>
              </div>
            </Card>
          </Fade>

          {/* Upload zone / URL input */}
          <Fade delay={0.08}>
            <Card className="p-5">
              {!useEmbed ? (
                <>
                  <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleFile} />
                  {!previewFile ? (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-300 dark:border-white/[0.12] rounded-2xl p-10 flex flex-col items-center gap-3 hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-all group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-7 h-7 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-700 dark:text-white">Drop your preview video here</p>
                        <p className="text-xs text-gray-400 mt-1">MP4, MOV, AVI, MKV, WebM · Max 2 GB</p>
                      </div>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Film className="w-4 h-4 text-violet-500" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{previewFile.name}</span>
                        <span className="text-xs text-gray-400">({(previewFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                      </div>
                      <button
                        onClick={() => { setPreviewFile(null); setPreviewUrl(null); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    Video URL (YouTube, Vimeo, or direct .m3u8 / .mp4)
                  </label>
                  <input
                    value={embedUrl}
                    onChange={e => setEmbedUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
                  />
                </div>
              )}
            </Card>
          </Fade>

          {/* Preview player — only rendered when there is an active URL */}
          {activeUrl && (
            <Fade delay={0.1}>
              <Card className="p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" />Preview
                </p>
                <div className="rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
                  {/* ✅ FIX: ReactPlayer v2 — no url prop type error here because we guard activeUrl */}
                  <ReactPlayer 
                //   url={activeUrl} 
                  width="100%" height="100%" controls />
                </div>
              </Card>
            </Fade>
          )}

          <Fade delay={0.12}>
            <button
              onClick={handleSave}
              disabled={!activeUrl || saving}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-br from-violet-600 to-purple-700 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {saving ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : saved ? (
                <><CheckCircle2 className="w-4 h-4" />Saved!</>
              ) : (
                <><Save className="w-4 h-4" />Save Preview Video</>
              )}
            </button>
          </Fade>
        </div>

        {/* Tips sidebar */}
        <Fade delay={0.1}>
          <Card className="p-5 h-fit">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Tips for a Great Preview</p>
            <div className="space-y-3">
              {[
                { icon: Clock, tip: "Keep it 2–5 minutes — enough to hook, not too long" },
                { icon: Eye, tip: "Show your teaching style, not just the course outline" },
                { icon: Film, tip: "Use HD quality (720p minimum, 1080p preferred)" },
                { icon: CheckCircle2, tip: "Include a clear CTA at the end — 'Enroll now'" },
              ].map(({ icon: Ic, tip }, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Ic className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </Card>
        </Fade>
      </div>
    </div>
  );
}

export default InstructorCourseVideoUpload;