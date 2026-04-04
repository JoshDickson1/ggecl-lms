// src/pages/admin/AdminCreateCourse.tsx
// Route: /admin/courses/create

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Shield, BookOpen, GraduationCap, DollarSign,
  FileText, X, Loader2, CheckCircle2,
  Plus, Trash2, Info, ChevronDown, ChevronUp, Star, Users, Search, UserPlus, Award, Layers,
} from "lucide-react";
import { 
    // courses, 
    instructors 
}  from "@/data/courses";
// import { MANAGED_COURSES } from "@/data/coursesAdminData";

// ─── All students (dummy pool for enrollment) ─────────────────────────────────
const STUDENT_POOL = [
  { id:"stu-001", name:"Zara Adeyemi",  avatar:"ZA", bg:"bg-blue-500",   email:"zara@example.com",  paymentRef:"PAY-001" },
  { id:"stu-002", name:"Kofi Mensah",   avatar:"KM", bg:"bg-emerald-500",email:"kofi@example.com",  paymentRef:"PAY-002" },
  { id:"stu-003", name:"Priya Kumar",   avatar:"PK", bg:"bg-pink-500",   email:"priya@example.com", paymentRef:"PAY-003" },
  { id:"stu-004", name:"James Obi",     avatar:"JO", bg:"bg-violet-500", email:"james@example.com", paymentRef:"PAY-004" },
  { id:"stu-005", name:"Amara Diallo",  avatar:"AD", bg:"bg-amber-500",  email:"amara@example.com", paymentRef:"PAY-005" },
  { id:"stu-006", name:"Chen Wei",      avatar:"CW", bg:"bg-cyan-500",   email:"chen@example.com",  paymentRef:"PAY-006" },
  { id:"stu-007", name:"Fatou Sow",     avatar:"FS", bg:"bg-rose-500",   email:"fatou@example.com", paymentRef:"PAY-007" },
  { id:"stu-008", name:"Tobias Reiter", avatar:"TR", bg:"bg-teal-500",   email:"tobias@example.com",paymentRef:"PAY-008" },
  { id:"stu-009", name:"Yuki Tanaka",   avatar:"YT", bg:"bg-purple-500", email:"yuki@example.com",  paymentRef:"PAY-009" },
  { id:"stu-010", name:"Laila Hassan",  avatar:"LH", bg:"bg-orange-500", email:"laila@example.com", paymentRef:"PAY-010" },
];

const CATEGORIES = ["Development","Marketing","Physics","Business","Health","Music","Writing","Photography","Science","Languages","Astrology","Management"];
const LEVELS = ["Beginner","Intermediate","Advanced","All levels"] as const;
const LESSON_TYPES = ["video","reading","quiz","assignment"] as const;
const GRADIENT_OPTIONS = [
  "from-blue-500 to-cyan-400","from-green-500 to-emerald-400","from-violet-500 to-purple-400",
  "from-rose-500 to-orange-400","from-amber-500 to-yellow-400","from-teal-500 to-emerald-400",
  "from-pink-500 to-rose-400","from-indigo-500 to-blue-400","from-fuchsia-500 to-pink-400",
  "from-sky-500 to-blue-400","from-cyan-500 to-teal-400","from-lime-500 to-green-400",
];

function cn(...c: (string|false|undefined)[]) { return c.filter(Boolean).join(" "); }

