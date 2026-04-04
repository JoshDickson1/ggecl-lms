// src/dashboards/admin-dashboard/pages/AdminAnnouncements.tsx
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone, Send, Users, GraduationCap, User,
  Search, ChevronDown, X, Eye, Trash2, Globe,
  Info, AlertCircle, RefreshCw, Star,
  Check, BookOpen,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type AudienceType = "all_students" | "all_instructors" | "everyone" | "specific_student" | "specific_instructor";
type AnnType      = "info" | "alert" | "update" | "promotion" | "maintenance";
type AnnStatus    = "sent" | "draft" | "scheduled";

interface Announcement {
  id:           string;
  title:        string;
  body:         string;
  type:         AnnType;
  audienceType: AudienceType;
  audienceLabel:string;
  audienceCount:number;
  status:       AnnStatus;
  sentAt:       string;
  sentBy:       string;
  openRate?:    number;
}

// ─── Mock people for specific targeting ───────────────────────────────────────
const STUDENTS = [
  { id:"s1", name:"Emeka Okonkwo",  avatar:"EO", bg:"bg-cyan-500"    },
  { id:"s2", name:"Fatou Diallo",   avatar:"FD", bg:"bg-violet-500"  },
  { id:"s3", name:"Tobias Renz",    avatar:"TR", bg:"bg-blue-500"    },
  { id:"s4", name:"Adaeze Obi",     avatar:"AO", bg:"bg-amber-500"   },
  { id:"s5", name:"Chinwe Eze",     avatar:"CE", bg:"bg-rose-500"    },
  { id:"s6", name:"Kwame Asante",   avatar:"KA", bg:"bg-teal-500"    },
  { id:"s7", name:"Nkechi Adamu",   avatar:"NA", bg:"bg-indigo-500"  },
  { id:"s8", name:"Bello Musa",     avatar:"BM", bg:"bg-emerald-500" },
];

const INSTRUCTORS = [
  { id:"i1", name:"Sarah Mitchell",  avatar:"SM", bg:"bg-blue-500"    },
  { id:"i2", name:"James Okafor",    avatar:"JO", bg:"bg-emerald-500" },
  { id:"i3", name:"Amara Nwosu",     avatar:"AN", bg:"bg-pink-500"    },
  { id:"i4", name:"David Chen",      avatar:"DC", bg:"bg-violet-500"  },
  { id:"i5", name:"Fatima Al-Hassan",avatar:"FA", bg:"bg-amber-500"   },
  { id:"i6", name:"Luca Romano",     avatar:"LR", bg:"bg-cyan-500"    },
  { id:"i7", name:"Priya Sharma",    avatar:"PS", bg:"bg-rose-500"    },
  { id:"i8", name:"Marcus Thompson", avatar:"MT", bg:"bg-teal-500"    },
];

