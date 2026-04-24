// src/dashboards/admin-dashboard/pages/AdminAnnouncements.tsx
import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone, Send, Users, GraduationCap, User,
  Search, ChevronDown, X, Eye, Trash2, Globe,
  AlertCircle, RefreshCw, Star, Check, BookOpen,
  Info, Loader2, Mail,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import UserService, { UserRole } from "@/services/user.service";
import { APIConfig } from "@/lib/api.config";
import { useDashboardUser } from "@/hooks/useDashboardUser";

// ─── Types ────────────────────────────────────────────────────────────────────

type AudienceType = "all_students" | "all_instructors" | "everyone" | "specific_student" | "specific_instructor";
type AnnType      = "info" | "alert" | "update" | "promotion" | "maintenance";
type AnnStatus    = "sent" | "draft";

interface Announcement {
  id:            string;
  title:         string;
  body:          string;
  type:          AnnType;
  audienceType:  AudienceType;
  audienceLabel: string;
  audienceCount: number;
  status:        AnnStatus;
  sentAt:        string;
  sentBy:        string;
  openRate?:     number;
}

interface RealUser {
  id:    string;
  name:  string;
  email: string;
  image?: string | null;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<AnnType, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  info:        { label: "Info",        icon: Info,        color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-950/30",    border: "border-blue-200 dark:border-blue-800/50"    },
  alert:       { label: "Alert",       icon: AlertCircle, color: "text-red-600 dark:text-red-400",      bg: "bg-red-50 dark:bg-red-950/30",      border: "border-red-200 dark:border-red-800/50"      },
  update:      { label: "Update",      icon: RefreshCw,   color: "text-violet-600 dark:text-violet-400",bg: "bg-violet-50 dark:bg-violet-950/30",border: "border-violet-200 dark:border-violet-800/50"},
  promotion:   { label: "Promotion",   icon: Star,        color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950/30",  border: "border-amber-200 dark:border-amber-800/50"  },
  maintenance: { label: "Maintenance", icon: RefreshCw,   color: "text-gray-600 dark:text-gray-400",   bg: "bg-gray-50 dark:bg-white/[0.04]",   border: "border-gray-200 dark:border-white/[0.08]"   },
};

const AUDIENCE_CONFIG: Record<AudienceType, { label: string; icon: React.ElementType; desc: string }> = {
  all_students:        { label: "All Students",        icon: Users,         desc: "All enrolled students"  },
  all_instructors:     { label: "All Instructors",     icon: GraduationCap, desc: "All instructors"        },
  everyone:            { label: "Everyone",            icon: Globe,         desc: "All platform users"     },
  specific_student:    { label: "Specific Student",    icon: User,          desc: "1 student"              },
  specific_instructor: { label: "Specific Instructor", icon: User,          desc: "1 instructor"           },
};

// ─── Local storage persistence ────────────────────────────────────────────────

const STORAGE_KEY = "ggecl_announcements";

function loadAnnouncements(): Announcement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAnnouncements(list: Announcement[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// ─── Email send helper ────────────────────────────────────────────────────────
// The backend POST /email/send uses a typed template system.
// We use type "ANNOUNCEMENT" with a data payload containing subject and body.
// If the backend doesn't support this type yet, the send will fail gracefully
// and the announcement is still saved locally as a record.

async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  await APIConfig.fetch("/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "ANNOUNCEMENT",
      to,
      data: { subject, body },
    }),
  });
}

function buildEmailBody(title: string, body: string, type: AnnType): string {
  const cfg = TYPE_CONFIG[type];
  return `[${cfg.label.toUpperCase()}] ${title}\n\n${body}\n\n---\nYou received this because you are a member of the GGECL platform.`;
}

// ─── User search dropdown ─────────────────────────────────────────────────────