// ─── Shared UI atoms ──────────────────────────────────────────────────────────
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-1.5">
      {children}{required && <span className="text-blue-500">*</span>}
    </label>
  );
}
function TextInput({ value, onChange, placeholder, type="text", error }: {
  value:string; onChange:(v:string)=>void; placeholder?:string; type?:string; error?:boolean;
}) {
  const [f,setF]=useState(false);
  return <input type={type} value={value} onChange={e=>onChange(e.target.value)}
    onFocus={()=>setF(true)} onBlur={()=>setF(false)} placeholder={placeholder}
    className={cn("w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all",
      "bg-gray-50/80 dark:bg-white/[0.04] text-gray-800 dark:text-white placeholder:text-gray-400 border",
      error?"border-red-300 dark:border-red-700":f?"border-blue-400 ring-2 ring-blue-500/15":"border-gray-200 dark:border-white/[0.08]"
    )}/>;
}
function TextArea({ value, onChange, placeholder, rows=3, mono }: {
  value:string; onChange:(v:string)=>void; placeholder?:string; rows?:number; mono?:boolean;
}) {
  const [f,setF]=useState(false);
  return <textarea value={value} rows={rows} onChange={e=>onChange(e.target.value)}
    onFocus={()=>setF(true)} onBlur={()=>setF(false)} placeholder={placeholder}
    className={cn("w-full px-4 py-2.5 rounded-xl text-sm resize-none outline-none transition-all",
      "bg-gray-50/80 dark:bg-white/[0.04] text-gray-800 dark:text-white placeholder:text-gray-400 border",
      f?"border-blue-400 ring-2 ring-blue-500/15":"border-gray-200 dark:border-white/[0.08]",
      mono?"font-mono":""
    )}/>;
}
function SectionCard({ icon:Icon, title, description, children, delay=0 }: {
  icon:React.ElementType; title:string; description?:string; children:React.ReactNode; delay?:number;
}) {
  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.38,delay}}
      className="rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="flex items-start gap-3 px-6 py-5 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)] flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-white"/>
        </div>
        <div><h2 className="text-sm font-black text-gray-900 dark:text-white">{title}</h2>
          {description&&<p className="text-xs text-gray-400 mt-0.5">{description}</p>}</div>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

// ─── Lesson row ───────────────────────────────────────────────────────────────
type LessonDraft = { id:string; title:string; type:typeof LESSON_TYPES[number]; duration:string; isFree:boolean };
type SectionDraft = { id:string; title:string; lessons:LessonDraft[] };

function LessonRow({ lesson, onChange, onRemove }: {
  lesson:LessonDraft; onChange:(l:LessonDraft)=>void; onRemove:()=>void;
}) {
  const typeIcon = { video:"▶️", reading:"📖", quiz:"✅", assignment:"📝" }[lesson.type];
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] group">
      <span className="text-base leading-none w-6 text-center flex-shrink-0">{typeIcon}</span>
      <input value={lesson.title} onChange={e=>onChange({...lesson,title:e.target.value})}
        placeholder="Lesson title…"
        className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 text-gray-800 dark:text-white outline-none transition-all"/>
      <select value={lesson.type} onChange={e=>onChange({...lesson,type:e.target.value as typeof LESSON_TYPES[number]})}
        className="px-2 py-1.5 rounded-lg text-xs bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 outline-none cursor-pointer">
        {LESSON_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
      </select>
      <input value={lesson.duration} onChange={e=>onChange({...lesson,duration:e.target.value})}
        placeholder="12:30"
        className="w-16 px-2 py-1.5 rounded-lg text-xs text-center bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] focus:border-blue-400 text-gray-800 dark:text-white outline-none transition-all"/>
      <label className="flex items-center gap-1 cursor-pointer flex-shrink-0">
        <input type="checkbox" checked={lesson.isFree} onChange={e=>onChange({...lesson,isFree:e.target.checked})} className="accent-blue-600"/>
        <span className="text-[10px] text-gray-500 font-semibold">Free</span>
      </label>
      <button onClick={onRemove} className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
        <X className="w-3.5 h-3.5"/>
      </button>
    </div>
  );
}