// ─── Mock announcements ───────────────────────────────────────────────────────
const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { id:"ann-1",  title:"Platform Maintenance — Sunday 3AM–5AM WAT",        body:"The GGECL platform will undergo scheduled maintenance on Sunday. Video playback and course access will be temporarily unavailable.",                                    type:"maintenance", audienceType:"everyone",          audienceLabel:"Everyone",                audienceCount:1268, status:"sent",      sentAt:"Apr 1, 2024",  sentBy:"Chinelo A.", openRate:74 },
  { id:"ann-2",  title:"Flash Sale: 85% Off All Courses This Weekend!",     body:"We're celebrating 50,000 student enrollments! All courses are 85% off until Sunday midnight. Share with a friend and unlock an additional 10% discount.",            type:"promotion",   audienceType:"all_students",      audienceLabel:"All Students",            audienceCount:1240, status:"sent",      sentAt:"Mar 30, 2024", sentBy:"Chinelo A.", openRate:88 },
  { id:"ann-3",  title:"New Instructor Dashboard Features",                 body:"We've rolled out a completely redesigned analytics dashboard for instructors. You can now view student engagement heatmaps, completion funnels, and revenue forecasts.", type:"update",      audienceType:"all_instructors",   audienceLabel:"All Instructors",         audienceCount:28,   status:"sent",      sentAt:"Mar 28, 2024", sentBy:"Chinelo A.", openRate:91 },
  { id:"ann-4",  title:"Certificate Issue — React Bootcamp (resolved)",     body:"A bug in our certificate generation system caused some students to receive blank PDFs. This has been resolved. Please re-download your certificate from your profile.", type:"alert",       audienceType:"specific_student",  audienceLabel:"54 specific students",    audienceCount:54,   status:"sent",      sentAt:"Mar 25, 2024", sentBy:"Chinelo A.", openRate:95 },
  { id:"ann-5",  title:"Congratulations Emeka — 100% Completion!",         body:"Amazing work! You've completed the Digital Marketing Masterclass with an A+ grade. Your certificate is ready to download. Keep going!",                                  type:"info",        audienceType:"specific_student",  audienceLabel:"Emeka Okonkwo",           audienceCount:1,    status:"sent",      sentAt:"Mar 24, 2024", sentBy:"Chinelo A.", openRate:100},
  { id:"ann-6",  title:"Payout Schedule Change — April Onwards",            body:"Starting April, instructor payouts will be processed on the 1st and 15th of each month, instead of monthly. This applies to all eligible earnings.",                    type:"info",        audienceType:"all_instructors",   audienceLabel:"All Instructors",         audienceCount:28,   status:"sent",      sentAt:"Mar 22, 2024", sentBy:"Chinelo A.", openRate:83 },
  { id:"ann-7",  title:"Feedback Request — New Course Review System",       body:"We're testing a new 5-question course review system and need your feedback. Please complete the short survey linked below. Takes less than 2 minutes.",               type:"info",        audienceType:"all_students",      audienceLabel:"All Students",            audienceCount:1240, status:"draft",     sentAt:"—",            sentBy:"Draft",      },
  { id:"ann-8",  title:"Important: Update Your Bank Details",               body:"To ensure April payout is processed without delay, please verify your bank account details in your instructor profile by March 31.",                                   type:"alert",       audienceType:"specific_instructor",audienceLabel:"Sarah Mitchell",          audienceCount:1,    status:"sent",      sentAt:"Mar 20, 2024", sentBy:"Chinelo A.", openRate:100},
];

// ─── Config ───────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<AnnType, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  info:        { label:"Info",         icon:Info,        color:"text-blue-600 dark:text-blue-400",    bg:"bg-blue-50 dark:bg-blue-950/30",    border:"border-blue-200 dark:border-blue-800/50"    },
  alert:       { label:"Alert",        icon:AlertCircle, color:"text-red-600 dark:text-red-400",      bg:"bg-red-50 dark:bg-red-950/30",      border:"border-red-200 dark:border-red-800/50"      },
  update:      { label:"Update",       icon:RefreshCw,   color:"text-violet-600 dark:text-violet-400",bg:"bg-violet-50 dark:bg-violet-950/30",border:"border-violet-200 dark:border-violet-800/50"},
  promotion:   { label:"Promotion",    icon:Star,        color:"text-amber-600 dark:text-amber-400",  bg:"bg-amber-50 dark:bg-amber-950/30",  border:"border-amber-200 dark:border-amber-800/50"  },
  maintenance: { label:"Maintenance",  icon:RefreshCw,   color:"text-gray-600 dark:text-gray-400",   bg:"bg-gray-50 dark:bg-white/[0.04]",   border:"border-gray-200 dark:border-white/[0.08]"   },
};

