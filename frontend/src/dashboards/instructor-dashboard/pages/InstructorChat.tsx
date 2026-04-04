// src/dashboards/instructor/pages/InstructorChat.tsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hash, Users, Award, Info, ChevronDown, Plus,
  CheckCircle2, X,
} from "lucide-react";
import {
  MOCK_CLASSROOMS, MOCK_CLASSGROUPS,
  CLASSROOM_MESSAGES, CLASSGROUP_MESSAGES,
  ME as _STUDENT_ME,
  type ChatMessage, type Classroom, type ClassGroup, type ClassroomMember,
} from "@/data/chatData";
import type { LetterGrade } from "@/data/academicData";
// import { GRADE_META } from "@/data/academicData";
import {
  Card, ChatBubble, GradeBadge, QuickGradePanel,
  MessageInput, RoomDetailDialog,
} from "@/data/ChatShare";

// ─── Instructor identity ───────────────────────────────────────────────────────
const ME: ClassroomMember = {
  id: "ins-001",
  name: "Sarah Mitchell",
  avatar: "SM",
  avatarBg: "bg-gradient-to-br from-blue-600 to-indigo-600",
  role: "instructor",
  isOnline: true,
  joinedAt: "2024-01-01T08:00:00Z",
};

const myClassrooms = MOCK_CLASSROOMS.filter(c => c.instructors.some(i => i.id === ME.id));
const myGroups = MOCK_CLASSGROUPS.filter(g => g.members.some(m => m.id === ME.id));

// ─── Create Group Panel ───────────────────────────────────────────────────────

function CreateGroupPanel({
  classrooms, onClose, onCreate,
}: {
  classrooms: Classroom[];
  onClose: () => void;
  onCreate: (group: ClassGroup) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [classroomId, setClassroomId] = useState(classrooms[0]?.id ?? "");
  const [color, setColor] = useState("from-blue-500 to-indigo-600");
  const [icon, setIcon] = useState("💬");
  const [success, setSuccess] = useState(false);

  const COLORS = [
    "from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600",
    "from-violet-500 to-purple-600", "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600", "from-cyan-500 to-sky-600",
  ];
  const ICONS = ["💬", "🔵", "🟢", "🟣", "🔴", "⭐", "🚀", "🔥", "💡", "🎯"];

  const handleCreate = () => {
    if (!name.trim() || !classroomId) return;
    const classroom = classrooms.find(c => c.id === classroomId)!;
    const newGroup: ClassGroup = {
      id: `grp-${Date.now()}`,
      classroomId, classroomName: classroom.name,
      name: name.trim(), description: description.trim(),
      color, icon,
      createdBy: ME.id, createdByRole: "instructor",
      createdAt: new Date().toISOString(),
      members: [ME, ...classroom.students.slice(0, 3)],
      pinnedMessageIds: [], isArchived: false, totalMessages: 0,
    };
    onCreate(newGroup);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); onClose(); }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.22 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-[#0f1623] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/[0.08] overflow-hidden">

        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.07] flex items-center justify-between">
          <h2 className="font-black text-gray-900 dark:text-white">Create Classgroup</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-12 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <p className="font-black text-gray-900 dark:text-white text-lg">Group created!</p>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            {/* Classroom */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Classroom</label>
              <select value={classroomId} onChange={e => setClassroomId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Group Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Delta Squad"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Description <span className="font-normal text-gray-400">(optional)</span></label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                placeholder="What is this group for?"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-xl bg-gradient-to-br ${c} transition-all ${color === c ? "ring-2 ring-offset-2 ring-blue-500 scale-110" : ""}`} />
                ))}
              </div>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">Icon</label>
              <div className="flex gap-2 flex-wrap">
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => setIcon(ic)}
                    className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all ${icon === ic ? "bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500 scale-110" : "bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1]"}`}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleCreate} disabled={!name.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:opacity-90 disabled:opacity-40 transition-all shadow-md">
              <Plus className="w-4 h-4" />Create Classgroup
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Chat View (instructor version — can pin, delete any, grade) ───────────────

function ChatView({
  roomType, roomName, roomColor, roomIcon,
  members, messages, onSend, onBack, onInfo, activeGroup,
  onReact, onPin, onDelete, onShowGrade, showGradePanel,
//   groups, onGrade,
}: {
  roomId: string; roomType: "classroom" | "classgroup";
  roomName: string; roomColor: string; roomIcon: string;
  members: any[]; messages: ChatMessage[];
  onSend: (text: string, files: File[]) => void;
  onBack: () => void; onInfo: () => void;
  activeGroup?: ClassGroup;
  onReact: (msgId: string, emoji: string) => void;
  onPin: (msgId: string) => void;
  onDelete: (msgId: string) => void;
  onShowGrade: () => void;
  showGradePanel: boolean;
  groups: ClassGroup[];
  onGrade: (groupId: string, grade: LetterGrade, feedback: string) => void;
}) {
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
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
        {roomType === "classgroup" && (
          <button onClick={onShowGrade}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${showGradePanel ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700" : "border-gray-200 dark:border-white/[0.07] text-gray-500 hover:border-amber-300 hover:text-amber-600"}`}>
            <Award className="w-3.5 h-3.5" />{activeGroup?.grade ? "Grade" : "Grade"}
          </button>
        )}
        <button onClick={onInfo} className="p-2 rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
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

