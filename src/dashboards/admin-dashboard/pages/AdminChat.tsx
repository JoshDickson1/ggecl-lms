// src/dashboards/admin/pages/AdminChat.tsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hash, Users, Award, Info, ChevronDown, Plus, X,
  CheckCircle2, Shield,
} from "lucide-react";
import {
  MOCK_CLASSROOMS, MOCK_CLASSGROUPS,
  CLASSROOM_MESSAGES, CLASSGROUP_MESSAGES,
//   MEMBERS as _MEMBERS,
  type ChatMessage, type Classroom, type ClassGroup, type ClassroomMember,
} from "@/data/chatData";

// We reference the seed members via the exported arrays
// import {
//   timeAgo, ATTACHMENT_META,
// } from "@/data/chatData";

import type { LetterGrade } from "@/data/academicData";
// import { GRADE_META } from "@/data/academicData";
import {
  Card, ChatBubble, GradeBadge, QuickGradePanel,
  MessageInput, RoomDetailDialog, RoleBadge,
} from "@/data/ChatShare";

// ─── Admin identity ────────────────────────────────────────────────────────────
const ME: ClassroomMember = {
  id: "adm-001",
  name: "Emeka Osei",
  avatar: "EO",
  avatarBg: "bg-gradient-to-br from-rose-600 to-pink-600",
  role: "admin",
  isOnline: true,
  joinedAt: "2024-01-01T07:00:00Z",
};

// Seed pools for the create classroom form
const INSTRUCTOR_POOL: ClassroomMember[] = [
  { id: "ins-001", name: "Sarah Mitchell",  avatar: "SM", avatarBg: "bg-gradient-to-br from-blue-600 to-indigo-600",   role: "instructor", isOnline: true,  joinedAt: "2024-01-01T08:00:00Z" },
  { id: "ins-002", name: "James Okafor",    avatar: "JO", avatarBg: "bg-gradient-to-br from-emerald-600 to-teal-600", role: "instructor", isOnline: false, joinedAt: "2024-01-01T08:00:00Z" },
];
const STUDENT_POOL: ClassroomMember[] = [
  { id: "stu-001", name: "Zara Adeyemi",    avatar: "ZA", avatarBg: "bg-blue-500",    role: "student", isOnline: true,  joinedAt: "2024-01-10T08:00:00Z" },
  { id: "stu-002", name: "Kofi Mensah",     avatar: "KM", avatarBg: "bg-emerald-500", role: "student", isOnline: false, joinedAt: "2024-01-10T08:00:00Z" },
  { id: "stu-003", name: "Priya Kumar",     avatar: "PK", avatarBg: "bg-pink-500",    role: "student", isOnline: true,  joinedAt: "2024-01-10T08:00:00Z" },
  { id: "stu-004", name: "James Obi",       avatar: "JO", avatarBg: "bg-violet-500",  role: "student", isOnline: false, joinedAt: "2024-01-10T08:00:00Z" },
  { id: "stu-005", name: "Amara Diallo",    avatar: "AD", avatarBg: "bg-amber-500",   role: "student", isOnline: true,  joinedAt: "2024-01-11T08:00:00Z" },
  { id: "stu-006", name: "Chen Wei",        avatar: "CW", avatarBg: "bg-cyan-500",    role: "student", isOnline: false, joinedAt: "2024-01-11T08:00:00Z" },
  { id: "stu-007", name: "Fatou Sow",       avatar: "FS", avatarBg: "bg-rose-500",    role: "student", isOnline: true,  joinedAt: "2024-01-12T08:00:00Z" },
];

// ─── Create Classroom Panel (slide-in from right) ──────────────────────────────