function SectionBuilder({ sections, onChange }: {
  sections:SectionDraft[]; onChange:(s:SectionDraft[])=>void;
}) {
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const toggle = (id:string) => setCollapsed(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);

  const addSection = () => {
    const id=`s-${Date.now()}`;
    onChange([...sections,{id,title:"New Section",lessons:[]}]);
  };
  const removeSection = (id:string) => onChange(sections.filter(s=>s.id!==id));
  const updateSection = (id:string,title:string) => onChange(sections.map(s=>s.id===id?{...s,title}:s));
  const addLesson = (sId:string) => {
    const l:LessonDraft={id:`l-${Date.now()}`,title:"",type:"video",duration:"",isFree:false};
    onChange(sections.map(s=>s.id===sId?{...s,lessons:[...s.lessons,l]}:s));
  };
  const updateLesson = (sId:string,lesson:LessonDraft) =>
    onChange(sections.map(s=>s.id===sId?{...s,lessons:s.lessons.map(l=>l.id===lesson.id?lesson:l)}:s));
  const removeLesson = (sId:string,lId:string) =>
    onChange(sections.map(s=>s.id===sId?{...s,lessons:s.lessons.filter(l=>l.id!==lId)}:s));

  const totalLessons = sections.reduce((a,s)=>a+s.lessons.length,0);

  return (
    <div className="space-y-3">
      {sections.length>0&&(
        <p className="text-xs text-gray-400">{sections.length} sections · {totalLessons} lessons total</p>
      )}
      {sections.map((sec,si)=>{
        const isOpen=!collapsed.includes(sec.id);
        return (
          <div key={sec.id} className="rounded-2xl border border-gray-200 dark:border-white/[0.08] overflow-hidden">
            {/* Section header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-white/[0.04]">
              <span className="text-xs font-black text-gray-400 w-5">{si+1}.</span>
              <input value={sec.title} onChange={e=>updateSection(sec.id,e.target.value)}
                className="flex-1 text-sm font-bold bg-transparent text-gray-900 dark:text-white outline-none"/>
              <span className="text-[10px] text-gray-400">{sec.lessons.length} lessons</span>
              <button onClick={()=>toggle(sec.id)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors">
                {isOpen?<ChevronUp className="w-3.5 h-3.5"/>:<ChevronDown className="w-3.5 h-3.5"/>}
              </button>
              <button onClick={()=>removeSection(sec.id)} className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors">
                <Trash2 className="w-3.5 h-3.5"/>
              </button>
            </div>
            {/* Lessons */}
            <AnimatePresence initial={false}>
              {isOpen&&(
                <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
                  exit={{height:0,opacity:0}} transition={{duration:0.2}} className="overflow-hidden">
                  <div className="p-3 space-y-2">
                    {sec.lessons.map(lesson=>(
                      <LessonRow key={lesson.id} lesson={lesson}
                        onChange={l=>updateLesson(sec.id,l)}
                        onRemove={()=>removeLesson(sec.id,lesson.id)}/>
                    ))}
                    <button onClick={()=>addLesson(sec.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold
                        border border-dashed border-blue-300 dark:border-blue-700
                        text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
                      <Plus className="w-3 h-3"/> Add Lesson
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      <button onClick={addSection}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold
          border-2 border-dashed border-gray-200 dark:border-white/[0.08]
          text-gray-400 hover:border-blue-300 hover:text-blue-600 dark:hover:border-blue-700 dark:hover:text-blue-400
          transition-all">
        <Plus className="w-4 h-4"/> Add Section
      </button>
    </div>
  );
}

// ─── String list editor (for outcomes / requirements) ─────────────────────────
function StringListEditor({ items, onChange, placeholder }: {
  items:string[]; onChange:(v:string[])=>void; placeholder:string;
}) {
  const add = () => onChange([...items,""]);
  const update = (i:number,v:string) => onChange(items.map((x,xi)=>xi===i?v:x));
  const remove = (i:number) => onChange(items.filter((_,xi)=>xi!==i));
  return (
    <div className="space-y-2">
      {items.map((item,i)=>(
        <div key={i} className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0"/>
          <input value={item} onChange={e=>update(i,e.target.value)} placeholder={placeholder}
            className="flex-1 px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 text-gray-800 dark:text-white outline-none transition-all"/>
          <button onClick={()=>remove(i)} className="text-gray-300 hover:text-red-500 transition-colors">
            <X className="w-3.5 h-3.5"/>
          </button>
        </div>
      ))}
      <button onClick={add}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-dashed border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
        <Plus className="w-3 h-3"/> Add item
      </button>
    </div>
  );
}

// ─── Student enrollment picker ─────────────────────────────────────────────────
function EnrollmentPicker({ enrolled, onChange }: {
  enrolled:string[]; onChange:(ids:string[])=>void;
}) {
  const [search,setSearch]=useState("");
  const [mode,setMode]=useState<"list"|"manual">("list");
  const [manualEmail,setManualEmail]=useState("");

  const filtered=STUDENT_POOL.filter(s=>
    !search.trim()||s.name.toLowerCase().includes(search.toLowerCase())||s.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggle=(id:string)=>onChange(enrolled.includes(id)?enrolled.filter(x=>x!==id):[...enrolled,id]);

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05] w-fit">
        {(["list","manual"] as const).map(m=>(
          <button key={m} onClick={()=>setMode(m)}
            className={cn("px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all",
              mode===m?"bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm":"text-gray-500 hover:text-gray-700"
            )}>{m==="list"?"Pick from list":"Add by email"}</button>
        ))}
      </div>

      {mode==="list"?(
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students by name or email…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 text-gray-800 dark:text-white placeholder:text-gray-400 outline-none transition-all"/>
          </div>
          <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
            {filtered.map(s=>{
              const sel=enrolled.includes(s.id);
              return (
                <button key={s.id} onClick={()=>toggle(s.id)}
                  className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                    sel?"bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40":"border border-transparent hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                  )}>
                  <div className={cn("w-8 h-8 rounded-xl text-[11px] font-black text-white flex items-center justify-center flex-shrink-0",s.bg)}>
                    {s.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{s.name}</p>
                    <p className="text-[10px] text-gray-400">{s.email} · {s.paymentRef}</p>
                  </div>
                  {sel&&<CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0"/>}
                </button>
              );
            })}
          </div>
          {enrolled.length>0&&(
            <div className="pt-2 border-t border-gray-100 dark:border-white/[0.06]">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2">{enrolled.length} student{enrolled.length!==1?"s":""} selected:</p>
              <div className="flex flex-wrap gap-1.5">
                {enrolled.map(id=>{
                  const s=STUDENT_POOL.find(x=>x.id===id);
                  if(!s) return null;
                  return (
                    <span key={id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                      {s.name}
                      <button onClick={()=>toggle(id)}><X className="w-3 h-3"/></button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ):(
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/15 border border-blue-100 dark:border-blue-900/20">
            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5"/>
              Enter student emails manually. Separate multiple emails with commas. Students must already have an account.
            </p>
          </div>
          <TextArea value={manualEmail} onChange={setManualEmail}
            placeholder="student1@email.com, student2@email.com, student3@email.com…" rows={3}/>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_3px_10px_rgba(59,130,246,0.35)] transition-all">
            <UserPlus className="w-4 h-4"/> Add Students
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Success overlay ───────────────────────────────────────────────────────────
function SuccessOverlay({ onDone }: { onDone:()=>void }) {
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:"spring",stiffness:280,delay:0.1}}
        className="rounded-[28px] p-12 text-center bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_24px_80px_rgba(0,0,0,0.2)] max-w-sm w-full mx-4">
        <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:300,delay:0.25}}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-[0_8px_32px_rgba(16,185,129,0.4)]">
          <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={1.5}/>
        </motion.div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Course Created!</h2>
        <p className="text-sm text-gray-400 mb-6">Your course has been published and assigned to the instructor. Enrolled students have been notified.</p>
        <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={onDone}
          className="w-full py-3 rounded-2xl text-sm font-black bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_16px_rgba(59,130,246,0.4)] transition-colors">
          Go to Courses
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
type Errors = Record<string,string>;

export default function AdminCreateCourse() {
  const navigate = useNavigate();

  // Basic info
  const [title,setTitle]         = useState("");
  const [description,setDesc]    = useState("");
  const [longDesc,setLongDesc]   = useState("");
  const [category,setCategory]   = useState("");
  const [level,setLevel]         = useState<typeof LEVELS[number]>("Beginner");
  const [language,setLanguage]   = useState("English");
  const [thumbnail,setThumbnail] = useState(GRADIENT_OPTIONS[0]);
  const [badge,setBadge]         = useState<string>("");
  const [tags,setTags]           = useState<string[]>([]);
  const [tagInput,setTagInput]   = useState("");

  // Instructor
  const [instructorId,setInstructorId] = useState("");

  // Pricing
  const [price,setPrice]         = useState("14.99");
  const [origPrice,setOrigPrice] = useState("89.99");
  const [certificate,setCert]    = useState(true);

  // Curriculum
  const [sections,setSections]   = useState<SectionDraft[]>([]);

  // Outcomes + requirements
  const [outcomes,setOutcomes]   = useState<string[]>(["","",""]);
  const [reqs,setReqs]           = useState<string[]>(["",""]);

  // Enrolled students
  const [enrolled,setEnrolled]   = useState<string[]>([]);

  // Status
  const [status,setStatus]       = useState<"published"|"draft">("published");
  const [errors,setErrors]       = useState<Errors>({});
  const [saving,setSaving]       = useState(false);
  const [success,setSuccess]     = useState(false);

  const addTag = () => {
    const t=tagInput.trim();
    if(t&&!tags.includes(t)) { setTags(p=>[...p,t]); setTagInput(""); }
  };

  const validate = ():boolean => {
    const e:Errors={};
    if(!title.trim())       e.title="Course title is required";
    if(!category)           e.category="Category is required";
    if(!instructorId)       e.instructor="Please assign an instructor";
    if(!description.trim()) e.description="Short description is required";
    if(!price||isNaN(+price)) e.price="Valid price is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handlePublish = () => {
    if(!validate()) return;
    setSaving(true);
    setTimeout(()=>{ setSaving(false); setSuccess(true); },1800);
  };

  const selectedInstructor = instructors.find(i=>i.id===instructorId);
  const totalLessonsCount  = sections.reduce((a,s)=>a+s.lessons.length,0);

  return (
    <>
      <div className="max-w-[900px] mx-auto space-y-6 pb-16">

        {/* Header */}
        <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}>
          <Link to="/admin/courses" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4"/> Back to Courses
          </Link>
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-[0_6px_20px_rgba(59,130,246,0.4)] flex-shrink-0">
              <Shield className="w-6 h-6 text-white"/>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                  Create <span className="text-blue-600 dark:text-blue-400">Course</span>
                </h1>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5"/> Admin
                </span>
              </div>
              <p className="text-sm text-gray-400">Build a complete course, assign to an instructor, and enroll students who have paid.</p>
            </div>
          </div>
        </motion.div>

        {/* ── 1. Instructor ── */}
        <SectionCard icon={GraduationCap} title="Assign Instructor" description="Who will teach this course?" delay={0.05}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label required>Instructor</Label>
              <select value={instructorId} onChange={e=>setInstructorId(e.target.value)}
                className={cn("w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50/80 dark:bg-white/[0.04] border text-gray-800 dark:text-white outline-none cursor-pointer",
                  errors.instructor?"border-red-300 dark:border-red-700":"border-gray-200 dark:border-white/[0.08]")}>
                <option value="">Select instructor…</option>
                {instructors.map(i=><option key={i.id} value={i.id}>{i.name} — {i.title}</option>)}
              </select>
              {errors.instructor&&<p className="text-xs text-red-500 mt-1">{errors.instructor}</p>}
            </div>
            {selectedInstructor&&(
              <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}}
                className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06]">
                <div className={cn("w-10 h-10 rounded-xl text-sm font-black text-white flex items-center justify-center flex-shrink-0",selectedInstructor.avatarBg)}>
                  {selectedInstructor.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedInstructor.name}</p>
                  <p className="text-xs text-gray-400">{selectedInstructor.title}</p>
                  <p className="text-[10px] text-gray-400">⭐ {selectedInstructor.rating} · {selectedInstructor.courses} courses</p>
                </div>
              </motion.div>
            )}
          </div>
        </SectionCard>

        {/* ── 2. Basic info ── */}
        <SectionCard icon={FileText} title="Course Details" description="Title, category, and core information" delay={0.08}>
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>Course Title</Label>
                <TextInput value={title} onChange={setTitle} placeholder="e.g. The Complete React & TypeScript Bootcamp" error={!!errors.title}/>
                {errors.title&&<p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>
              <div>
                <Label required>Category</Label>
                <select value={category} onChange={e=>setCategory(e.target.value)}
                  className={cn("w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50/80 dark:bg-white/[0.04] border text-gray-800 dark:text-white outline-none cursor-pointer",
                    errors.category?"border-red-300":"border-gray-200 dark:border-white/[0.08]")}>
                  <option value="">Select category…</option>
                  {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category&&<p className="text-xs text-red-500 mt-1">{errors.category}</p>}
              </div>
              <div>
                <Label required>Level</Label>
                <select value={level} onChange={e=>setLevel(e.target.value as typeof LEVELS[number])}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50/80 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white outline-none cursor-pointer">
                  {LEVELS.map(l=><option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <Label>Language</Label>
                <TextInput value={language} onChange={setLanguage} placeholder="English"/>
              </div>
            </div>

            <div>
              <Label required>Short Description</Label>
              <TextArea value={description} onChange={setDesc} placeholder="One paragraph that sells the course…" rows={2}/>
              {errors.description&&<p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>
            <div>
              <Label>Full Description</Label>
              <TextArea value={longDesc} onChange={setLongDesc} placeholder="Detailed course description shown on the course page…" rows={5}/>
            </div>

            {/* Badge */}
            <div>
              <Label>Badge</Label>
              <div className="flex gap-2 flex-wrap">
                {["","Bestseller","Hot & New","New"].map(b=>(
                  <button key={b} onClick={()=>setBadge(b)}
                    className={cn("px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                      badge===b?"bg-blue-600 text-white border-blue-600":"border-gray-200 dark:border-white/[0.08] text-gray-500 hover:border-blue-300 hover:text-blue-600"
                    )}>{b||"No badge"}</button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 flex-wrap mb-2">
                {tags.map(t=>(
                  <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                    {t}<button onClick={()=>setTags(p=>p.filter(x=>x!==t))}><X className="w-3 h-3"/></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <TextInput value={tagInput} onChange={setTagInput} placeholder="Add a tag…"/>
                <button onClick={addTag} className="px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all flex-shrink-0">Add</button>
              </div>
            </div>

            {/* Thumbnail gradient */}
            <div>
              <Label>Course Thumbnail Colour</Label>
              <div className="flex flex-wrap gap-2">
                {GRADIENT_OPTIONS.map(g=>(
                  <button key={g} onClick={()=>setThumbnail(g)}
                    className={cn("w-10 h-10 rounded-xl bg-gradient-to-br transition-all",g,
                      thumbnail===g?"ring-2 ring-blue-600 ring-offset-2 scale-110":"hover:scale-105")}/>
                ))}
              </div>
              {/* Preview */}
              <div className={cn("mt-3 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center",thumbnail)}>
                <BookOpen className="w-6 h-6 text-white drop-shadow"/>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── 3. Pricing ── */}
        <SectionCard icon={DollarSign} title="Pricing & Access" delay={0.11}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label required>Sale Price (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">$</span>
                <TextInput value={price} onChange={setPrice} placeholder="14.99" error={!!errors.price}/>
              </div>
              {errors.price&&<p className="text-xs text-red-500 mt-1">{errors.price}</p>}
            </div>
            <div>
              <Label>Original Price (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">$</span>
                <TextInput value={origPrice} onChange={setOrigPrice} placeholder="89.99"/>
              </div>
              {price&&origPrice&&+origPrice>+price&&(
                <p className="text-[11px] text-emerald-500 mt-1">
                  {Math.round((+origPrice-+price)/+origPrice*100)}% discount displayed
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 pt-6">
              <button onClick={()=>setCert(p=>!p)}
                className={cn("relative w-12 h-6 rounded-full transition-all",certificate?"bg-blue-600":"bg-gray-200 dark:bg-white/[0.1]")}>
                <motion.div animate={{x:certificate?24:2}} transition={{type:"spring",stiffness:500,damping:30}}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"/>
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-blue-500"/> Certificate on completion
              </span>
            </div>
          </div>

          {/* Publish status */}
          <div className="mt-5">
            <Label>Publication Status</Label>
            <div className="flex gap-2">
              {(["published","draft"] as const).map(s=>(
                <button key={s} onClick={()=>setStatus(s)}
                  className={cn("px-4 py-2 rounded-xl text-sm font-bold capitalize border transition-all",
                    status===s?"bg-blue-600 text-white border-blue-600":"border-gray-200 dark:border-white/[0.08] text-gray-500 hover:border-blue-300"
                  )}>{s}</button>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ── 4. Learning outcomes ── */}
        <SectionCard icon={Star} title="What Students Will Learn" description="List the key outcomes and skills students gain" delay={0.14}>
          <StringListEditor items={outcomes} onChange={setOutcomes} placeholder="e.g. Build production-ready React applications"/>
        </SectionCard>

        {/* ── 5. Requirements ── */}
        <SectionCard icon={CheckCircle2} title="Requirements & Prerequisites" delay={0.17}>
          <StringListEditor items={reqs} onChange={setReqs} placeholder="e.g. Basic JavaScript knowledge"/>
        </SectionCard>

        {/* ── 6. Curriculum ── */}
        <SectionCard icon={Layers} title="Course Curriculum" description={`${sections.length} sections · ${totalLessonsCount} lessons`} delay={0.2}>
          <SectionBuilder sections={sections} onChange={setSections}/>
        </SectionCard>

        {/* ── 7. Enroll students ── */}
        <SectionCard icon={Users} title="Enroll Students" description="Enroll students who have already paid for this course" delay={0.23}>
          <EnrollmentPicker enrolled={enrolled} onChange={setEnrolled}/>
        </SectionCard>

        {/* ── Publish bar ── */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.38,delay:0.26}}
          className="rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500"/>
          <div className="p-6">
            <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-4">Summary</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                {label:"Title",     value:title||"—"},
                {label:"Instructor",value:selectedInstructor?.name.split(" ")[0]||"—"},
                {label:"Sections",  value:`${sections.length} (${totalLessonsCount} lessons)`},
                {label:"Enrolled",  value:`${enrolled.length} students`},
              ].map(({label,value})=>(
                <div key={label} className="rounded-2xl p-3 bg-gray-50/80 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                  <p className="text-xs font-black text-gray-900 dark:text-white truncate">{value}</p>
                </div>
              ))}
            </div>
            {Object.keys(errors).length>0&&(
              <div className="mb-4 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                <p className="text-xs font-bold text-red-600 mb-1.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5"/> Fix before publishing:
                </p>
                {Object.values(errors).filter(Boolean).map(e=>(
                  <p key={e} className="text-xs text-red-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-red-400"/>{e}
                  </p>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <Link to="/admin/courses" className="flex-1 py-3 rounded-2xl text-sm font-bold text-center border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-all">
                Cancel
              </Link>
              <motion.button whileHover={!saving?{scale:1.02,boxShadow:"0 10px 32px rgba(59,130,246,0.5)"}:{}} whileTap={{scale:0.97}}
                onClick={handlePublish} disabled={saving}
                className={cn("flex-[2] py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2.5 transition-all",
                  saving?"bg-blue-400 cursor-wait text-white":"bg-blue-600 hover:bg-blue-500 text-white shadow-[0_6px_24px_rgba(59,130,246,0.42)]"
                )}>
                {saving?<><Loader2 className="w-4 h-4 animate-spin"/>Creating…</>:<><Shield className="w-4 h-4"/>{status==="published"?"Publish Course":"Save as Draft"}</>}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {success&&<SuccessOverlay onDone={()=>navigate("/admin/courses")}/>}
      </AnimatePresence>
    </>
  );
}