// ─── Instructor Room Card (reused) ────────────────────────────────────────────

function RoomCard({ name, description, icon, color, memberCount, msgCount, grade, onClick }: {
  name: string; description: string; icon: string; color: string;
  memberCount: number; msgCount: number; grade?: LetterGrade; onClick: () => void;
}) {
  return (
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={onClick} className="cursor-pointer">
      <Card className="p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl flex-shrink-0 shadow-md`}>{icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{name}</h3>
              {grade && <GradeBadge grade={grade} />}
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

export default function InstructorChat() {
  const [tab, setTab] = useState<"classrooms" | "classgroups">("classrooms");
  const [activeRoom, setActiveRoom] = useState<{ id: string; type: "classroom" | "classgroup" } | null>(null);
  const [classroomMsgs, setClassroomMsgs] = useState<Record<string, ChatMessage[]>>(CLASSROOM_MESSAGES);
  const [groupMsgs, setGroupMsgs] = useState<Record<string, ChatMessage[]>>(CLASSGROUP_MESSAGES);
  const [groups, setGroups] = useState<ClassGroup[]>(myGroups);
  const [showCreate, setShowCreate] = useState(false);
  const [showGradePanel, setShowGradePanel] = useState(false);
  const [detailRoom, setDetailRoom] = useState<Classroom | ClassGroup | null>(null);
  const [detailType, setDetailType] = useState<"classroom" | "classgroup">("classroom");

  const activeClassroom = activeRoom?.type === "classroom" ? myClassrooms.find(c => c.id === activeRoom.id) : null;
  const activeGroup = activeRoom?.type === "classgroup" ? groups.find(g => g.id === activeRoom.id) : null;

  const messages = activeRoom
    ? (activeRoom.type === "classroom" ? classroomMsgs[activeRoom.id] ?? [] : groupMsgs[activeRoom.id] ?? [])
    : [];

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
    setGroups(p => p.map(g => g.id === groupId ? { ...g, grade, gradeFeedback: feedback, gradedBy: ME.name, gradedByRole: "instructor", gradedAt: new Date().toISOString() } : g));
  };

  const handleCreateGroup = (group: ClassGroup) => {
    setGroups(p => [group, ...p]);
    setGroupMsgs(p => ({ ...p, [group.id]: [] }));
  };

  const currentMembers = activeClassroom
    ? [...activeClassroom.instructors, ...activeClassroom.students]
    : activeGroup?.members ?? [];

  return (
    <>
      <div className="h-[calc(100vh-80px)] flex flex-col max-w-[1100px] mx-auto">
        {!activeRoom ? (
          <div className="flex-1 overflow-y-auto space-y-6 pb-10">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-md">
                  <Hash className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white">Chat</h1>
                  <p className="text-xs text-gray-400">Manage your classrooms and groups</p>
                </div>
              </div>
              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-violet-600 to-purple-700 hover:opacity-90 transition-all shadow-md">
                <Plus className="w-4 h-4" />New Group
              </button>
            </motion.div>

            <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit">
              {[
                { id: "classrooms", label: `Classrooms (${myClassrooms.length})` },
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
                  {myClassrooms.map((c, i) => (
                    <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <RoomCard name={c.name} description={c.description} icon={c.icon} color={c.color}
                        memberCount={c.students.length + c.instructors.length} msgCount={c.totalMessages}
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
                roomId={activeRoom.id} roomType={activeRoom.type}
                roomName={activeClassroom?.name ?? activeGroup?.name ?? ""}
                roomColor={activeClassroom?.color ?? activeGroup?.color ?? "from-violet-600 to-purple-700"}
                roomIcon={activeClassroom?.icon ?? activeGroup?.icon ?? "💬"}
                members={currentMembers} messages={messages}
                onSend={handleSend}
                onBack={() => { setActiveRoom(null); setShowGradePanel(false); }}
                onInfo={() => { setDetailRoom(activeClassroom ?? activeGroup ?? null); setDetailType(activeRoom.type); }}
                // activeGroup={activeGroup}
                onReact={handleReact} onPin={handlePin} onDelete={handleDelete}
                onShowGrade={() => setShowGradePanel(p => !p)}
                showGradePanel={showGradePanel}
                groups={groups} onGrade={handleGrade}
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

      <AnimatePresence>
        {showCreate && (
          <CreateGroupPanel classrooms={myClassrooms} onClose={() => setShowCreate(false)} onCreate={handleCreateGroup} />
        )}
        {detailRoom && (
          <RoomDetailDialog
            room={detailRoom} type={detailType}
            canGrade={detailType === "classgroup"}
            onClose={() => setDetailRoom(null)}
            onGrade={(grade, feedback) => {
              if (detailRoom && detailType === "classgroup") handleGrade(detailRoom.id, grade, feedback);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}