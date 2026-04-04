// InstructorAllCourses.tsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpen, Users, Star, DollarSign, Search,
  ChevronRight,
} from "lucide-react";
import {
//   MANAGED_COURSES,
   STATUS_META, fmtRevenue, fmt, totalLessons, totalDuration,
  getInstructorCourses, type ManagedCourse,
} from "@/data/coursesAdminData";

const INSTRUCTOR_ID = "inst-1"; // Sarah Mitchell — from useDashboardUser in prod
const myCourses = getInstructorCourses(INSTRUCTOR_ID);

function cn(...c:(string|false|undefined)[]) { return c.filter(Boolean).join(" "); }
function Card({children,className=""}:{children:React.ReactNode;className?:string}) {
  return <div className={`rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}>{children}</div>;
}
function Fade({children,delay=0}:{children:React.ReactNode;delay?:number}) {
  return <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:0.36,delay}}>{children}</motion.div>;
}

function CourseCard({course,index}:{course:ManagedCourse;index:number}) {
  const [hovered,setHovered]=useState(false);
  const lessons=totalLessons(course);
  const dur=totalDuration(course);
  const completion=course.enrolledStudents.length
    ?Math.round(course.enrolledStudents.filter(s=>s.progressPct===100).length/course.enrolledStudents.length*100):0;

  return (
    <motion.div layout initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.34,delay:index*0.06}}
      onHoverStart={()=>setHovered(true)} onHoverEnd={()=>setHovered(false)}
      className="relative rounded-[22px] overflow-hidden bg-white/70 dark:bg-[#020618] backdrop-blur-xl border border-white/80 dark:border-white/[0.08] transition-shadow duration-300"
      style={{boxShadow:hovered?"0 0 0 1.5px rgba(59,130,246,0.45), 0 12px 40px rgba(59,130,246,0.16)":"0 8px 30px rgba(15,23,42,0.08)"}}>

      {/* Thumbnail */}
      <div className={cn("h-36 bg-gradient-to-br relative overflow-hidden",course.thumbnail)}>
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle,white 1px,transparent 1px)",backgroundSize:"14px 14px"}}/>
        <motion.div animate={hovered?{scale:1.08}:{scale:1}} transition={{duration:0.4}} className="absolute inset-0 flex items-center justify-center">
          <course.icon className="w-14 h-14 text-white drop-shadow-xl"/>
        </motion.div>
        <div className="absolute top-3 left-3">
          <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold border backdrop-blur-sm",STATUS_META[course.status].color,STATUS_META[course.status].bg,STATUS_META[course.status].border)}>
            {STATUS_META[course.status].label}
          </span>
        </div>
        {course.badge&&(
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-400/20 border border-amber-400/40 text-amber-200 backdrop-blur-sm">{course.badge}</span>
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-sm font-black text-gray-900 dark:text-white line-clamp-2 leading-snug mb-1">{course.title}</h3>
          <p className="text-xs text-gray-400">{course.categoryName} · {course.level}</p>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            {icon:Users,  val:fmt(course.students), label:"Students"},
            {icon:Star,   val:course.rating>0?course.rating.toFixed(1):"—", label:"Rating"},
            {icon:DollarSign,val:`$${fmtRevenue(course.revenue)}`.replace("$$","$"),label:"Revenue"},
          ].map(({icon:Icon,val,label})=>(
            <div key={label} className="text-center py-2.5 px-1 rounded-xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
              <Icon className="w-3.5 h-3.5 text-blue-500 mx-auto mb-1"/>
              <p className="text-sm font-black text-gray-900 dark:text-white">{val}</p>
              <p className="text-[9px] text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-[10px] text-gray-400 mb-1.5">
            <span>Completion rate</span>
            <span>{completion}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
            <motion.div initial={{width:0}} animate={{width:`${completion}%`}} transition={{duration:0.8,delay:index*0.06+0.3}}
              className={cn("h-full rounded-full",completion===100?"bg-emerald-500":completion>60?"bg-blue-500":"bg-amber-500")}/>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">{lessons} lessons · {dur}</p>
        </div>

        <Link to={`/instructor/courses/${course.id}`}>
          <motion.div whileHover={{scale:1.02}} whileTap={{scale:0.97}}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)] transition-colors">
            View Course <ChevronRight className="w-4 h-4"/>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}

export function InstructorAllCourses() {
  const [search,setSearch]=useState("");
  const filtered=myCourses.filter(c=>!search.trim()||c.title.toLowerCase().includes(search.toLowerCase()));

  const totalStudents=myCourses.reduce((s,c)=>s+c.students,0);
  const totalRev=myCourses.reduce((s,c)=>s+c.revenue,0);
  const avgRating=myCourses.filter(c=>c.rating>0).reduce((s,c,_,a)=>s+c.rating/a.length,0);

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-10">
      <Fade>
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            My <span className="text-blue-600 dark:text-blue-400">Courses</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">All your published and draft courses</p>
        </div>
      </Fade>

      {/* Summary */}
      <Fade delay={0.06}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {icon:BookOpen,  label:"Courses",          val:String(myCourses.length),   color:"text-blue-600",   bg:"bg-blue-50 dark:bg-blue-950/40"    },
            {icon:Users,     label:"Total Students",   val:fmt(totalStudents),          color:"text-indigo-600", bg:"bg-indigo-50 dark:bg-indigo-950/40"},
            {icon:DollarSign,label:"Total Revenue",    val:fmtRevenue(totalRev),        color:"text-emerald-600",bg:"bg-emerald-50 dark:bg-emerald-950/40"},
            {icon:Star,      label:"Avg. Rating",      val:avgRating.toFixed(1)+"★",   color:"text-amber-600",  bg:"bg-amber-50 dark:bg-amber-950/40"  },
          ].map(({icon:Icon,label,val,color,bg})=>(
            <Card key={label} className="p-5 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",bg)}>
                <Icon className={cn("w-5 h-5",color)}/>
              </div>
              <div>
                <p className={cn("text-2xl font-black",color)}>{val}</p>
                <p className="text-[10px] text-gray-400">{label}</p>
              </div>
            </Card>
          ))}
        </div>
      </Fade>

      {/* Search */}
      <Fade delay={0.1}>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search my courses…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all"/>
        </div>
      </Fade>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <AnimatePresence>
          {filtered.map((c,i)=><CourseCard key={c.id} course={c} index={i}/>)}
        </AnimatePresence>
        {filtered.length===0&&(
          <div className="col-span-full py-16 text-center">
            <BookOpen className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3"/>
            <p className="text-sm text-gray-400">No courses found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default InstructorAllCourses;