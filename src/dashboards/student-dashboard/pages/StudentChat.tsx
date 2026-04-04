// src/dashboards/student/pages/StudentChat.tsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, Users, Award, Info, ChevronDown, Star } from "lucide-react";
import {
  MOCK_CLASSROOMS, MOCK_CLASSGROUPS,
  CLASSROOM_MESSAGES, CLASSGROUP_MESSAGES,
  ME,
  type ChatMessage, type Classroom, type ClassGroup,
} from "@/data/chatData";
import type { LetterGrade } from "@/data/academicData";
// import { GRADE_META } from "@/data/academicData";
import {
  Card, ChatBubble, GradeBadge, GradePanel,
  MessageInput, RoomDetailDialog
} from "@/data/ChatShare";

// Student only sees rooms they belong to
const MY_ID = ME.id;
const myClassrooms = MOCK_CLASSROOMS.filter(c =>
  c.students.some(s => s.id === MY_ID) || c.instructors.some(i => i.id === MY_ID)
);
const myGroups = MOCK_CLASSGROUPS.filter(g => g.members.some(m => m.id === MY_ID));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay }}>
      {children}
    </motion.div>
  );
}

// ─── Classroom Card ───────────────────────────────────────────────────────────

function ClassroomCard({ room, onClick }: { room: Classroom; onClick: () => void }) {
  const memberCount = room.students.length + room.instructors.length;
  return (
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={onClick} className="cursor-pointer">
      <Card className="p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${room.color} flex items-center justify-center text-2xl flex-shrink-0 shadow-md`}>
            {room.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{room.name}</h3>
            <p className="text-xs text-gray-400 truncate mt-0.5">{room.description}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{memberCount} members</span>
              <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{room.totalMessages} messages</span>
            </div>
          </div>
          <ChevronDown className="-rotate-90 w-4 h-4 text-gray-400 flex-shrink-0" />
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Group Card ───────────────────────────────────────────────────────────────

function GroupCard({ group, onClick }: { group: ClassGroup; onClick: () => void }) {
  return (
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={onClick} className="cursor-pointer">
      <Card className="p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${group.color} flex items-center justify-center text-2xl flex-shrink-0 shadow-md`}>
            {group.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{group.name}</h3>
              {group.grade && <GradeBadge grade={group.grade} />}
            </div>
            <p className="text-xs text-gray-400 truncate">{group.classroomName}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{group.members.length} members</span>
              <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{group.totalMessages} messages</span>
            </div>
          </div>
          <ChevronDown className="-rotate-90 w-4 h-4 text-gray-400 flex-shrink-0" />
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Chat View ────────────────────────────────────────────────────────────────

function ChatView({
//   roomId, 
  roomType, roomName, roomColor, roomIcon,
  members, messages, onSend, onBack, onInfo,
  groupGrade, onReact, onPin, onDelete,
}: {
  roomId: string; roomType: "classroom" | "classgroup";
  roomName: string; roomColor: string; roomIcon: string;
  members: any[]; messages: ChatMessage[];
  onSend: (text: string, files: File[]) => void;
  onBack: () => void; onInfo: () => void;
  groupGrade?: LetterGrade;
  onReact: (msgId: string, emoji: string) => void;
  onPin: (msgId: string) => void;
  onDelete: (msgId: string) => void;
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
        {groupGrade && <GradeBadge grade={groupGrade} />}
        <button onClick={onInfo} className="p-2 rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all" title="Room info">
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-2">
        {messages.map((msg, i) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            isMe={msg.senderId === MY_ID}
            prevSenderId={i > 0 ? messages[i - 1].senderId : undefined}
            canPin={false}
            canDelete={msg.senderId === MY_ID}
            onReply={() => setReplyTo(msg)}
            onReact={onReact}
            onPin={onPin}
            onDelete={onDelete}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        onSend={(text, files) => { onSend(text, files); setReplyTo(null); }}
        members={members}
      />
    </div>
  );
}

// ─── Grade Sidebar (read-only for student) ────────────────────────────────────

function GradeSidebar({ group, onClose }: { group: ClassGroup; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.22 }}
      className="w-72 flex-shrink-0 border-l border-gray-100 dark:border-white/[0.07] bg-white dark:bg-[#0f1623] flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.07]">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          <h3 className="font-black text-sm text-gray-900 dark:text-white">Group Grade</h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all">
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <GradePanel group={group} />
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StudentChat() {
  const [tab, setTab] = useState<"classrooms" | "classgroups">("classrooms");
  const [activeRoom, setActiveRoom] = useState<{ id: string; type: "classroom" | "classgroup" } | null>(null);
  const [classroomMsgs, setClassroomMsgs] = useState<Record<string, ChatMessage[]>>(CLASSROOM_MESSAGES);
  const [groupMsgs, setGroupMsgs] = useState<Record<string, ChatMessage[]>>(CLASSGROUP_MESSAGES);
  const [detailRoom, setDetailRoom] = useState<Classroom | ClassGroup | null>(null);
  const [detailType, setDetailType] = useState<"classroom" | "classgroup">("classroom");
  const [showGrade, setShowGrade] = useState(false);

  const activeClassroom = activeRoom?.type === "classroom" ? myClassrooms.find(c => c.id === activeRoom.id) : null;
  const activeGroup = activeRoom?.type === "classgroup" ? myGroups.find(g => g.id === activeRoom.id) : null;

  const messages = activeRoom
    ? (activeRoom.type === "classroom" ? classroomMsgs[activeRoom.id] ?? [] : groupMsgs[activeRoom.id] ?? [])
    : [];

  const handleSend = (text: string, files: File[]) => {
    if (!activeRoom) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`, roomId: activeRoom.id,
      senderId: ME.id, senderName: ME.name, senderAvatar: ME.avatar, senderAvatarBg: ME.avatarBg, senderRole: ME.role,
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

  const handleDelete = (msgId: string) => {
    const update = (msgs: ChatMessage[]) => msgs.map(m => m.id === msgId ? { ...m, isDeleted: true } : m);
    if (activeRoom?.type === "classroom") setClassroomMsgs(p => ({ ...p, [activeRoom.id]: update(p[activeRoom.id] ?? []) }));
    else if (activeRoom?.type === "classgroup") setGroupMsgs(p => ({ ...p, [activeRoom.id]: update(p[activeRoom.id] ?? []) }));
  };

  const currentMembers = activeClassroom
    ? [...activeClassroom.instructors, ...activeClassroom.students]
    : activeGroup?.members ?? [];

  return (
    <>
      <div className="h-[calc(100vh-80px)] flex flex-col max-w-[1100px] mx-auto">

        {/* If no active room — show list */}
        {!activeRoom ? (
          <div className="flex-1 overflow-y-auto space-y-6 pb-10">
            {/* Header */}
            <Fade>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
                  <Hash className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white">Chat</h1>
                  <p className="text-xs text-gray-400">Your classrooms and groups</p>
                </div>
              </div>
            </Fade>

            {/* Tabs */}
            <Fade delay={0.04}>
              <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit">
                {[
                  { id: "classrooms", label: `Classrooms (${myClassrooms.length})` },
                  { id: "classgroups", label: `Classgroups (${myGroups.length})` },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id as any)}
                    className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${tab === t.id ? "bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </Fade>

            <AnimatePresence mode="wait">
              {tab === "classrooms" && (
                <motion.div key="cls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {myClassrooms.map((c, i) => (
                    <Fade key={c.id} delay={i * 0.05}>
                      <ClassroomCard room={c} onClick={() => setActiveRoom({ id: c.id, type: "classroom" })} />
                    </Fade>
                  ))}
                </motion.div>
              )}
              {tab === "classgroups" && (
                <motion.div key="grp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {myGroups.length === 0 && (
                    <Card className="p-10 text-center">
                      <Users className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">You haven't been added to any classgroup yet.</p>
                    </Card>
                  )}
                  {myGroups.map((g, i) => (
                    <Fade key={g.id} delay={i * 0.05}>
                      <GroupCard group={g} onClick={() => setActiveRoom({ id: g.id, type: "classgroup" })} />
                    </Fade>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Chat view */
          <div className="flex-1 flex overflow-hidden rounded-2xl border border-gray-100 dark:border-white/[0.07] bg-white dark:bg-[#0f1623]">
            <div className="flex-1 flex flex-col overflow-hidden">
              <ChatView
                roomId={activeRoom.id}
                roomType={activeRoom.type}
                roomName={activeClassroom?.name ?? activeGroup?.name ?? ""}
                roomColor={activeClassroom?.color ?? activeGroup?.color ?? "from-blue-600 to-indigo-700"}
                roomIcon={activeClassroom?.icon ?? activeGroup?.icon ?? "💬"}
                members={currentMembers}
                messages={messages}
                onSend={handleSend}
                onBack={() => { setActiveRoom(null); setShowGrade(false); }}
                onInfo={() => {
                  setDetailRoom(activeClassroom ?? activeGroup ?? null);
                  setDetailType(activeRoom.type);
                }}
                groupGrade={activeGroup?.grade}
                onReact={handleReact}
                onPin={() => {}}
                onDelete={handleDelete}
              />
            </div>

            {/* Grade sidebar — only for groups */}
            <AnimatePresence>
              {showGrade && activeGroup && (
                <GradeSidebar group={activeGroup} onClose={() => setShowGrade(false)} />
              )}
            </AnimatePresence>

            {/* Show grade button — floating inside chat for group rooms */}
            {activeRoom.type === "classgroup" && activeGroup?.grade && !showGrade && (
              <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                onClick={() => setShowGrade(true)}
                className="absolute bottom-20 right-6 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg hover:opacity-90 transition-all z-10">
                <Star className="w-4 h-4" />View Grade
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <AnimatePresence>
        {detailRoom && (
          <RoomDetailDialog
            room={detailRoom}
            type={detailType}
            canGrade={false}
            onClose={() => setDetailRoom(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}