function CreateClassroomPanel({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (c: Classroom) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("dev-001");
  const [courseName, setCourseName] = useState("React & TypeScript Bootcamp");
  const [color, setColor] = useState("from-blue-600 to-indigo-700");
  const [icon, setIcon] = useState("⚛️");
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [success, setSuccess] = useState(false);

  const COLORS = [
    "from-blue-600 to-indigo-700", "from-violet-600 to-purple-700",
    "from-emerald-600 to-teal-700", "from-rose-600 to-pink-700",
    "from-amber-600 to-orange-700", "from-cyan-600 to-sky-700",
  ];
  const ICONS = ["⚛️", "📣", "🎓", "💡", "🔬", "📊", "🎨", "🌐", "🚀", "⭐"];

  const COURSES = [
    { id: "dev-001", name: "React & TypeScript Bootcamp" },
    { id: "mkt-001", name: "Digital Marketing Masterclass" },
    { id: "ds-001",  name: "Python for Data Science" },
    { id: "biz-001", name: "Entrepreneurship & Startup Playbook" },
  ];

  const toggleInstructor = (id: string) =>
    setSelectedInstructors(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleStudent = (id: string) =>
    setSelectedStudents(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleCreate = () => {
    if (!name.trim()) return;
    const instructors = INSTRUCTOR_POOL.filter(i => selectedInstructors.includes(i.id));
    const students = STUDENT_POOL.filter(s => selectedStudents.includes(s.id));
    const newRoom: Classroom = {
      id: `cls-${Date.now()}`, name: name.trim(), description: description.trim(),
      courseId, courseName, color, icon,
      createdBy: ME.id, createdAt: new Date().toISOString(),
      instructors, students, pinnedMessageIds: [], isArchived: false, totalMessages: 0,
    };
    onCreate(newRoom);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); onClose(); }, 1500);
  };

  const canProceed = step === 1 ? name.trim() !== "" : step === 2 ? selectedInstructors.length > 0 : true;

  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 280, damping: 30 }}
      className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#0f1623] border-l border-gray-100 dark:border-white/[0.08] shadow-2xl z-50 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/[0.07]">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-rose-500" />
          <h2 className="font-black text-gray-900 dark:text-white">Create Classroom</h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 dark:border-white/[0.07]">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= s ? "bg-rose-600 text-white" : "bg-gray-100 dark:bg-white/[0.07] text-gray-400"}`}>{s}</div>
            {s < 3 && <div className={`h-0.5 w-8 rounded ${step > s ? "bg-rose-600" : "bg-gray-200 dark:bg-white/[0.07]"}`} />}
          </div>
        ))}
        <span className="ml-2 text-xs text-gray-400">
          {step === 1 ? "Details" : step === 2 ? "Instructors" : "Students"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {success ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="font-black text-gray-900 dark:text-white text-xl">Classroom created!</p>
          </div>
        ) : (
          <>
            {/* STEP 1: Basic info */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Course</label>
                  <select value={courseId} onChange={e => { const c = COURSES.find(x => x.id === e.target.value); setCourseId(e.target.value); setCourseName(c?.name ?? ""); }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30">
                    {COURSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Classroom Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. React Bootcamp — Cohort 5"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                    placeholder="Describe this classroom..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map(c => <button key={c} onClick={() => setColor(c)} className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c} transition-all ${color === c ? "ring-2 ring-offset-2 ring-rose-500 scale-110" : ""}`} />)}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map(ic => <button key={ic} onClick={() => setIcon(ic)} className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all ${icon === ic ? "bg-rose-100 dark:bg-rose-900/40 ring-2 ring-rose-500 scale-110" : "bg-gray-100 dark:bg-white/[0.06]"}`}>{ic}</button>)}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Instructors */}
            {step === 2 && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400">Select instructors to assign to this classroom</p>
                {INSTRUCTOR_POOL.map(ins => (
                  <button key={ins.id} onClick={() => toggleInstructor(ins.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedInstructors.includes(ins.id) ? "border-rose-400 bg-rose-50 dark:bg-rose-900/20" : "border-gray-200 dark:border-white/[0.07] hover:border-gray-300"}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black ${ins.avatarBg}`}>{ins.avatar}</div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{ins.name}</p>
                      <RoleBadge role={ins.role} />
                    </div>
                    {selectedInstructors.includes(ins.id) && <CheckCircle2 className="w-5 h-5 text-rose-500 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}

            {/* STEP 3: Students */}
            {step === 3 && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400">Enroll students ({selectedStudents.length} selected)</p>
                {STUDENT_POOL.map(stu => (
                  <button key={stu.id} onClick={() => toggleStudent(stu.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedStudents.includes(stu.id) ? "border-rose-400 bg-rose-50 dark:bg-rose-900/20" : "border-gray-200 dark:border-white/[0.07] hover:border-gray-300"}`}>
                    <div className="relative">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black ${stu.avatarBg}`}>{stu.avatar}</div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#0f1623] ${stu.isOnline ? "bg-emerald-400" : "bg-gray-300 dark:bg-gray-600"}`} />
                    </div>
                    <p className="flex-1 text-sm font-semibold text-gray-900 dark:text-white text-left">{stu.name}</p>
                    {selectedStudents.includes(stu.id) && <CheckCircle2 className="w-5 h-5 text-rose-500 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {!success && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/[0.07] flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep(s => (s - 1) as any)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
              Back
            </button>
          )}
          {step < 3 ? (
            <button onClick={() => setStep(s => (s + 1) as any)} disabled={!canProceed}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-rose-600 to-pink-700 hover:opacity-90 disabled:opacity-40 transition-all shadow-md">
              Next
            </button>
          ) : (
            <button onClick={handleCreate} disabled={!name.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-rose-600 to-pink-700 hover:opacity-90 disabled:opacity-40 transition-all shadow-md">
              <Plus className="w-4 h-4" />Create Classroom
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─── Chat View ────────────────────────────────────────────────────────────────

function ChatView({
  roomType, roomName, roomColor, roomIcon,
  members, messages, onSend, onBack, onInfo, activeGroup,
  onReact, onPin, onDelete, onShowGrade, showGradePanel,
}: {
  roomType: "classroom" | "classgroup";
  roomName: string; roomColor: string; roomIcon: string;
  members: ClassroomMember[]; messages: ChatMessage[];
  onSend: (text: string, files: File[]) => void;
  onBack: () => void; onInfo: () => void;
  activeGroup?: ClassGroup;
  onReact: (msgId: string, emoji: string) => void;
  onPin: (msgId: string) => void;
  onDelete: (msgId: string) => void;
  onShowGrade: () => void;
  showGradePanel: boolean;
}) {
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-white/[0.07] bg-white dark:bg-[#0f1623] flex-shrink-0">
        <button onClick={onBack} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all">
          <ChevronDown className="w-4 h-4 rotate-90" />
        </button>
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roomColor} flex items-center justify-center text-xl flex-shrink-0`}>{roomIcon}</div>
        <div className="flex-1 min-w-0">
          <h2 className="font-black text-gray-900 dark:text-white text-sm truncate">{roomName}</h2>
          <p className="text-xs text-gray-400">{members.length} members · {roomType === "classgroup" ? "Classgroup" : "Classroom"}</p>
        </div>
        {activeGroup?.grade && <GradeBadge grade={activeGroup.grade} />}
        <div className="flex items-center gap-1.5">
          {roomType === "classgroup" && (
            <button onClick={onShowGrade}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${showGradePanel ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700" : "border-gray-200 dark:border-white/[0.07] text-gray-500 hover:border-amber-300 hover:text-amber-600"}`}>
              <Award className="w-3.5 h-3.5" />Grade
            </button>
          )}
          <button onClick={onInfo} className="p-2 rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {messages.map((msg, i) => (
          <ChatBubble key={msg.id} message={msg} isMe={msg.senderId === ME.id}
            prevSenderId={i > 0 ? messages[i - 1].senderId : undefined}
            canPin canDelete
            onReply={() => setReplyTo(msg)}
            onReact={onReact} onPin={onPin} onDelete={onDelete} />
        ))}
        <div ref={bottomRef} />
      </div>

      <MessageInput replyTo={replyTo} onCancelReply={() => setReplyTo(null)}
        onSend={(text, files) => { onSend(text, files); setReplyTo(null); }} members={members} />
    </div>
  );
}

