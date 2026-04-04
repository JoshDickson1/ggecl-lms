// src/pages/admin/AdminManageCourses.tsx
// Route: /admin/courses

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Plus, Search, Eye, Edit3, Trash2, BookOpen,
  Users, Star, DollarSign, Globe, ChevronDown,
} from "lucide-react";
import {
  MANAGED_COURSES, STATUS_META, fmtRevenue, fmt, 
//   totalLessons,
  type CourseStatus, type ManagedCourse,
} from "@/data/coursesAdminData";

function cn(...c:(string|false|undefined)[]) { return c.filter(Boolean).join(" "); }
function Card({children,className=""}:{children:React.ReactNode;className?:string}) {
  return <div className={`rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}>{children}</div>;
}
function Fade({children,delay=0}:{children:React.ReactNode;delay?:number}) {
  return <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:0.36,delay,ease:"easeOut"}}>{children}</motion.div>;
}

function StatusBadge({status}:{status:CourseStatus}) {
  const m=STATUS_META[status];
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${m.color} ${m.bg} ${m.border}`}>{m.label}</span>;
}

// ─── Quick status change dropdown ─────────────────────────────────────────────
function StatusChanger({course,onChange}:{course:ManagedCourse;onChange:(id:string,s:CourseStatus)=>void}) {
  const [open,setOpen]=useState(false);
  const options:CourseStatus[]=["published","draft","under_review","archived"];
  return (
    <div className="relative">
      <button onClick={()=>setOpen(p=>!p)}
        className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-blue-600 transition-colors">
        <ChevronDown className="w-3 h-3"/>
      </button>
      <AnimatePresence>
        {open&&(
          <>
            <div className="fixed inset-0 z-40" onClick={()=>setOpen(false)}/>
            <motion.div initial={{opacity:0,y:4,scale:0.96}} animate={{opacity:1,y:0,scale:1}}
              exit={{opacity:0,y:4,scale:0.96}} transition={{duration:0.14}}
              className="absolute right-0 top-6 w-36 z-50 rounded-[14px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.15)] p-1.5">
              {options.map(o=>(
                <button key={o} onClick={()=>{onChange(course.id,o);setOpen(false);}}
                  className={cn("w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                    course.status===o?"bg-blue-50 dark:bg-blue-950/30 text-blue-600":
                    "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                  )}>
                  {STATUS_META[o].label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Course row ───────────────────────────────────────────────────────────────
function CourseRow({course,index,onChange,onDelete}:{
  course:ManagedCourse; index:number;
  onChange:(id:string,s:CourseStatus)=>void;
  onDelete:(id:string)=>void;
}) {
//   const lessons=totalLessons(course);
  const discount=course.originalPrice>0?Math.round((course.originalPrice-course.price)/course.originalPrice*100):0;

  return (
    <motion.tr initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:index*0.04}}
      className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* Course */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0",course.thumbnail)}>
            <course.icon className="w-5 h-5 text-white"/>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[220px]">{course.title}</p>
            <p className="text-[10px] text-gray-400">{course.categoryName} · {course.level}</p>
          </div>
        </div>
      </td>
      {/* Instructor */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span className={cn("w-7 h-7 rounded-xl text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0",course.instructorAvatarBg)}>
            {course.instructorAvatar}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[100px]">{course.instructorName}</span>
        </div>
      </td>
      {/* Students */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-blue-400"/>
          <span className="text-sm font-bold text-gray-800 dark:text-white">{fmt(course.students)}</span>
        </div>
      </td>
      {/* Rating */}
      <td className="px-4 py-4">
        {course.rating>0?(
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400"/>
            <span className="text-sm font-bold text-gray-800 dark:text-white">{course.rating}</span>
          </div>
        ):<span className="text-xs text-gray-400">—</span>}
      </td>
      {/* Revenue */}
      <td className="px-4 py-4">
        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{fmtRevenue(course.revenue)}</span>
      </td>
      {/* Price */}
      <td className="px-4 py-4">
        <div>
          <span className="text-sm font-black text-gray-900 dark:text-white">${course.price}</span>
          {discount>0&&<span className="text-[10px] text-gray-400 ml-1 line-through">${course.originalPrice}</span>}
        </div>
      </td>
      {/* Status */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-1.5">
          <StatusBadge status={course.status}/>
          <StatusChanger course={course} onChange={onChange}/>
        </div>
      </td>
      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-1.5">
          <Link to={`/admin/courses/${course.id}`}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
            <Eye className="w-3 h-3"/> View
          </Link>
          <Link to={`/admin/courses/${course.id}/edit`}
            className="w-7 h-7 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all">
            <Edit3 className="w-3 h-3"/>
          </Link>
          <button onClick={()=>onDelete(course.id)}
            className="w-7 h-7 rounded-xl border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 transition-all">
            <Trash2 className="w-3 h-3"/>
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminManageCourses() {
  const [courses,setCourses]=useState(MANAGED_COURSES);
  const [search,setSearch]=useState("");
  const [statusFilter,setStatusF]=useState<CourseStatus|"all">("all");
  const [categoryFilter,setCatF]=useState("all");

  const allCats=Array.from(new Set(MANAGED_COURSES.map(c=>c.categoryName)));
  const filtered=courses.filter(c=>{
    const ms=!search.trim()||c.title.toLowerCase().includes(search.toLowerCase())||c.instructorName.toLowerCase().includes(search.toLowerCase());
    const mst=statusFilter==="all"||c.status===statusFilter;
    const mc=categoryFilter==="all"||c.categoryName===categoryFilter;
    return ms&&mst&&mc;
  });

  const totalRevenue=courses.reduce((s,c)=>s+c.revenue,0);
  const totalStudents=courses.reduce((s,c)=>s+c.students,0);
  const published=courses.filter(c=>c.status==="published").length;
  const avgRating=courses.filter(c=>c.rating>0).reduce((s,c,_,a)=>s+c.rating/a.length,0);

  const handleStatusChange=(id:string,status:CourseStatus)=>
    setCourses(p=>p.map(c=>c.id===id?{...c,status}:c));
  const handleDelete=(id:string)=>
    setCourses(p=>p.filter(c=>c.id!==id));

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-10">
      <Fade>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
              Courses <span className="text-blue-600 dark:text-blue-400">Management</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">All courses across all instructors · Full admin control</p>
          </div>
          <Link to="/admin/courses/create">
            <motion.div whileHover={{scale:1.03}} whileTap={{scale:0.97}}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(59,130,246,0.35)] transition-all cursor-pointer">
              <Plus className="w-4 h-4"/> New Course
            </motion.div>
          </Link>
        </div>
      </Fade>

      {/* Stats */}
      <Fade delay={0.06}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {icon:BookOpen,    label:"Total Courses",  value:String(courses.length),        color:"text-blue-600",   bg:"bg-blue-50 dark:bg-blue-950/40"     },
            {icon:Globe,       label:"Published",       value:String(published),             color:"text-emerald-600",bg:"bg-emerald-50 dark:bg-emerald-950/40"},
            {icon:Users,       label:"Total Students",  value:fmt(totalStudents),            color:"text-indigo-600", bg:"bg-indigo-50 dark:bg-indigo-950/40" },
            {icon:DollarSign,  label:"Total Revenue",   value:fmtRevenue(totalRevenue),      color:"text-amber-600",  bg:"bg-amber-50 dark:bg-amber-950/40"   },
          ].map(({icon:Icon,label,value,color,bg})=>(
            <Card key={label} className="p-5 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",bg)}>
                <Icon className={cn("w-5 h-5",color)}/>
              </div>
              <div>
                <p className={cn("text-2xl font-black",color)}>{value}</p>
                <p className="text-[10px] text-gray-400">{label}</p>
              </div>
            </Card>
          ))}
        </div>
      </Fade>

      {/* Filters */}
      <Fade delay={0.1}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search courses or instructors…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all"/>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05]">
              {(["all","published","draft","under_review","archived"] as const).map(s=>(
                <button key={s} onClick={()=>setStatusF(s)}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap",
                    statusFilter===s?"bg-white dark:bg-[#0f1623] text-gray-900 dark:text-white shadow-sm":"text-gray-500 hover:text-gray-700"
                  )}>{s==="under_review"?"In Review":s==="all"?"All":STATUS_META[s as CourseStatus].label}</button>
              ))}
            </div>
            <select value={categoryFilter} onChange={e=>setCatF(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#0f1623] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 outline-none cursor-pointer">
              <option value="all">All Categories</option>
              {allCats.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </Fade>

      {/* Table */}
      <Fade delay={0.14}>
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
            <p className="text-sm font-black text-gray-900 dark:text-white">
              All Courses <span className="text-gray-400 font-normal">({filtered.length})</span>
            </p>
            <p className="text-xs text-gray-400">⭐ Platform avg. {avgRating.toFixed(1)}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.06]">
                  {["Course","Instructor","Students","Rating","Revenue","Price","Status",""].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-widest text-gray-400 uppercase whitespace-nowrap first:px-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((course,i)=>(
                    <CourseRow key={course.id} course={course} index={i}
                      onChange={handleStatusChange} onDelete={handleDelete}/>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {filtered.length===0&&(
              <div className="py-20 text-center">
                <BookOpen className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3"/>
                <p className="text-sm text-gray-400">No courses found</p>
              </div>
            )}
          </div>
        </Card>
      </Fade>
    </div>
  );
}