const AUDIENCE_CONFIG: Record<AudienceType, { label: string; icon: React.ElementType; desc: string }> = {
  all_students:       { label:"All Students",         icon:Users,         desc:"1,240 recipients" },
  all_instructors:    { label:"All Instructors",      icon:GraduationCap, desc:"28 recipients"    },
  everyone:           { label:"Everyone",             icon:Globe,         desc:"1,268 recipients" },
  specific_student:   { label:"Specific Student",     icon:User,          desc:"1 recipient"      },
  specific_instructor:{ label:"Specific Instructor",  icon:User,          desc:"1 recipient"      },
};

// ─── Compose modal ────────────────────────────────────────────────────────────
function ComposeModal({ onClose, onSend }: {
  onClose: () => void;
  onSend: (ann: Omit<Announcement, "id" | "sentAt" | "sentBy" | "openRate">) => void;
}) {
  const [audience,      setAudience]      = useState<AudienceType>("all_students");
  const [annType,       setAnnType]       = useState<AnnType>("info");
  const [title,         setTitle]         = useState("");
  const [body,          setBody]          = useState("");
  const [personSearch,  setPersonSearch]  = useState("");
  const [selectedPerson,setSelectedPerson] = useState<{id:string;name:string;avatar:string;bg:string} | null>(null);
  const [step,          setStep]          = useState<"compose" | "preview">("compose");
  const [sending,       setSending]       = useState(false);
  const [sent,          setSent]          = useState(false);
//   const [saveDraft,     setSaveDraft]     = useState(false);

  const needsPerson = audience === "specific_student" || audience === "specific_instructor";
  const peopleList  = audience === "specific_student" ? STUDENTS : INSTRUCTORS;
  const filteredPeople = peopleList.filter(p => p.name.toLowerCase().includes(personSearch.toLowerCase()));

  const audienceCfg = AUDIENCE_CONFIG[audience];
  const typeCfg     = TYPE_CONFIG[annType];

  const recipientLabel = needsPerson && selectedPerson
    ? selectedPerson.name
    : audienceCfg.desc;

  const recipientCount = needsPerson
    ? (selectedPerson ? 1 : 0)
    : audience === "all_students" ? 1240 : audience === "all_instructors" ? 28 : 1268;

  const canSend = title.trim() && body.trim() && (!needsPerson || selectedPerson);

  const handleSend = (draft = false) => {
    if (!canSend && !draft) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      onSend({
        title, body,
        type: annType,
        audienceType: audience,
        audienceLabel: recipientLabel,
        audienceCount: recipientCount,
        status: draft ? "draft" : "sent",
      });
      setTimeout(onClose, 1500);
    }, 1400);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ duration: 0.22 }}
        className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-[28px] sm:rounded-[24px] bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_24px_80px_rgba(0,0,0,0.25)]"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4
          bg-white dark:bg-[#0f1623] border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700
              flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)]">
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
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center
              bg-gray-100 dark:bg-white/[0.06] text-gray-500 hover:bg-gray-200 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex px-6 py-3 gap-2 border-b border-gray-100 dark:border-white/[0.06]">
          {(["compose","preview"] as const).map((s, i) => (
            <button key={s} onClick={() => step === "preview" && s === "compose" && setStep("compose")}
              className={`flex items-center gap-1.5 text-xs font-bold capitalize
                ${step === s ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black
                ${step === s ? "bg-blue-600 text-white" : i < (step === "preview" ? 1 : 0) ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-white/[0.06] text-gray-400"}`}>
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
                      <button key={key} onClick={() => { setAudience(key); setSelectedPerson(null); setPersonSearch(""); }}
                        className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition-all duration-200
                          ${audience === key
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

                {/* Person search */}
                {needsPerson && (
                  <div className="mt-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      <input value={personSearch} onChange={e => setPersonSearch(e.target.value)}
                        placeholder={`Search ${audience === "specific_student" ? "students" : "instructors"}…`}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm
                          bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08]
                          text-gray-800 dark:text-white placeholder:text-gray-400
                          outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all" />
                    </div>
                    {personSearch && (
                      <div className="mt-2 rounded-xl border border-gray-100 dark:border-white/[0.07] overflow-hidden
                        shadow-[0_4px_16px_rgba(0,0,0,0.08)] max-h-44 overflow-y-auto">
                        {filteredPeople.length > 0 ? filteredPeople.map(p => (
                          <button key={p.id} onClick={() => { setSelectedPerson(p); setPersonSearch(""); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors text-left
                              ${selectedPerson?.id === p.id ? "bg-blue-50 dark:bg-blue-950/20" : "bg-white dark:bg-[#0f1623]"}`}>
                            <span className={`w-8 h-8 rounded-xl text-xs font-bold text-white flex items-center justify-center flex-shrink-0 ${p.bg}`}>{p.avatar}</span>
                            <span className="text-sm font-semibold text-gray-800 dark:text-white">{p.name}</span>
                            {selectedPerson?.id === p.id && <Check className="w-4 h-4 text-blue-600 ml-auto" />}
                          </button>
                        )) : (
                          <p className="text-xs text-gray-400 px-4 py-3">No results</p>
                        )}
                      </div>
                    )}
                    {selectedPerson && (
                      <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl
                        bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50">
                        <span className={`w-6 h-6 rounded-lg text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0 ${selectedPerson.bg}`}>
                          {selectedPerson.avatar}
                        </span>
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{selectedPerson.name}</span>
                        <button onClick={() => setSelectedPerson(null)} className="ml-auto text-blue-400 hover:text-blue-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
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
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all
                          ${annType === key
                            ? "bg-blue-600 text-white border-blue-600 shadow-[0_3px_10px_rgba(59,130,246,0.3)]"
                            : `border-gray-200 dark:border-white/[0.08] ${cfg.color} hover:border-blue-200`
                          }`}>
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0
                          ${annType === key ? "bg-white/20" : `${cfg.bg} border ${cfg.border}`}`}>
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
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Scheduled maintenance on Sunday 3AM"
                  maxLength={120}
                  className="w-full px-4 py-2.5 rounded-xl text-sm
                    bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08]
                    text-gray-800 dark:text-white placeholder:text-gray-400
                    outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all" />
                <p className="text-[10px] text-gray-400 mt-1 text-right">{title.length}/120</p>
              </div>

              {/* Body */}
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 block">
                  Message <span className="text-blue-500">*</span>
                </label>
                <textarea value={body} onChange={e => setBody(e.target.value)} rows={4}
                  placeholder="Write your announcement here…"
                  maxLength={500}
                  className="w-full px-4 py-2.5 rounded-xl text-sm resize-none
                    bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08]
                    text-gray-800 dark:text-white placeholder:text-gray-400
                    outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all" />
                <p className="text-[10px] text-gray-400 mt-1 text-right">{body.length}/500</p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Users className="w-3.5 h-3.5" />
                  {recipientCount} recipient{recipientCount !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleSend(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold
                      border border-gray-200 dark:border-white/[0.08]
                      text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-all">
                    Save Draft
                  </button>
                  <button
                    disabled={!canSend}
                    onClick={() => canSend && setStep("preview")}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all
                      ${canSend
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
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{body}</p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label:"Audience",    value: needsPerson && selectedPerson ? selectedPerson.name : audienceCfg.label },
                  { label:"Recipients",  value: `${recipientCount} user${recipientCount !== 1 ? "s" : ""}` },
                  { label:"Type",        value: typeCfg.label   },
                  { label:"Send time",   value: "Immediately"   },
                ].map(({ label, value }) => (
                  <div key={label} className="px-3 py-2.5 rounded-xl
                    bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-xs font-bold text-gray-800 dark:text-white mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/[0.06]">
                <button onClick={() => setStep("compose")}
                  className="px-4 py-2 rounded-xl text-xs font-bold
                    border border-gray-200 dark:border-white/[0.08]
                    text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-all">
                  ← Edit
                </button>
                <motion.button
                  onClick={() => handleSend(false)}
                  disabled={sending || sent}
                  whileHover={!sending && !sent ? { scale: 1.02 } : {}}
                  whileTap={!sending && !sent ? { scale: 0.97 } : {}}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all
                    ${sent
                      ? "bg-emerald-500 text-white"
                      : sending
                        ? "bg-blue-400 text-white cursor-wait"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.35)]"
                    }`}>
                  {sent ? (
                    <><Check className="w-3.5 h-3.5" /> Sent!</>
                  ) : sending ? (
                    <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>
                      <RefreshCw className="w-3.5 h-3.5" />
                    </motion.div> Sending…</>
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
      className={`rounded-[18px] border transition-all duration-200
        ${ann.status === "draft"
          ? "bg-gray-50 dark:bg-white/[0.02] border-dashed border-gray-200 dark:border-white/[0.08]"
          : "bg-white dark:bg-[#0f1623] border-gray-100 dark:border-white/[0.07] shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
        }`}
    >
      <div className="flex items-start gap-4 p-4 cursor-pointer" onClick={() => setExpanded(p => !p)}>
        {/* Type icon */}
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${typeCfg.bg} border ${typeCfg.border}`}>
          <typeCfg.icon className={`w-4 h-4 ${typeCfg.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-bold leading-snug ${ann.status === "draft" ? "text-gray-400" : "text-gray-900 dark:text-white"}`}>
              {ann.title}
              {ann.status === "draft" && (
                <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full
                  bg-gray-100 dark:bg-white/[0.07] text-gray-500">DRAFT</span>
              )}
            </p>
            <span className="text-[10px] text-gray-400 flex-shrink-0">{ann.sentAt}</span>
          </div>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {/* Audience chip */}
            <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
              <AIcon className="w-3 h-3" /> {ann.audienceLabel}
            </span>
            {/* Type chip */}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${typeCfg.bg} ${typeCfg.border} ${typeCfg.color}`}>
              {typeCfg.label}
            </span>
            {/* Open rate */}
            {ann.openRate != null && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <Eye className="w-3 h-3" /> {ann.openRate}% open rate
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.span>
          <button
            onClick={e => { e.stopPropagation(); onDelete(ann.id); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center
              text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all ml-1">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded body */}
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
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{ann.body}</p>
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
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [composing,     setComposing]     = useState(false);
  const [search,        setSearch]        = useState("");
  const [filterType,    setFilterType]    = useState<AnnType | "all">("all");
  const [filterAudience,setFilterAudience]= useState<AudienceType | "all">("all");
  const [filterStatus,  setFilterStatus]  = useState<AnnStatus | "all">("all");

  const hasFilters = search.trim() !== "" || filterType !== "all" || filterAudience !== "all" || filterStatus !== "all";

  const clearFilters = () => { setSearch(""); setFilterType("all"); setFilterAudience("all"); setFilterStatus("all"); };

  const filtered = useMemo(() => {
    return announcements.filter(a => {
      if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.body.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterType     !== "all" && a.type         !== filterType)     return false;
      if (filterAudience !== "all" && a.audienceType !== filterAudience) return false;
      if (filterStatus   !== "all" && a.status       !== filterStatus)   return false;
      return true;
    });
  }, [announcements, search, filterType, filterAudience, filterStatus]);

  const sentCount  = announcements.filter(a => a.status === "sent").length;
  const draftCount = announcements.filter(a => a.status === "draft").length;
  const totalReach = announcements.filter(a => a.status === "sent").reduce((acc, a) => acc + a.audienceCount, 0);
  const avgOpen    = Math.round(
    announcements.filter(a => a.openRate != null).reduce((acc, a) => acc + (a.openRate ?? 0), 0) /
    (announcements.filter(a => a.openRate != null).length || 1)
  );

  const handleSend = (ann: Omit<Announcement, "id" | "sentAt" | "sentBy" | "openRate">) => {
    const newAnn: Announcement = {
      ...ann,
      id: `ann-${Date.now()}`,
      sentAt: ann.status === "draft" ? "—" : "Just now",
      sentBy: ann.status === "draft" ? "Draft" : "You",
    };
    setAnnouncements(p => [newAnn, ...p]);
  };

  const handleDelete = (id: string) => setAnnouncements(p => p.filter(a => a.id !== id));

  return (
    <div className="max-w-[1000px] mx-auto pb-10 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Announcements</h1>
          <p className="text-sm text-gray-400 mt-1">
            Broadcast messages to students, instructors, or specific users
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setComposing(true)}
          className="self-start flex items-center gap-2 px-5 py-2.5 rounded-full
            bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold
            shadow-[0_4px_20px_rgba(59,130,246,0.4)] transition-colors">
          <Megaphone className="w-4 h-4" /> New Announcement
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Send,      value: String(sentCount),  label: "Sent",         color:"blue"    },
          { icon: BookOpen,  value: String(draftCount), label: "Drafts",       color:"amber"   },
          { icon: Users,     value: `${(totalReach/1000).toFixed(1)}k`, label:"Total Reach", color:"emerald" },
          { icon: Eye,       value: `${avgOpen}%`,      label: "Avg Open Rate",color:"violet"  },
        ].map(({ icon: Icon, value, label, color }) => {
          const p: Record<string,string> = {
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
        className="rounded-[20px] bg-white dark:bg-[#0f1623]
          border border-gray-100 dark:border-white/[0.07]
          shadow-[0_4px_24px_rgba(0,0,0,0.05)] p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search announcements…"
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm
                bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08]
                text-gray-800 dark:text-white placeholder:text-gray-400
                outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all" />
          </div>

          {/* Type */}
          <div className="relative">
            <select value={filterType} onChange={e => setFilterType(e.target.value as AnnType | "all")}
              className="appearance-none pl-4 pr-8 py-2 rounded-xl text-sm font-semibold
                bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08]
                text-gray-700 dark:text-gray-300 outline-none cursor-pointer focus:border-blue-400">
              <option value="all">All Types</option>
              <option value="info">Info</option>
              <option value="alert">Alert</option>
              <option value="update">Update</option>
              <option value="promotion">Promotion</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Audience */}
          <div className="relative">
            <select value={filterAudience} onChange={e => setFilterAudience(e.target.value as AudienceType | "all")}
              className="appearance-none pl-4 pr-8 py-2 rounded-xl text-sm font-semibold
                bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08]
                text-gray-700 dark:text-gray-300 outline-none cursor-pointer focus:border-blue-400">
              <option value="all">All Audiences</option>
              <option value="all_students">All Students</option>
              <option value="all_instructors">All Instructors</option>
              <option value="everyone">Everyone</option>
              <option value="specific_student">Specific Student</option>
              <option value="specific_instructor">Specific Instructor</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Status */}
          <div className="relative">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as AnnStatus | "all")}
              className="appearance-none pl-4 pr-8 py-2 rounded-xl text-sm font-semibold
                bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08]
                text-gray-700 dark:text-gray-300 outline-none cursor-pointer focus:border-blue-400">
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>

          {/* Clear */}
          <AnimatePresence>
            {hasFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold
                  border border-red-200 dark:border-red-900/50
                  text-red-500 dark:text-red-400
                  bg-red-50 dark:bg-red-950/20 hover:bg-red-100 transition-colors">
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
              className="flex flex-col items-center justify-center py-20 text-center rounded-2xl
                border border-dashed border-gray-200 dark:border-white/[0.08]">
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
          <ComposeModal onClose={() => setComposing(false)} onSend={handleSend} />
        )}
      </AnimatePresence>
    </div>
  );
}