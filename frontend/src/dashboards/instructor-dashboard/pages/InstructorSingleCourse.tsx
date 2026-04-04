import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import {
  BookOpen,
  Users,
  Star,
  BarChart3,
  Search,
  TrendingUp,
  Award,
  ChevronDown,
  CheckCircle2,
  ArrowLeft,
  Target,
  AlignLeft,
} from "lucide-react";

import {
  STATUS_META,
  fmtRevenue,
  fmt,
  totalLessons,
  totalDuration,
  type ManagedCourse,
  LESSON_TYPE_META,
  getManagedCourse,
} from "@/data/coursesAdminData";

function cn(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}
    >
      {children}
    </div>
  );
}

function Fade({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, delay }}
    >
      {children}
    </motion.div>
  );
}

// function CourseCard({course,index}:{course:ManagedCourse;index:number}) {
//   const [hovered,setHovered]=useState(false);
//   const lessons=totalLessons(course);
//   const dur=totalDuration(course);
//   const completion=course.enrolledStudents.length
//     ?Math.round(course.enrolledStudents.filter(s=>s.progressPct===100).length/course.enrolledStudents.length*100):0;
// }

export function InstructorSingleCourse() {
  const {id}=useParams<{id:string}>();
  const [course,_setCourse]=useState<ManagedCourse|undefined>(getManagedCourse(id??"dev-001"));
  const [tab,setTab]=useState<"overview"|"students"|"curriculum">("overview");
  const [search,setSearch]=useState("");
  const [openSections,setOpenSec]=useState<string[]>([]);

  if(!course) return <div className="p-8 text-center text-gray-400">Course not found.</div>;

  const toggleSec=(id:string)=>setOpenSec(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const lessons=totalLessons(course);
  const dur=totalDuration(course);
  const completionPct=course.enrolledStudents.length
    ?Math.round(course.enrolledStudents.filter(s=>s.progressPct===100).length/course.enrolledStudents.length*100):0;
  const avgProgress=course.enrolledStudents.length
    ?Math.round(course.enrolledStudents.reduce((s,st)=>s+st.progressPct,0)/course.enrolledStudents.length):0;

  const filteredStudents=course.enrolledStudents.filter(s=>
    !search.trim()||s.studentName.toLowerCase().includes(search.toLowerCase())||s.email.toLowerCase().includes(search.toLowerCase())
  );

  const TABS=[
    {id:"overview",   label:"Overview"},
    {id:"students",   label:`Students (${course.enrolledStudents.length})`},
    {id:"curriculum", label:`Curriculum (${lessons})`},
  ] as const;

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 pb-10">

      <Fade>
        <Link to="/instructor/courses" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2">
          <ArrowLeft className="w-4 h-4"/> Back to My Courses
        </Link>

        {/* Hero */}
        <Card>
          <div className={cn("h-24 rounded-t-[22px] mb-14 bg-gradient-to-br relative overflow-hidden",course.thumbnail)}>
            <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle,white 1px,transparent 1px)",backgroundSize:"18px 18px"}}/>
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-9 mb-5">
              <div className={cn("w-16 h-16 rounded-[16px] bg-gradient-to-br flex items-center justify-center flex-shrink-0 ring-4 ring-white dark:ring-[#0f1623] shadow-[0_4px_16px_rgba(0,0,0,0.18)]",course.thumbnail)}>
                <course.icon className="w-8 h-8 text-white drop-shadow"/>
              </div>
              <div className="flex-1 sm:pb-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={cn("px-2.5 py-1 rounded-lg text-[11px] font-bold border",STATUS_META[course.status].color,STATUS_META[course.status].bg,STATUS_META[course.status].border)}>
                    {STATUS_META[course.status].label}
                  </span>
                  <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-gray-100 dark:bg-white/[0.05] text-gray-500">{course.level}</span>
                </div>
                <h1 className="text-xl font-black text-gray-900 dark:text-white">{course.title}</h1>
                <p className="text-xs text-gray-400">{course.categoryName} · {course.language}</p>
              </div>
              {/* Revenue — read-only for instructor */}
              <div className="text-right px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex-shrink-0">
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{fmtRevenue(course.revenue)}</p>
                <p className="text-[10px] text-gray-400">Your Earnings</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                {icon:Users,     val:fmt(course.students),      sub:"Students"},
                {icon:Star,      val:course.rating.toFixed(1)+"★",sub:`${fmt(course.reviews)} reviews`},
                {icon:TrendingUp,val:`${completionPct}%`,        sub:"Completion"},
                {icon:BookOpen,  val:String(lessons),            sub:`lessons · ${dur}`},
                {icon:BarChart3, val:`${avgProgress}%`,          sub:"Avg. progress"},
              ].map(({icon:Icon,val,sub})=>(
                <div key={sub} className="flex flex-col items-center py-3.5 px-2 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] text-center">
                  <Icon className="w-4 h-4 text-blue-500 mb-1"/>
                  <p className="text-base font-black text-gray-900 dark:text-white">{val}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{sub}</p>
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
                tab===t.id?"bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm":"text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}>{t.label}</button>
          ))}
        </div>
      </Fade>

      {/* Overview */}
      {tab==="overview"&&(
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          <div className="space-y-5">
            <Fade delay={0.1}>
              <Card>
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center"><AlignLeft className="w-3.5 h-3.5 text-white"/></div>
                  <h2 className="text-sm font-black text-gray-900 dark:text-white">Description</h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{course.description}</p>
                  {course.longDescription&&<p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-4">{course.longDescription}</p>}
                </div>
              </Card>
            </Fade>
            <Fade delay={0.13}>
              <Card>
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center"><Target className="w-3.5 h-3.5 text-white"/></div>
                  <h2 className="text-sm font-black text-gray-900 dark:text-white">Learning Outcomes</h2>
                </div>
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
          </div>

          <div className="space-y-4">
            <Fade delay={0.12}>
              <Card className="p-5">
                <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">Note</p>
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/15 border border-blue-100 dark:border-blue-900/20">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Course editing is managed by the admin. Contact your admin to make changes to course details, pricing, or curriculum.
                  </p>
                </div>
              </Card>
            </Fade>
            <Fade delay={0.15}>
              <Card className="p-5">
                <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-3">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map(t=>(
                    <span key={t} className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/[0.03]">{t}</span>
                  ))}
                </div>
              </Card>
            </Fade>
          </div>
        </div>
      )}

      {/* Students */}
      {tab==="students"&&(
        <Fade delay={0.08}>
          <Card>
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center"><Users className="w-3.5 h-3.5 text-white"/></div>
              <h2 className="text-sm font-black text-gray-900 dark:text-white">Enrolled Students ({course.enrolledStudents.length})</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all"/>
              </div>
              <div className="flex flex-col gap-3">
                {filteredStudents.map((s,i)=>(
                  <motion.div key={s.studentId} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-white/[0.07] hover:border-blue-200 dark:hover:border-blue-800/40 transition-all">
                    <div className={cn("w-10 h-10 rounded-xl text-sm font-black text-white flex items-center justify-center flex-shrink-0",s.studentAvatarBg)}>
                      {s.studentAvatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{s.studentName}</p>
                        {s.certificateIssued&&<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 flex items-center gap-1"><Award className="w-2.5 h-2.5"/>Certified</span>}
                        {s.progressPct===100&&!s.certificateIssued&&<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border border-emerald-200 dark:border-emerald-800/40">Completed</span>}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{s.email}</p>
                    </div>
                    {/* Progress */}
                    <div className="flex-shrink-0 w-36 hidden sm:block">
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>{s.completedLessons}/{s.totalLessons}</span>
                        <span className="font-bold">{s.progressPct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                        <motion.div initial={{width:0}} animate={{width:`${s.progressPct}%`}} transition={{duration:0.7,delay:i*0.04}}
                          className={cn("h-full rounded-full",s.progressPct===100?"bg-emerald-500":s.progressPct>60?"bg-blue-500":"bg-amber-500")}/>
                      </div>
                      <p className="text-[9px] text-gray-400 mt-0.5">
                        Last active {new Date(s.lastActive).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}
                      </p>
                    </div>
                    {/* Progress mobile badge */}
                    <div className="sm:hidden flex-shrink-0">
                      <span className={cn("text-xs font-black",s.progressPct===100?"text-emerald-500":s.progressPct>60?"text-blue-500":"text-amber-500")}>{s.progressPct}%</span>
                    </div>
                  </motion.div>
                ))}
                {filteredStudents.length===0&&(
                  <div className="py-12 text-center">
                    <Users className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-2"/>
                    <p className="text-sm text-gray-400">No students found</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Fade>
      )}

      {/* Curriculum */}
      {tab==="curriculum"&&(
        <Fade delay={0.08}>
          <Card>
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center"><BookOpen className="w-3.5 h-3.5 text-white"/></div>
              <h2 className="text-sm font-black text-gray-900 dark:text-white">Course Curriculum</h2>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-xs text-gray-400 mb-4">{course.sections.length} sections · {lessons} lessons · {dur}</p>
              {course.sections.map((sec,si)=>{
                const isOpen=openSections.includes(sec.id);
                return (
                  <div key={sec.id} className="rounded-2xl border border-gray-100 dark:border-white/[0.07] overflow-hidden">
                    <button onClick={()=>toggleSec(sec.id)}
                      className="w-full flex items-center gap-3 px-5 py-4 bg-gray-50/80 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors text-left">
                      <span className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 text-xs font-black flex items-center justify-center flex-shrink-0">{si+1}</span>
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
                            {sec.lessons.map(l=>{
                              const lm=LESSON_TYPE_META[l.type];
                              return (
                                <div key={l.id} className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-transparent">
                                  <span className="text-base leading-none w-6 text-center flex-shrink-0">{lm.icon}</span>
                                  <span className={cn("flex-1 text-sm",l.isFree?"text-blue-600 dark:text-blue-400 font-medium":"text-gray-600 dark:text-gray-400")}>
                                    {l.title}
                                    {l.isFree&&<span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-600">FREE</span>}
                                  </span>
                                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-50 dark:bg-white/[0.04]",lm.color)}>{lm.label}</span>
                                  <span className="text-xs text-gray-400 tabular-nums">{l.duration}</span>
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
          </Card>
        </Fade>
      )}
    </div>

  );
};

export default InstructorSingleCourse;