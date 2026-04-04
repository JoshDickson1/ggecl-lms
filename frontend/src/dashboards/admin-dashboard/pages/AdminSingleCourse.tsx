// src/pages/admin/AdminSingleCourse.tsx
// Route: /admin/courses/:id

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Edit3, Trash2, Globe, Archive, EyeOff,
  Users, Star, DollarSign, BookOpen, Award,
  CheckCircle2, ChevronDown, Target, BarChart3,
  UserMinus, Search, AlignLeft,
} from "lucide-react";
import {
  MANAGED_COURSES, STATUS_META, LESSON_TYPE_META, fmtRevenue, fmt, totalLessons, totalDuration,
  type CourseStatus, type ManagedCourse,
} from "@/data/coursesAdminData";

function cn(...c:(string|false|undefined)[]) { return c.filter(Boolean).join(" "); }
function Card({children,className=""}:{children:React.ReactNode;className?:string}) {
  return <div className={`rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}>{children}</div>;
}
function Fade({children,delay=0}:{children:React.ReactNode;delay?:number}) {
  return <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:0.36,delay}}>{children}</motion.div>;
}
function SHead({icon:Icon,title}:{icon:React.ElementType;title:string}) {
  return (
    <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-white/[0.06]">
      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)]">
        <Icon className="w-3.5 h-3.5 text-white"/>
      </div>
      <h2 className="text-sm font-black text-gray-900 dark:text-white">{title}</h2>
    </div>
  );
}

// ─── Confirm delete modal ─────────────────────────────────────────────────────
function ConfirmDeleteModal({course,onConfirm,onClose}:{course:ManagedCourse;onConfirm:()=>void;onClose:()=>void}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm"/>
      <motion.div initial={{opacity:0,scale:0.95,y:16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95}}
        className="relative rounded-[24px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_24px_80px_rgba(0,0,0,0.25)] p-8 max-w-sm w-full z-10 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-8 h-8 text-red-500"/>
        </div>
        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Delete Course?</h3>
        <p className="text-sm text-gray-400 mb-6">
          <strong className="text-gray-700 dark:text-gray-300">"{course.title}"</strong> and all its data will be permanently deleted. {course.students>0&&`${fmt(course.students)} students will lose access.`}
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-all">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-black bg-red-600 hover:bg-red-700 text-white shadow-[0_4px_12px_rgba(239,68,68,0.35)] transition-all">Delete Course</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Students tab ─────────────────────────────────────────────────────────────
function StudentsTab({course,onChange}:{course:ManagedCourse;onChange:(c:ManagedCourse)=>void}) {
  const [search,setSearch]=useState("");
  const students=course.enrolledStudents.filter(s=>
    !search.trim()||s.studentName.toLowerCase().includes(search.toLowerCase())||s.email.toLowerCase().includes(search.toLowerCase())
  );
  const removeStudent=(id:string)=>onChange({...course,enrolledStudents:course.enrolledStudents.filter(s=>s.studentId!==id),students:course.students-1});

  return (
    <div className="p-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search enrolled students…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all"/>
      </div>

      {students.length===0?(
        <div className="py-12 text-center">
          <Users className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-2"/>
          <p className="text-sm text-gray-400">No enrolled students</p>
        </div>
      ):(
        <div className="flex flex-col gap-3">
          {students.map((s,i)=>(
            <motion.div key={s.studentId} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
              className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-white/[0.07] hover:border-blue-200 dark:hover:border-blue-800/40 transition-all group">
              <div className={cn("w-10 h-10 rounded-xl text-sm font-black text-white flex items-center justify-center flex-shrink-0",s.studentAvatarBg)}>
                {s.studentAvatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{s.studentName}</p>
                  {s.certificateIssued&&<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 flex items-center gap-1"><Award className="w-2.5 h-2.5"/>Certified</span>}
                  {s.isLate&&<span className="text-[10px] font-bold text-orange-500">Late</span>}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">{s.email} · {s.paymentRef}</p>
              </div>
              {/* Progress */}
              <div className="flex-shrink-0 w-32 hidden sm:block">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>{s.completedLessons}/{s.totalLessons} lessons</span>
                  <span>{s.progressPct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                  <motion.div initial={{width:0}} animate={{width:`${s.progressPct}%`}} transition={{duration:0.7,delay:i*0.05}}
                    className={cn("h-full rounded-full",s.progressPct===100?"bg-emerald-500":s.progressPct>60?"bg-blue-500":"bg-amber-500")}/>
                </div>
                <p className="text-[9px] text-gray-400 mt-1">Last active {new Date(s.lastActive).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</p>
              </div>
              <button onClick={()=>removeStudent(s.studentId)}
                className="w-8 h-8 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-300 hover:text-red-500 hover:border-red-300 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                <UserMinus className="w-3.5 h-3.5"/>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Curriculum tab ───────────────────────────────────────────────────────────
function CurriculumTab({course}:{course:ManagedCourse}) {
  const [openSections,setOpen]=useState<string[]>([course.sections[0]?.id]);
  const toggle=(id:string)=>setOpen(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const lessons=totalLessons(course);
  const dur=totalDuration(course);

  return (
    <div className="p-6 space-y-3">
      <p className="text-xs text-gray-400 mb-4">{course.sections.length} sections · {lessons} lessons · {dur} total</p>
      {course.sections.map((sec,si)=>{
        const isOpen=openSections.includes(sec.id);
        return (
          <div key={sec.id} className="rounded-2xl border border-gray-100 dark:border-white/[0.07] overflow-hidden">
            <button onClick={()=>toggle(sec.id)}
              className="w-full flex items-center gap-3 px-5 py-4 bg-gray-50/80 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors text-left">
              <span className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center flex-shrink-0">{si+1}</span>
              <span className="flex-1 text-sm font-bold text-gray-900 dark:text-white">{sec.title}</span>
              <span className="text-xs text-gray-400">{sec.lessons.length} lessons</span>
              <motion.div animate={{rotate:isOpen?180:0}} transition={{duration:0.2}}>
                <ChevronDown className="w-4 h-4 text-gray-400"/>
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {isOpen&&(
                <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.22}} className="overflow-hidden">
                  <div className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                    {sec.lessons.map((lesson)=>{
                      const lm=LESSON_TYPE_META[lesson.type];
                      return (
                        <div key={lesson.id} className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-transparent">
                          <span className="text-base leading-none w-6 text-center flex-shrink-0">{lm.icon}</span>
                          <span className={cn("flex-1 text-sm",lesson.isFree?"text-blue-600 dark:text-blue-400 font-medium":"text-gray-600 dark:text-gray-400")}>
                            {lesson.title}
                            {lesson.isFree&&<span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-600">FREE</span>}
                          </span>
                          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full",lm.color,"bg-gray-50 dark:bg-white/[0.04]")}>{lm.label}</span>
                          <span className="text-xs text-gray-400 tabular-nums">{lesson.duration}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminSingleCourse() {
  const {id}=useParams<{id:string}>();
  const navigate=useNavigate();
  const [course,setCourse]=useState<ManagedCourse|undefined>(MANAGED_COURSES.find(c=>c.id===id)??MANAGED_COURSES[0]);
  const [tab,setTab]=useState<"overview"|"students"|"curriculum"|"analytics">("overview");
  const [deleteModal,setDeleteModal]=useState(false);
  const [toastMsg,setToastMsg]=useState("");

  if(!course) return <div className="p-8 text-center text-gray-400">Course not found.</div>;

  const toast=(msg:string)=>{setToastMsg(msg);setTimeout(()=>setToastMsg(""),3000);};

  const setStatus=(status:CourseStatus)=>{
    setCourse(p=>p?{...p,status}:p);
    toast(`Course ${STATUS_META[status].label.toLowerCase()}`);
  };
  const handleDelete=()=>{ navigate("/admin/courses"); };
  const discount=Math.round((course.originalPrice-course.price)/course.originalPrice*100);
  const lessons=totalLessons(course);
  const dur=totalDuration(course);
  const completionPct=course.enrolledStudents.length
    ?Math.round(course.enrolledStudents.filter(s=>s.progressPct===100).length/course.enrolledStudents.length*100):0;

  const TABS=[
    {id:"overview",    label:"Overview"},
    {id:"students",    label:`Students (${course.enrolledStudents.length})`},
    {id:"curriculum",  label:`Curriculum (${lessons})`},
    {id:"analytics",   label:"Analytics"},
  ] as const;

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-10">

      {/* Back */}
      <Fade>
        <Link to="/admin/courses" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2">
          <ArrowLeft className="w-4 h-4"/> Back to Courses
        </Link>

        {/* Hero card */}
        <Card>
          <div className={cn("h-28 rounded-t-[22px] mb-14 bg-gradient-to-br relative overflow-hidden",course.thumbnail)}>
            <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle,white 1px,transparent 1px)",backgroundSize:"20px 20px"}}/>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"/>
            {/* Actions top-right */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Link to={`/admin/courses/${course.id}/edit`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold hover:bg-white/30 transition-all">
                <Edit3 className="w-3 h-3"/> Edit
              </Link>
              <button onClick={()=>setStatus(course.status==="published"?"archived":"published")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold hover:bg-white/30 transition-all">
                {course.status==="published"?<><EyeOff className="w-3 h-3"/> Unpublish</>:<><Globe className="w-3 h-3"/> Publish</>}
              </button>
              <button onClick={()=>setDeleteModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/30 backdrop-blur-sm border border-red-400/40 text-white text-xs font-bold hover:bg-red-500/50 transition-all">
                <Trash2 className="w-3 h-3"/> Delete
              </button>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-5">
              {/* Course icon */}
              <div className={cn("w-20 h-20 rounded-[18px] bg-gradient-to-br flex items-center justify-center flex-shrink-0 ring-4 ring-white dark:ring-[#0f1623] shadow-[0_8px_24px_rgba(0,0,0,0.2)]",course.thumbnail)}>
                <course.icon className="w-10 h-10 text-white drop-shadow-lg"/>
              </div>
              <div className="flex-1 sm:pb-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={cn("px-2.5 py-1 rounded-lg text-[11px] font-bold border",STATUS_META[course.status].color,STATUS_META[course.status].bg,STATUS_META[course.status].border)}>
                    {STATUS_META[course.status].label}
                  </span>
                  {course.badge&&<span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">{course.badge}</span>}
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-100 dark:bg-white/[0.05] text-gray-500 dark:text-gray-400">{course.level}</span>
                </div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{course.title}</h1>
                <p className="text-sm text-gray-400 mt-0.5">{course.categoryName} · {course.language}</p>
              </div>
              {/* Revenue tile */}
              <div className="flex-shrink-0 text-right px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30">
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{fmtRevenue(course.revenue)}</p>
                <p className="text-[10px] text-gray-400">Total Revenue</p>
              </div>
            </div>

            {/* Instructor row */}
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
              <div className={cn("w-9 h-9 rounded-xl text-xs font-black text-white flex items-center justify-center flex-shrink-0",course.instructorAvatarBg)}>
                {course.instructorAvatar}
              </div>
              <div>
                <p className="text-xs text-gray-400">Instructor</p>
                <Link to={`/admin/instructors/${course.instructorId}`} className="text-sm font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {course.instructorName}
                </Link>
              </div>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                {icon:Users,     val:fmt(course.students),        sub:"Students"},
                {icon:Star,      val:course.rating.toFixed(1)+"★",sub:`${fmt(course.reviews)} reviews`},
                {icon:DollarSign,val:`$${course.price}`,          sub:`${discount}% off $${course.originalPrice}`},
                {icon:BookOpen,  val:String(lessons),             sub:`lessons · ${dur}`},
                {icon:Award,     val:course.certificate?"Yes":"No",sub:"Certificate"},
              ].map(({icon:Icon,val,sub})=>(
                <div key={sub} className="flex flex-col items-center py-4 px-3 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] text-center">
                  <Icon className="w-4 h-4 text-blue-500 mb-1.5"/>
                  <p className="text-base font-black text-gray-900 dark:text-white">{val}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </Fade>

      {/* Tabs */}
      <Fade delay={0.08}>
        <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.05] w-fit">
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={cn("px-5 py-2 rounded-xl text-sm font-bold transition-all",
                tab===t.id?"bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm":"text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}>{t.label}</button>
          ))}
        </div>
      </Fade>

      {/* Overview tab */}
      {tab==="overview"&&(
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-5">
            {/* Description */}
            <Fade delay={0.1}>
              <Card>
                <SHead icon={AlignLeft} title="Course Description"/>
                <div className="p-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{course.description}</p>
                  {course.longDescription&&<p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-4">{course.longDescription}</p>}
                </div>
              </Card>
            </Fade>
            {/* Outcomes */}
            <Fade delay={0.14}>
              <Card>
                <SHead icon={Target} title="Learning Outcomes"/>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {course.learningOutcomes.map((o,i)=>(
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"/>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{o}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </Fade>
            {/* Requirements */}
            <Fade delay={0.17}>
              <Card>
                <SHead icon={BookOpen} title="Requirements"/>
                <div className="p-6 flex flex-col gap-2">
                  {course.requirements.map((r,i)=>(
                    <p key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                      {r}
                    </p>
                  ))}
                </div>
              </Card>
            </Fade>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Quick actions */}
            <Fade delay={0.12}>
              <Card className="p-5">
                <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-4">Quick Actions</p>
                <div className="flex flex-col gap-2">
                  {[
                    {icon:Edit3,   label:"Edit Course",          action:()=>navigate(`/admin/courses/${course.id}/edit`),   cls:"border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 hover:border-blue-300 hover:text-blue-600"},
                    {icon:Globe,   label:course.status==="published"?"Unpublish":"Publish", action:()=>setStatus(course.status==="published"?"draft":"published"), cls:"border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50"},
                    {icon:Archive, label:"Archive Course",         action:()=>setStatus("archived"),                          cls:"border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50"},
                    {icon:Trash2,  label:"Delete Course",          action:()=>setDeleteModal(true),                          cls:"border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"},
                  ].map(({icon:Icon,label,action,cls})=>(
                    <button key={label} onClick={action}
                      className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold border transition-all",cls)}>
                      <Icon className="w-4 h-4 flex-shrink-0"/>{label}
                    </button>
                  ))}
                </div>
              </Card>
            </Fade>

            {/* Tags */}
            <Fade delay={0.16}>
              <Card className="p-5">
                <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map(t=>(
                    <span key={t} className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/[0.03]">{t}</span>
                  ))}
                </div>
              </Card>
            </Fade>

            {/* Dates */}
            <Fade delay={0.19}>
              <Card className="p-5">
                <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">Dates</p>
                {[
                  {label:"Created",   val:new Date(course.createdAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})},
                  {label:"Updated",   val:new Date(course.updatedAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})},
                  ...(course.publishedAt?[{label:"Published",val:new Date(course.publishedAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}]:[]),
                ].map(({label,val})=>(
                  <div key={label} className="flex justify-between py-1.5 border-b border-gray-50 dark:border-white/[0.04] last:border-0">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{val}</span>
                  </div>
                ))}
              </Card>
            </Fade>
          </div>
        </div>
      )}

      {/* Students tab */}
      {tab==="students"&&(
        <Fade delay={0.08}>
          <Card>
            <SHead icon={Users} title={`Enrolled Students (${course.enrolledStudents.length})`}/>
            <StudentsTab course={course} onChange={setCourse}/>
          </Card>
        </Fade>
      )}

      {/* Curriculum tab */}
      {tab==="curriculum"&&(
        <Fade delay={0.08}>
          <Card>
            <SHead icon={BookOpen} title="Course Curriculum"/>
            <CurriculumTab course={course}/>
          </Card>
        </Fade>
      )}

      {/* Analytics tab */}
      {tab==="analytics"&&(
        <Fade delay={0.08}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {label:"Total Students",       val:fmt(course.students),             sub:"enrolled",         color:"text-blue-600",   bg:"bg-blue-50 dark:bg-blue-950/40"     },
              {label:"Revenue",              val:fmtRevenue(course.revenue),        sub:"total earned",     color:"text-emerald-600",bg:"bg-emerald-50 dark:bg-emerald-950/40"},
              {label:"Completion Rate",      val:`${completionPct}%`,               sub:"finished course",  color:"text-indigo-600", bg:"bg-indigo-50 dark:bg-indigo-950/40" },
              {label:"Average Rating",       val:`${course.rating}★`,              sub:`${fmt(course.reviews)} reviews`,color:"text-amber-600",  bg:"bg-amber-50 dark:bg-amber-950/40"   },
              {label:"Certificates Issued",  val:String(course.enrolledStudents.filter(s=>s.certificateIssued).length),sub:"awarded",color:"text-purple-600",bg:"bg-purple-50 dark:bg-purple-950/40"},
              {label:"Active Students",      val:String(course.enrolledStudents.filter(s=>s.progressPct>0&&s.progressPct<100).length),sub:"in progress",color:"text-teal-600",bg:"bg-teal-50 dark:bg-teal-950/40"},
            ].map(({label,val,sub,color,bg})=>(
              <Card key={label} className="p-6 flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",bg)}>
                  <BarChart3 className={cn("w-6 h-6",color)}/>
                </div>
                <div>
                  <p className={cn("text-2xl font-black",color)}>{val}</p>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </Card>
            ))}
          </div>
        </Fade>
      )}

      {/* Delete modal */}
      <AnimatePresence>
        {deleteModal&&<ConfirmDeleteModal course={course} onConfirm={handleDelete} onClose={()=>setDeleteModal(false)}/>}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg&&(
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <CheckCircle2 className="w-4 h-4"/><span className="text-sm font-semibold">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}