// ─── Room Card ────────────────────────────────────────────────────────────────

function RoomCard({ name, description, icon, color, memberCount, msgCount, grade, badge, onClick }: {
  name: string; description: string; icon: string; color: string;
  memberCount: number; msgCount: number; grade?: LetterGrade; badge?: string; onClick: () => void;
}) {
  return (
    <motion.div whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.99 }} onClick={onClick} className="cursor-pointer">
      <Card className="p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl flex-shrink-0 shadow-md`}>{icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{name}</h3>
              {grade && <GradeBadge grade={grade} />}
              {badge && <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/30">{badge}</span>}
            </div>
            <p className="text-xs text-gray-400 truncate">{description}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{memberCount}</span>
              <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{msgCount}</span>
            </div>
          </div>
          <ChevronDown className="-rotate-90 w-4 h-4 text-gray-400 flex-shrink-0" />
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminChat() {
  const [tab, setTab] = useState<"classrooms" | "classgroups">("classrooms");
  const [activeRoom, setActiveRoom] = useState<{ id: string; type: "classroom" | "classgroup" } | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>(MOCK_CLASSROOMS);
  const [groups, setGroups] = useState<ClassGroup[]>(MOCK_CLASSGROUPS);
  const [classroomMsgs, setClassroomMsgs] = useState<Record<string, ChatMessage[]>>(CLASSROOM_MESSAGES);
  const [groupMsgs, setGroupMsgs] = useState<Record<string, ChatMessage[]>>(CLASSGROUP_MESSAGES);
  const [showCreateClassroom, setShowCreateClassroom] = useState(false);
  const [showGradePanel, setShowGradePanel] = useState(false);
  const [detailRoom, setDetailRoom] = useState<Classroom | ClassGroup | null>(null);
  const [detailType, setDetailType] = useState<"classroom" | "classgroup">("classroom");

  const activeClassroom = activeRoom?.type === "classroom" ? classrooms.find(c => c.id === activeRoom.id) : null;
  const activeGroup = activeRoom?.type === "classgroup" ? groups.find(g => g.id === activeRoom.id) : null;

  const messages = activeRoom
    ? (activeRoom.type === "classroom" ? classroomMsgs[activeRoom.id] ?? [] : groupMsgs[activeRoom.id] ?? [])
    : [];

  const currentMembers: ClassroomMember[] = activeClassroom
    ? [...activeClassroom.instructors, ...activeClassroom.students]
    : activeGroup?.members ?? [];

  const handleSend = (text: string, files: File[]) => {
    if (!activeRoom) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`, roomId: activeRoom.id,
      senderId: ME.id, senderName: ME.name, senderAvatar: ME.avatar,
      senderAvatarBg: ME.avatarBg, senderRole: ME.role,
      text, attachments: files.map((f, i) => ({ id: `f-${i}`, name: f.name, size: `${(f.size / 1024).toFixed(0)} KB`, type: "other" as any, url: "#" })),
      reactions: [], taggedUsers: [], createdAt: new Date().toISOString(), isDeleted: false, isPinned: false,
    };
    if (activeRoom.type === "classroom") setClassroomMsgs(p => ({ ...p, [activeRoom.id]: [...(p[activeRoom.id] ?? []), newMsg] }));
    else setGroupMsgs(p => ({ ...p, [activeRoom.id]: [...(p[activeRoom.id] ?? []), newMsg] }));
  };

  const handleReact = (msgId: string, emoji: string) => {
    const update = (msgs: ChatMessage[]) => msgs.map(m => m.id !== msgId ? m : {
      ...m, reactions: m.reactions.some(r => r.emoji === emoji)
        ? m.reactions.map(r => r.emoji === emoji ? { ...r, count: r.reactedByMe ? r.count - 1 : r.count + 1, reactedByMe: !r.reactedByMe } : r).filter(r => r.count > 0)
        : [...m.reactions, { emoji, count: 1, reactedByMe: true }],
    });
    if (activeRoom?.type === "classroom") setClassroomMsgs(p => ({ ...p, [activeRoom.id]: update(p[activeRoom.id] ?? []) }));
    else if (activeRoom?.type === "classgroup") setGroupMsgs(p => ({ ...p, [activeRoom.id]: update(p[activeRoom.id] ?? []) }));
  };

  const handlePin = (msgId: string) => {
    const update = (msgs: ChatMessage[]) => msgs.map(m => m.id === msgId ? { ...m, isPinned: !m.isPinned } : m);
    if (activeRoom?.type === "classroom") setClassroomMsgs(p => ({ ...p, [activeRoom.id]: update(p[activeRoom.id] ?? []) }));
    else if (activeRoom?.type === "classgroup") setGroupMsgs(p => ({ ...p, [activeRoom.id]: update(p[activeRoom.id] ?? []) }));
  };

  const handleDelete = (msgId: string) => {
    const update = (msgs: ChatMessage[]) => msgs.map(m => m.id === msgId ? { ...m, isDeleted: true } : m);
    if (activeRoom?.type === "classroom") setClassroomMsgs(p => ({ ...p, [activeRoom.id]: update(p[activeRoom.id] ?? []) }));
    else if (activeRoom?.type === "classgroup") setGroupMsgs(p => ({ ...p, [activeRoom.id]: update(p[activeRoom.id] ?? []) }));
  };

  const handleGrade = (groupId: string, grade: LetterGrade, feedback: string) => {
    setGroups(p => p.map(g => g.id === groupId ? { ...g, grade, gradeFeedback: feedback, gradedBy: ME.name, gradedByRole: "admin", gradedAt: new Date().toISOString() } : g));
  };

  const handleCreateClassroom = (classroom: Classroom) => {
    setClassrooms(p => [classroom, ...p]);
    setClassroomMsgs(p => ({ ...p, [classroom.id]: [] }));
  };

  return (
    <>
      <div className="h-[calc(100vh-80px)] flex flex-col max-w-[1100px] mx-auto">
        {!activeRoom ? (
          <div className="flex-1 overflow-y-auto space-y-6 pb-10">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-pink-700 flex items-center justify-center shadow-md">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white">Chat Management</h1>
                  <p className="text-xs text-gray-400">{classrooms.length} classrooms · {groups.length} groups</p>
                </div>
              </div>
              <button onClick={() => setShowCreateClassroom(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-rose-600 to-pink-700 hover:opacity-90 transition-all shadow-md">
                <Plus className="w-4 h-4" />New Classroom
              </button>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit">
              {[
                { id: "classrooms", label: `Classrooms (${classrooms.length})` },
                { id: "classgroups", label: `Classgroups (${groups.length})` },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id as any)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${tab === t.id ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === "classrooms" && (
                <motion.div key="cls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {classrooms.map((c, i) => (
                    <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <RoomCard name={c.name} description={c.description} icon={c.icon} color={c.color}
                        memberCount={c.students.length + c.instructors.length} msgCount={c.totalMessages}
                        badge="Admin"
                        onClick={() => setActiveRoom({ id: c.id, type: "classroom" })} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
              {tab === "classgroups" && (
                <motion.div key="grp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {groups.map((g, i) => (
                    <motion.div key={g.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <RoomCard name={g.name} description={g.classroomName} icon={g.icon} color={g.color}
                        memberCount={g.members.length} msgCount={g.totalMessages} grade={g.grade}
                        onClick={() => setActiveRoom({ id: g.id, type: "classgroup" })} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden rounded-2xl border border-gray-100 dark:border-white/[0.07] bg-white dark:bg-[#0f1623]">
            <div className="flex-1 flex flex-col overflow-hidden">
              <ChatView
                roomType={activeRoom.type}
                roomName={activeClassroom?.name ?? activeGroup?.name ?? ""}
                roomColor={activeClassroom?.color ?? activeGroup?.color ?? "from-rose-600 to-pink-700"}
                roomIcon={activeClassroom?.icon ?? activeGroup?.icon ?? "💬"}
                members={currentMembers} messages={messages} onSend={handleSend}
                onBack={() => { setActiveRoom(null); setShowGradePanel(false); }}
                onInfo={() => { setDetailRoom(activeClassroom ?? activeGroup ?? null); setDetailType(activeRoom.type); }}
                activeGroup={activeGroup ?? undefined}
                onReact={handleReact} onPin={handlePin} onDelete={handleDelete}
                onShowGrade={() => setShowGradePanel(p => !p)}
                showGradePanel={showGradePanel}
              />
            </div>

            <AnimatePresence>
              {showGradePanel && activeGroup && (
                <QuickGradePanel
                  group={activeGroup}
                  onGrade={(grade, feedback) => { handleGrade(activeGroup.id, grade, feedback); setShowGradePanel(false); }}
                  onClose={() => setShowGradePanel(false)}
                />
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create classroom slide-in */}
      <AnimatePresence>
        {showCreateClassroom && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setShowCreateClassroom(false)} />
            <CreateClassroomPanel onClose={() => setShowCreateClassroom(false)} onCreate={handleCreateClassroom} />
          </>
        )}
        {detailRoom && (
          <RoomDetailDialog
            room={detailRoom} type={detailType} canGrade={detailType === "classgroup"}
            onClose={() => setDetailRoom(null)}
            onGrade={(grade, feedback) => { if (detailRoom) handleGrade(detailRoom.id, grade, feedback); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}