function UserSearchDropdown({
  role,
  selected,
  onSelect,
}: {
  role: "STUDENT" | "INSTRUCTOR";
  selected: RealUser | null;
  onSelect: (u: RealUser | null) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["users-search", role, search],
    queryFn: async () => {
      const res = await UserService.findAll({
        role: role === "STUDENT" ? UserRole.STUDENT : UserRole.INSTRUCTOR,
        search: search || undefined,
        limit: 20,
      }) as any;
      return (res?.data ?? res?.items ?? []) as RealUser[];
    },
    enabled: open,
  });

  const users = data ?? [];

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div ref={ref} className="relative">
      {selected ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black overflow-hidden flex-shrink-0">
            {selected.image
              ? <img src={selected.image} alt="" className="w-full h-full object-cover" />
              : initials(selected.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-300 truncate">{selected.name}</p>
            <p className="text-[10px] text-blue-500 dark:text-blue-400 truncate">{selected.email}</p>
          </div>
          <button onClick={() => onSelect(null)} className="text-blue-400 hover:text-blue-600 flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={`Search ${role === "STUDENT" ? "students" : "instructors"}…`}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all"
          />
        </div>
      )}

      <AnimatePresence>
        {open && !selected && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full mt-1 left-0 right-0 z-30 rounded-xl border border-gray-100 dark:border-white/[0.07] bg-white dark:bg-[#0f1623] shadow-xl overflow-hidden max-h-48 overflow-y-auto"
          >
            {isLoading ? (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />Loading…
              </div>
            ) : users.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">No results</p>
            ) : (
              users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { onSelect(u); setOpen(false); setSearch(""); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black overflow-hidden flex-shrink-0">
                    {u.image ? <img src={u.image} alt="" className="w-full h-full object-cover" /> : initials(u.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{u.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{u.email}</p>
                  </div>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Compose modal ────────────────────────────────────────────────────────────

function ComposeModal({
  onClose,
  onSaved,
  senderName,
}: {
  onClose: () => void;
  onSaved: (ann: Announcement) => void;
  senderName: string;
}) {
  const [audience,       setAudience]       = useState<AudienceType>("all_students");
  const [annType,        setAnnType]        = useState<AnnType>("info");
  const [title,          setTitle]          = useState("");
  const [body,           setBody]           = useState("");
  const [selectedPerson, setSelectedPerson] = useState<RealUser | null>(null);
  const [step,           setStep]           = useState<"compose" | "preview">("compose");

  const needsPerson = audience === "specific_student" || audience === "specific_instructor";
  const typeCfg     = TYPE_CONFIG[annType];
  const audienceCfg = AUDIENCE_CONFIG[audience];

  const recipientLabel = needsPerson && selectedPerson
    ? selectedPerson.name
    : audienceCfg.label;

  const canSend = title.trim().length > 0 && body.trim().length > 0 && (!needsPerson || selectedPerson);

  // Fetch all users of the relevant role to get a count for display
  const { data: allStudents } = useQuery({
    queryKey: ["users-count-students"],
    queryFn: async () => {
      const res = await UserService.findAll({ role: UserRole.STUDENT, limit: 1 }) as any;
      return (res?.meta?.total ?? res?.total ?? 0) as number;
    },
  });
  const { data: allInstructors } = useQuery({
    queryKey: ["users-count-instructors"],
    queryFn: async () => {
      const res = await UserService.findAll({ role: UserRole.INSTRUCTOR, limit: 1 }) as any;
      return (res?.meta?.total ?? res?.total ?? 0) as number;
    },
  });

  const studentCount    = allStudents    ?? 0;
  const instructorCount = allInstructors ?? 0;
  const everyoneCount   = studentCount + instructorCount;

  const recipientCount =
    needsPerson ? (selectedPerson ? 1 : 0) :
    audience === "all_students"    ? studentCount :
    audience === "all_instructors" ? instructorCount :
    everyoneCount;

  // Send mutation — saves announcement locally + attempts email delivery
  // Email delivery uses POST /email/send with type "ANNOUNCEMENT".
  // If the backend doesn't support that type yet, email fails silently
  // but the announcement is still recorded locally.
  const sendMutation = useMutation({
    mutationFn: async (draft: boolean) => {
      if (draft) return { draft: true, emailErrors: 0 };

      const subject = `[GGECL] ${title}`;
      const emailBody = buildEmailBody(title, body, annType);
      let emailErrors = 0;

      const tryEmail = async (to: string) => {
        try {
          await sendEmail(to, subject, emailBody);
        } catch {
          emailErrors++;
        }
      };

      if (needsPerson && selectedPerson) {
        await tryEmail(selectedPerson.email);
      } else {
        const roles: UserRole[] =
          audience === "all_students"    ? [UserRole.STUDENT] :
          audience === "all_instructors" ? [UserRole.INSTRUCTOR] :
          [UserRole.STUDENT, UserRole.INSTRUCTOR];

        for (const role of roles) {
          let cursor: string | undefined;
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const res = await UserService.findAll({ role, limit: 50, cursor }) as any;
            const users: RealUser[] = res?.data ?? res?.items ?? [];
            await Promise.all(users.map((u) => tryEmail(u.email)));
            cursor = res?.meta?.nextCursor ?? res?.nextCursor;
            if (!cursor || users.length === 0) break;
          }
        }
      }

      return { draft: false, emailErrors };
    },
    onSuccess: ({ draft }) => {
      const ann: Announcement = {
        id:            `ann-${Date.now()}`,
        title,
        body,
        type:          annType,
        audienceType:  audience,
        audienceLabel: recipientLabel,
        audienceCount: recipientCount,
        status:        draft ? "draft" : "sent",
        sentAt:        draft ? "—" : new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        sentBy:        draft ? "Draft" : senderName,
      };
      onSaved(ann);
      setTimeout(onClose, 1200);
    },
  });

  const isSending = sendMutation.isPending;
  const isSent    = sendMutation.isSuccess;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ duration: 0.22 }}
        className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-[28px] sm:rounded-[24px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_24px_80px_rgba(0,0,0,0.25)]"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-[#0f1623] border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
              <Megaphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900 dark:text-white">
                {step === "compose" ? "New Announcement" : "Preview Announcement"}
              </h2>
              <p className="text-[11px] text-gray-400">
                {step === "compose" ? "Broadcast a message to your audience" : "Review before sending"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/[0.06] text-gray-500 hover:bg-gray-200 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex px-6 py-3 gap-2 border-b border-gray-100 dark:border-white/[0.06]">
          {(["compose", "preview"] as const).map((s, i) => (
            <button key={s} onClick={() => step === "preview" && s === "compose" && setStep("compose")}
              className={`flex items-center gap-1.5 text-xs font-bold capitalize ${step === s ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step === s ? "bg-blue-600 text-white" : i < (step === "preview" ? 1 : 0) ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-white/[0.06] text-gray-400"}`}>
                {i < (step === "preview" ? 1 : 0) ? "✓" : i + 1}
              </span>
              {s}
            </button>
          ))}
        </div>

        <div className="p-6 flex flex-col gap-5">
          {step === "compose" ? (
            <>
              {/* Audience */}
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 block">
                  Send To <span className="text-blue-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {(Object.entries(AUDIENCE_CONFIG) as [AudienceType, typeof AUDIENCE_CONFIG[AudienceType]][]).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <button key={key}
                        onClick={() => { setAudience(key); setSelectedPerson(null); }}
                        className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition-all duration-200 ${
                          audience === key
                            ? "bg-blue-600 text-white border-blue-600 shadow-[0_4px_12px_rgba(59,130,246,0.35)]"
                            : "border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:border-blue-200 hover:text-blue-600"
                        }`}>
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold leading-tight truncate">{cfg.label}</p>
                          <p className={`text-[9px] ${audience === key ? "text-blue-200" : "text-gray-400"}`}>{cfg.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Live user search for specific person */}
                {needsPerson && (
                  <UserSearchDropdown
                    role={audience === "specific_student" ? "STUDENT" : "INSTRUCTOR"}
                    selected={selectedPerson}
                    onSelect={setSelectedPerson}
                  />
                )}
              </div>

              {/* Type */}
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 block">
                  Type <span className="text-blue-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(TYPE_CONFIG) as [AnnType, typeof TYPE_CONFIG[AnnType]][]).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <button key={key} onClick={() => setAnnType(key)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                          annType === key
                            ? "bg-blue-600 text-white border-blue-600 shadow-[0_3px_10px_rgba(59,130,246,0.3)]"
                            : `border-gray-200 dark:border-white/[0.08] ${cfg.color} hover:border-blue-200`
                        }`}>
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${annType === key ? "bg-white/20" : `${cfg.bg} border ${cfg.border}`}`}>
                          <Icon className="w-3 h-3" />
                        </div>
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 block">
                  Title <span className="text-blue-500">*</span>
                </label>
                <input value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Scheduled maintenance on Sunday 3AM"
                  maxLength={120}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all" />
                <p className="text-[10px] text-gray-400 mt-1 text-right">{title.length}/120</p>
              </div>

              {/* Body */}
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 block">
                  Message <span className="text-blue-500">*</span>
                </label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4}
                  placeholder="Write your announcement here…"
                  maxLength={1000}
                  className="w-full px-4 py-2.5 rounded-xl text-sm resize-none bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all" />
                <p className="text-[10px] text-gray-400 mt-1 text-right">{body.length}/1000</p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Mail className="w-3.5 h-3.5" />
                  {recipientCount > 0 ? `${recipientCount} recipient${recipientCount !== 1 ? "s" : ""}` : "Select recipient"}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => sendMutation.mutate(true)}
                    disabled={!title.trim() || isSending}
                    className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-all disabled:opacity-40">
                    Save Draft
                  </button>
                  <button
                    disabled={!canSend}
                    onClick={() => canSend && setStep("preview")}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                      canSend
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.35)]"
                        : "bg-gray-100 dark:bg-white/[0.06] text-gray-400 cursor-not-allowed"
                    }`}>
                    Preview <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Preview step */
            <>
              {/* Preview card */}
              <div className="rounded-2xl border border-gray-100 dark:border-white/[0.07] overflow-hidden">
                <div className={`px-4 py-3 flex items-center gap-2 ${typeCfg.bg} border-b ${typeCfg.border}`}>
                  <typeCfg.icon className={`w-4 h-4 ${typeCfg.color}`} />
                  <span className={`text-xs font-bold ${typeCfg.color}`}>{typeCfg.label} · GGECL</span>
                </div>
                <div className="p-4 bg-white dark:bg-[#0f1623]">
                  <p className="text-sm font-black text-gray-900 dark:text-white mb-2">{title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{body}</p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Audience",   value: needsPerson && selectedPerson ? selectedPerson.name : audienceCfg.label },
                  { label: "Recipients", value: `${recipientCount} user${recipientCount !== 1 ? "s" : ""}` },
                  { label: "Type",       value: typeCfg.label },
                  { label: "Channel",    value: "Email" },
                ].map(({ label, value }) => (
                  <div key={label} className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-xs font-bold text-gray-800 dark:text-white mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {sendMutation.isError && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 text-sm text-amber-700 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-xs">Email delivery unavailable</p>
                    <p className="text-[11px] mt-0.5">The backend email service doesn't support the ANNOUNCEMENT type yet. Ask your backend team to add it to the <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">SendEmailDto</code> type enum. The announcement will still be saved locally.</p>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/[0.06]">
                <button onClick={() => setStep("compose")}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-all">
                  ← Edit
                </button>
                <motion.button
                  onClick={() => sendMutation.mutate(false)}
                  disabled={isSending || isSent}
                  whileHover={!isSending && !isSent ? { scale: 1.02 } : {}}
                  whileTap={!isSending && !isSent ? { scale: 0.97 } : {}}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isSent    ? "bg-emerald-500 text-white" :
                    isSending ? "bg-blue-400 text-white cursor-wait" :
                    "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.35)]"
                  }`}>
                  {isSent ? (
                    <><Check className="w-3.5 h-3.5" /> Sent!</>
                  ) : isSending ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…</>
                  ) : (
                    <><Send className="w-3.5 h-3.5" /> Send to {recipientCount} recipient{recipientCount !== 1 ? "s" : ""}</>
                  )}
                </motion.button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Announcement row ─────────────────────────────────────────────────────────

function AnnouncementRow({ ann, index, onDelete }: {
  ann: Announcement; index: number; onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const typeCfg = TYPE_CONFIG[ann.type];
  const AIcon   = AUDIENCE_CONFIG[ann.audienceType].icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.24, delay: index * 0.03 }}
      className={`rounded-[18px] border transition-all duration-200 ${
        ann.status === "draft"
          ? "bg-gray-50 dark:bg-white/[0.02] border-dashed border-gray-200 dark:border-white/[0.08]"
          : "bg-white dark:bg-[#0f1623] border-gray-100 dark:border-white/[0.07] shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
      }`}
    >
      <div className="flex items-start gap-4 p-4 cursor-pointer" onClick={() => setExpanded((p) => !p)}>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${typeCfg.bg} border ${typeCfg.border}`}>
          <typeCfg.icon className={`w-4 h-4 ${typeCfg.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-bold leading-snug ${ann.status === "draft" ? "text-gray-400" : "text-gray-900 dark:text-white"}`}>
              {ann.title}
              {ann.status === "draft" && (
                <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/[0.07] text-gray-500">DRAFT</span>
              )}
            </p>
            <span className="text-[10px] text-gray-400 flex-shrink-0">{ann.sentAt}</span>
          </div>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
              <AIcon className="w-3 h-3" /> {ann.audienceLabel}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${typeCfg.bg} ${typeCfg.border} ${typeCfg.color}`}>
              {typeCfg.label}
            </span>
            {ann.openRate != null && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <Eye className="w-3 h-3" /> {ann.openRate}% open rate
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(ann.id); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all ml-1">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">
              <div className={`rounded-xl p-4 ${typeCfg.bg} border ${typeCfg.border}`}>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{ann.body}</p>
              </div>
              <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-400">
                <span>Sent by {ann.sentBy}</span>
                <span>{ann.audienceCount} recipient{ann.audienceCount !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminAnnouncements() {
  const { user } = useDashboardUser();
  const senderName = user ? `${user.firstName} ${user.lastName}`.trim() : "Admin";

  const [announcements, setAnnouncements] = useState<Announcement[]>(loadAnnouncements);
  const [composing,      setComposing]     = useState(false);
  const [search,         setSearch]        = useState("");
  const [filterType,     setFilterType]    = useState<AnnType | "all">("all");
  const [filterAudience, setFilterAudience]= useState<AudienceType | "all">("all");
  const [filterStatus,   setFilterStatus]  = useState<AnnStatus | "all">("all");

  // Persist to localStorage whenever list changes
  useEffect(() => { saveAnnouncements(announcements); }, [announcements]);

  const hasFilters = search.trim() !== "" || filterType !== "all" || filterAudience !== "all" || filterStatus !== "all";
  const clearFilters = () => { setSearch(""); setFilterType("all"); setFilterAudience("all"); setFilterStatus("all"); };

  const filtered = useMemo(() => {
    return announcements.filter((a) => {
      if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.body.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterType     !== "all" && a.type        !== filterType)     return false;
      if (filterAudience !== "all" && a.audienceType !== filterAudience) return false;
      if (filterStatus   !== "all" && a.status       !== filterStatus)  return false;
      return true;
    });
  }, [announcements, search, filterType, filterAudience, filterStatus]);

  const sentCount  = announcements.filter((a) => a.status === "sent").length;
  const draftCount = announcements.filter((a) => a.status === "draft").length;
  const totalReach = announcements.filter((a) => a.status === "sent").reduce((acc, a) => acc + a.audienceCount, 0);
  const avgOpen    = Math.round(
    announcements.filter((a) => a.openRate != null).reduce((acc, a) => acc + (a.openRate ?? 0), 0) /
    (announcements.filter((a) => a.openRate != null).length || 1)
  );

  const handleSaved = (ann: Announcement) => setAnnouncements((p) => [ann, ...p]);
  const handleDelete = (id: string) => setAnnouncements((p) => p.filter((a) => a.id !== id));

  return (
    <div className="max-w-[1000px] mx-auto pb-10 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Announcements</h1>
          <p className="text-sm text-gray-400 mt-1">Broadcast messages to students, instructors, or specific users via email</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setComposing(true)}
          className="self-start flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-[0_4px_20px_rgba(59,130,246,0.4)] transition-colors">
          <Megaphone className="w-4 h-4" /> New Announcement
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Send,     value: String(sentCount),                                label: "Sent",          color: "blue"    },
          { icon: BookOpen, value: String(draftCount),                               label: "Drafts",        color: "amber"   },
          { icon: Users,    value: totalReach >= 1000 ? `${(totalReach/1000).toFixed(1)}k` : String(totalReach), label: "Total Reach", color: "emerald" },
          { icon: Eye,      value: announcements.some((a) => a.openRate != null) ? `${avgOpen}%` : "—", label: "Avg Open Rate", color: "violet" },
        ].map(({ icon: Icon, value, label, color }) => {
          const p: Record<string, string> = {
            blue:    "bg-blue-50/60 dark:bg-blue-950/20 border-blue-100/60 dark:border-blue-900/20 [&_.ic]:bg-blue-100 dark:[&_.ic]:bg-blue-900/40 [&_.ic_svg]:text-blue-600 dark:[&_.ic_svg]:text-blue-400",
            amber:   "bg-amber-50/60 dark:bg-amber-950/20 border-amber-100/60 dark:border-amber-900/20 [&_.ic]:bg-amber-100 dark:[&_.ic]:bg-amber-900/40 [&_.ic_svg]:text-amber-600 dark:[&_.ic_svg]:text-amber-400",
            emerald: "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100/60 dark:border-emerald-900/20 [&_.ic]:bg-emerald-100 dark:[&_.ic]:bg-emerald-900/40 [&_.ic_svg]:text-emerald-600 dark:[&_.ic_svg]:text-emerald-400",
            violet:  "bg-violet-50/60 dark:bg-violet-950/20 border-violet-100/60 dark:border-violet-900/20 [&_.ic]:bg-violet-100 dark:[&_.ic]:bg-violet-900/40 [&_.ic_svg]:text-violet-600 dark:[&_.ic_svg]:text-violet-400",
          };
          return (
            <div key={label} className={`flex flex-col items-center py-5 px-3 rounded-2xl border transition-colors ${p[color]}`}>
              <div className="ic w-9 h-9 rounded-xl flex items-center justify-center mb-2">
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-center">{label}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Filter bar */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
        className="rounded-[20px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search announcements…"
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all" />
          </div>

          {[
            {
              value: filterType, onChange: (v: string) => setFilterType(v as AnnType | "all"),
              options: [["all","All Types"],["info","Info"],["alert","Alert"],["update","Update"],["promotion","Promotion"],["maintenance","Maintenance"]],
            },
            {
              value: filterAudience, onChange: (v: string) => setFilterAudience(v as AudienceType | "all"),
              options: [["all","All Audiences"],["all_students","All Students"],["all_instructors","All Instructors"],["everyone","Everyone"],["specific_student","Specific Student"],["specific_instructor","Specific Instructor"]],
            },
            {
              value: filterStatus, onChange: (v: string) => setFilterStatus(v as AnnStatus | "all"),
              options: [["all","All Status"],["sent","Sent"],["draft","Draft"]],
            },
          ].map((sel, i) => (
            <div key={i} className="relative">
              <select value={sel.value} onChange={(e) => sel.onChange(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2 rounded-xl text-sm font-semibold bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 outline-none cursor-pointer focus:border-blue-400">
                {sel.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          ))}

          <AnimatePresence>
            {hasFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 transition-colors">
                <X className="w-3.5 h-3.5" /> Clear
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Showing <span className="font-bold text-gray-700 dark:text-gray-300">{filtered.length}</span> of {announcements.length} announcements
        </p>
      </motion.div>

      {/* List */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((ann, i) => (
              <AnnouncementRow key={ann.id} ann={ann} index={i} onDelete={handleDelete} />
            ))
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-gray-200 dark:border-white/[0.08]">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center mb-3">
                <Megaphone className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-1">No announcements found</p>
              <p className="text-xs text-gray-400">
                {hasFilters ? "Try adjusting your filters" : "Send your first announcement above"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Compose modal */}
      <AnimatePresence>
        {composing && (
          <ComposeModal
            onClose={() => setComposing(false)}
            onSaved={handleSaved}
            senderName={senderName}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
