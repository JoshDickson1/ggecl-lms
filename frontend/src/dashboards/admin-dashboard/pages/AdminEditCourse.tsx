// src/dashboards/admin-dashboard/pages/AdminEditCourse.tsx
// Route: /admin/courses/:id/edit

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Shield, BookOpen, GraduationCap, DollarSign,
  FileText, X, Loader2, CheckCircle2, Plus, Info,
  ImageIcon, Video, Tag, Save, Users, Search, UserPlus, UserMinus,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CoursesService, {
  CourseLevel, CourseStatus, CertificationType,
  type UpdateCoursePayload,
} from "@/services/course.service";
import UserService, { UserRole } from "@/services/user.service";
import StorageService from "@/services/storage.service";
import EnrollmentService from "@/services/enrollment.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InstructorUser {
  id: string;
  name: string;
  image: string | null;
  email: string;
  instructorProfile?: { 
    id?: string; // Instructor profile ID (different from user ID)
    specialization?: string;
  };
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  videoUrl: string | null;
  img: string | null;
  price: number;
  level: string;
  status: string;
  badge: string | null;
  tags: string[];
  syllabus: string[];
  includes: string[];
  certification: string | null;
  instructorId: string | null;
  instructor?: { id: string; name: string; image: string | null; email: string };
}

interface StudentUser {
  id: string;
  name: string;
  image: string | null;
  email: string;
}

// ─── Student Enrollment Manager ─────────────────────────────────────────────────

function StudentEnrollmentManager({ courseId }: { courseId: string }) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const qc = useQueryClient();

  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(v), 350);
  }, []);

  // Get current enrollments
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["course-enrollments", courseId],
    queryFn: () => EnrollmentService.findByCourse(courseId),
    staleTime: 1000 * 30,
  });

  // Get all students for enrollment
  const { data: allStudents = [], isFetching: studentsFetching } = useQuery<StudentUser[]>({
    queryKey: ["students-list", showAll ? "all" : "search", debouncedSearch],
    queryFn: async () => {
      const res = await UserService.findAll({
        role: UserRole.STUDENT,
        search: showAll ? "" : debouncedSearch,
        limit: showAll ? 100 : 20,
      }) as { data?: StudentUser[] } | StudentUser[];
      return Array.isArray(res) ? res : ((res as { data?: StudentUser[] }).data ?? []);
    },
    enabled: showAll || debouncedSearch.length >= 2,
    staleTime: 1000 * 30,
    retry: 1,
  });

  // Mutations for enrollment management
  const enrollMutation = useMutation({
    mutationFn: (studentIds: string[]) => EnrollmentService.adminEnroll(courseId, studentIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course-enrollments", courseId] });
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
    },
  });

  const unenrollMutation = useMutation({
    mutationFn: (_studentIds: string[]) => {
      // Note: You'll need to implement adminUnenroll in EnrollmentService
      // For now, we'll use a placeholder or remove students from enrollments
      return Promise.resolve([]);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course-enrollments", courseId] });
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
    },
  });

  const enrolledStudentIds = new Set((enrollments as any[]).map((e: any) => e.student?.id || e.studentId));
  const availableStudents = allStudents.filter(s => !enrolledStudentIds.has(s.id));

  const handleEnroll = (studentIds: string[]) => {
    enrollMutation.mutate(studentIds);
  };

  const handleUnenroll = (studentIds: string[]) => {
    unenrollMutation.mutate(studentIds);
  };

  return (
    <div className="space-y-6">
      {/* Currently Enrolled Students */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Currently Enrolled ({(enrollments as any[]).length})
        </h3>
        
        {enrollmentsLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading enrollments...
          </div>
        ) : (enrollments as any[]).length > 0 ? (
          <div className="space-y-2">
            {(enrollments as any[]).map((enrollment: any) => {
              const student = enrollment.student || { id: enrollment.studentId, name: 'Unknown Student', email: '', image: null };
              return (
                <div key={student.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08]">
                  {student.image ? (
                    <img src={student.image} alt={student.name} className="w-8 h-8 rounded-xl object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <span className="text-white text-xs font-black">
                        {student.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{student.name}</p>
                    <p className="text-xs text-gray-400 truncate">{student.email}</p>
                  </div>
                  <button
                    onClick={() => handleUnenroll([student.id])}
                    disabled={unenrollMutation.isPending}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No students enrolled yet</p>
          </div>
        )}
      </div>

      {/* Add New Students */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Enroll New Students
        </h3>
        
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => { 
                handleSearch(e.target.value); 
                setOpen(true); 
                if (showAll) {
                  setShowAll(false);
                }
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 200)}
              placeholder="Search students to enroll…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-gray-50/80 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 transition-all"
            />
            {studentsFetching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
            )}
          </div>
          <button
            onClick={() => { 
              const newShowAll = !showAll;
              setShowAll(newShowAll);
              setSearch("");
              setDebouncedSearch("");
              setOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl text-sm font-bold bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.08] transition-all"
          >
            {showAll ? "Search" : "Show All"}
          </button>
        </div>

        <AnimatePresence>
          {open && (showAll || debouncedSearch.length >= 2) && availableStudents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl bg-white dark:bg-[#141c2b] border border-gray-100 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden max-h-64"
            >
              <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {availableStudents.length} available student{availableStudents.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {availableStudents.map(student => (
                  <div key={student.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
                    {student.image ? (
                      <img src={student.image} alt={student.name} className="w-8 h-8 rounded-xl object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-white text-xs font-black">
                          {student.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{student.name}</p>
                      <p className="text-xs text-gray-400 truncate">{student.email}</p>
                    </div>
                    <button
                      onClick={() => handleEnroll([student.id])}
                      disabled={enrollMutation.isPending}
                      className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors disabled:opacity-50"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showAll && search.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm mb-2">Search for students or click "Show All" to browse</p>
            <p className="text-xs">Enroll students by clicking the + button</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared atoms ─────────────────────────────────────────────────────────────

function cn(...c: (string | false | undefined)[]) { return c.filter(Boolean).join(" "); }

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-1.5">
      {children}{required && <span className="text-blue-500">*</span>}
    </label>
  );
}

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, error }: {
  value: string; onChange: (v: string) => void; placeholder?: string; error?: boolean;
}) {
  const [f, setF] = useState(false);
  return (
    <input value={value} onChange={e => onChange(e.target.value)}
      onFocus={() => setF(true)} onBlur={() => setF(false)} placeholder={placeholder}
      className={cn("w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all",
        "bg-gray-50/80 dark:bg-white/[0.04] text-gray-800 dark:text-white placeholder:text-gray-400 border",
        error ? "border-red-300 dark:border-red-700" : f ? "border-blue-400 ring-2 ring-blue-500/15" : "border-gray-200 dark:border-white/[0.08]"
      )} />
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  const [f, setF] = useState(false);
  return (
    <textarea value={value} rows={rows} onChange={e => onChange(e.target.value)}
      onFocus={() => setF(true)} onBlur={() => setF(false)} placeholder={placeholder}
      className={cn("w-full px-4 py-2.5 rounded-xl text-sm resize-none outline-none transition-all",
        "bg-gray-50/80 dark:bg-white/[0.04] text-gray-800 dark:text-white placeholder:text-gray-400 border",
        f ? "border-blue-400 ring-2 ring-blue-500/15" : "border-gray-200 dark:border-white/[0.08]"
      )} />
  );
}

function SectionCard({ icon: Icon, title, description, children, delay = 0 }: {
  icon: React.ElementType; title: string; description?: string;
  children: React.ReactNode; delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, delay }}
      className="rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="flex items-start gap-3 px-6 py-5 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_3px_10px_rgba(59,130,246,0.35)] flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-black text-gray-900 dark:text-white">{title}</h2>
          {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

function StringListEditor({ items, onChange, placeholder }: {
  items: string[]; onChange: (v: string[]) => void; placeholder: string;
}) {
  const add    = () => onChange([...items, ""]);
  const update = (i: number, v: string) => onChange(items.map((x, xi) => xi === i ? v : x));
  const remove = (i: number) => onChange(items.filter((_, xi) => xi !== i));
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <input value={item} onChange={e => update(i, e.target.value)} placeholder={placeholder}
            className="flex-1 px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 text-gray-800 dark:text-white outline-none transition-all" />
          <button onClick={() => remove(i)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button onClick={add}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-dashed border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all">
        <Plus className="w-3 h-3" /> Add item
      </button>
    </div>
  );
}

function ImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await StorageService.upload("course-images", file);
      onChange(url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      {value ? (
        <div className="relative rounded-2xl overflow-hidden h-36">
          <img src={value} alt="Thumbnail" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-end justify-end p-2 gap-2">
            <button onClick={() => ref.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-black/60 text-white text-xs font-bold hover:bg-black/80 transition-all">
              Change
            </button>
            <button onClick={() => onChange("")}
              className="w-7 h-7 rounded-xl bg-black/60 flex items-center justify-center text-white hover:bg-red-600/80 transition-all">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => ref.current?.click()} disabled={uploading}
          className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/[0.1] flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-300 hover:text-blue-500 dark:hover:border-blue-700 transition-all disabled:opacity-50">
          {uploading
            ? <><Loader2 className="w-6 h-6 animate-spin" /><span className="text-xs">Uploading…</span></>
            : <><ImageIcon className="w-6 h-6" /><span className="text-xs font-semibold">Click to upload thumbnail</span><span className="text-[10px]">PNG, JPG, WEBP</span></>
          }
        </button>
      )}
    </div>
  );
}

function SuccessToast({ onDone }: { onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
      <div>
        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Course updated!</p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400">Changes have been saved.</p>
      </div>
      <button onClick={onDone}
        className="ml-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all">
        View
      </button>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type Errors = Record<string, string>;

export default function AdminEditCourse() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc       = useQueryClient();

  const [title,        setTitle]        = useState("");
  const [description,  setDescription]  = useState("");
  const [videoUrl,     setVideoUrl]     = useState("");
  const [img,          setImg]          = useState("");
  const [price,        setPrice]        = useState("0");
  const [level,        setLevel]        = useState<CourseLevel>(CourseLevel.BEGINNER);
  const [status,       setStatus]       = useState<CourseStatus>(CourseStatus.DRAFT);
  const [certification,setCert]         = useState<CertificationType>(CertificationType.NORMAL);
  const [badge,        setBadge]        = useState("");
  const [tags,         setTags]         = useState<string[]>([]);
  const [tagInput,     setTagInput]     = useState("");
  const [syllabus,     setSyllabus]     = useState<string[]>([]);
  const [includes,     setIncludes]     = useState<string[]>([]);
  const [instructorId, setInstructorId] = useState("");
  const [errors,       setErrors]       = useState<Errors>({});
  const [showSuccess,  setShowSuccess]  = useState(false);

  // Load course
  const { data: course, isLoading: loadingCourse } = useQuery<CourseDetail>({
    queryKey: ["admin-course-edit", id],
    queryFn: () => CoursesService.findOne(id!) as Promise<CourseDetail>,
    enabled: !!id,
    staleTime: 0,
  });

  // Populate form when course loads
  useEffect(() => {
    if (!course) return;
    setTitle(course.title);
    setDescription(course.description);
    setVideoUrl(course.videoUrl ?? "");
    setImg(course.img ?? "");
    setPrice(String(course.price ?? 0));
    setLevel((course.level as CourseLevel) ?? CourseLevel.BEGINNER);
    setStatus((course.status as CourseStatus) ?? CourseStatus.DRAFT);
    setCert((course.certification as CertificationType) ?? CertificationType.NORMAL);
    setBadge(course.badge ?? "");
    setTags(course.tags ?? []);
    setSyllabus(course.syllabus?.length ? course.syllabus : [""]);
    setIncludes(course.includes?.length ? course.includes : [""]);
    setInstructorId(course.instructorId ?? "");
  }, [course]);

  // Load instructors
  const { data: instructors = [] } = useQuery<InstructorUser[]>({
    queryKey: ["instructors-list"],
    queryFn: async () => {
      const res = await UserService.findAll({ role: UserRole.INSTRUCTOR, limit: 100 }) as { data?: InstructorUser[] } | InstructorUser[];
      return Array.isArray(res) ? res : ((res as { data?: InstructorUser[] }).data ?? []);
    },
    staleTime: 1000 * 60 * 10,
  });

  const { mutate: saveUpdate, isPending } = useMutation({
    mutationFn: (payload: UpdateCoursePayload) => CoursesService.update(id!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      qc.invalidateQueries({ queryKey: ["admin-course", id] });
      qc.invalidateQueries({ queryKey: ["admin-course-edit", id] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    },
    onError: () => setErrors(p => ({ ...p, submit: "Failed to save changes. Please try again." })),
  });

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags(p => [...p, t]); setTagInput(""); }
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!title.trim())                          e.title       = "Course title is required";
    if (!instructorId)                          e.instructor  = "Please assign an instructor";
    if (!description.trim())                    e.description = "Short description is required";
    if (!price || isNaN(+price) || +price < 0)  e.price       = "Valid price is required";
    
    // Check if selected instructor has a profile
    if (instructorId) {
      const selectedInstr = instructors.find(i => {
        const profileId = i.instructorProfile?.id || i.id;
        return profileId === instructorId;
      });
      
      if (selectedInstr && !selectedInstr.instructorProfile?.id) {
        e.instructor = "The selected instructor does not have a complete profile. Please ask them to complete their instructor profile first.";
      }
    }
    
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload: UpdateCoursePayload = {
      title:         title.trim(),
      description:   description.trim(),
      price:         parseFloat(price),
      level,
      status,
      certification,
      instructorId,
      tags:     tags.filter(Boolean),
      syllabus: syllabus.filter(Boolean),
      includes: includes.filter(Boolean),
      ...(videoUrl.trim() && { videoUrl: videoUrl.trim() }),
      ...(img              && { img }),
      ...(badge            && { badge }),
    };
    saveUpdate(payload);
  };

  const selectedInstructor = instructors.find(i => {
    const instructorProfileId = i.instructorProfile?.id || i.id;
    return instructorProfileId === instructorId;
  });

  if (loadingCourse) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <BookOpen className="w-10 h-10 text-gray-300" />
        <p className="text-gray-500">Course not found.</p>
        <Link to="/admin/courses" className="text-sm text-blue-600 hover:underline">Back to courses</Link>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-[900px] mx-auto space-y-6 pb-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Link to={`/admin/courses/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Course
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-[0_6px_20px_rgba(99,102,241,0.4)] flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                  Edit <span className="text-indigo-600 dark:text-indigo-400">Course</span>
                </h1>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" /> Admin
                </span>
              </div>
              <p className="text-sm text-gray-400 truncate">{course.title}</p>
            </div>
          </div>
        </motion.div>

        {/* 1. Instructor */}
        <SectionCard icon={GraduationCap} title="Assigned Instructor" delay={0.04}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Instructor" required error={errors.instructor}>
              <select value={instructorId} onChange={e => setInstructorId(e.target.value)}
                className={cn("w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50/80 dark:bg-white/[0.04] border text-gray-800 dark:text-white outline-none cursor-pointer",
                  errors.instructor ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-white/[0.08]")}>
                <option value="">Select instructor…</option>
                {[
                  // Put currently selected instructor first
                  ...(instructorId ? instructors.filter(i => {
                    const profileId = i.instructorProfile?.id || i.id;
                    return profileId === instructorId;
                  }) : []),
                  // Then the rest of instructors
                  ...instructors.filter(i => {
                    const profileId = i.instructorProfile?.id || i.id;
                    return profileId !== instructorId;
                  })
                ].map(i => {
                  // Use instructor profile ID if available, otherwise fall back to user ID
                  const instructorProfileId = i.instructorProfile?.id || i.id;
                  const hasProfile = !!i.instructorProfile?.id;
                  
                  return (
                    <option key={i.id} value={instructorProfileId} disabled={!hasProfile}>
                      {i.name}{i.instructorProfile?.specialization ? ` — ${i.instructorProfile.specialization}` : ""}{!hasProfile ? " (No profile)" : ""}
                    </option>
                  );
                })}
              </select>
            </Field>

            {selectedInstructor && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06]">
                {selectedInstructor.image ? (
                  <img src={selectedInstructor.image} alt={selectedInstructor.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-black">
                      {selectedInstructor.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedInstructor.name}</p>
                  <p className="text-xs text-gray-400">{selectedInstructor.email}</p>
                </div>
              </motion.div>
            )}
          </div>
        </SectionCard>

        {/* 2. Course Details */}
        <SectionCard icon={FileText} title="Course Details" delay={0.07}>
          <div className="space-y-5">
            <Field label="Course Title" required error={errors.title}>
              <TextInput value={title} onChange={setTitle} placeholder="Course title…" error={!!errors.title} />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>Level</Label>
                <select value={level} onChange={e => setLevel(e.target.value as CourseLevel)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50/80 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white outline-none cursor-pointer">
                  {Object.values(CourseLevel).map(l => (
                    <option key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Certificate Type</Label>
                <select value={certification} onChange={e => setCert(e.target.value as CertificationType)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50/80 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white outline-none cursor-pointer">
                  {Object.values(CertificationType).map(c => (
                    <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <Field label="Short Description" required error={errors.description}>
              <TextArea value={description} onChange={setDescription} placeholder="One paragraph that sells the course…" rows={3} />
            </Field>

            {/* Badge */}
            <div>
              <Label>Badge</Label>
              <div className="flex gap-2 flex-wrap">
                {["", "Bestseller", "Hot & New", "New"].map(b => (
                  <button key={b} onClick={() => setBadge(b)}
                    className={cn("px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                      badge === b ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 dark:border-white/[0.08] text-gray-500 hover:border-indigo-300 hover:text-indigo-600"
                    )}>{b || "No badge"}</button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 flex-wrap mb-2">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                    <Tag className="w-2.5 h-2.5" />{t}
                    <button onClick={() => setTags(p => p.filter(x => x !== t))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <TextInput value={tagInput} onChange={setTagInput} placeholder="Add a tag…" />
                <button onClick={addTag}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex-shrink-0">
                  Add
                </button>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* 3. Thumbnail & Video */}
        <SectionCard icon={ImageIcon} title="Thumbnail & Intro Video" delay={0.10}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label>Course Thumbnail</Label>
              <ImageUpload value={img} onChange={setImg} />
            </div>
            <div>
              <Label>Intro / Preview Video URL</Label>
              <div className="relative">
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://…"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-gray-50/80 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 transition-all" />
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                <Info className="w-3 h-3" /> Short teaser shown on the course landing page.
              </p>
              {videoUrl && (
                <div className="mt-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold truncate">{videoUrl}</p>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* 4. Pricing */}
        <SectionCard icon={DollarSign} title="Pricing & Status" delay={0.13}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Price (USD)" required error={errors.price}>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">$</span>
                <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00"
                  className={cn("w-full pl-8 pr-4 py-2.5 rounded-xl text-sm bg-gray-50/80 dark:bg-white/[0.04] border text-gray-800 dark:text-white outline-none transition-all focus:ring-2 focus:ring-indigo-500/15",
                    errors.price ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-white/[0.08] focus:border-indigo-400"
                  )} />
              </div>
            </Field>
            <div>
              <Label>Publication Status</Label>
              <div className="flex gap-2">
                {([CourseStatus.DRAFT, CourseStatus.PUBLISHED, CourseStatus.ARCHIVED] as const).map(s => (
                  <button key={s} onClick={() => setStatus(s)}
                    className={cn("flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all",
                      status === s ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 dark:border-white/[0.08] text-gray-500 hover:border-indigo-300"
                    )}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* 5. Syllabus */}
        <SectionCard icon={BookOpen} title="What Students Will Learn" delay={0.16}>
          <StringListEditor items={syllabus} onChange={setSyllabus} placeholder="e.g. Build production-ready React applications" />
        </SectionCard>

        {/* 6. Requirements */}
        <SectionCard icon={CheckCircle2} title="Requirements & Prerequisites" delay={0.19}>
          <StringListEditor items={includes} onChange={setIncludes} placeholder="e.g. Basic JavaScript knowledge" />
        </SectionCard>

        {/* 5. Student Enrollment Management */}
        <SectionCard icon={Users} title="Student Enrollment Management" delay={0.16}>
          <StudentEnrollmentManager courseId={id!} />
        </SectionCard>

        {/* Save bar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          className="rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-indigo-600 to-purple-500" />
          <div className="p-6">
            {Object.keys(errors).length > 0 && (
              <div className="mb-4 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                <p className="text-xs font-bold text-red-600 mb-1.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Fix before saving:
                </p>
                {Object.values(errors).filter(Boolean).map(e => (
                  <p key={e} className="text-xs text-red-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-red-400" />{e}
                  </p>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Link to={`/admin/courses/${id}`}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-center border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all">
                Cancel
              </Link>
              <motion.button
                whileHover={!isPending ? { scale: 1.02, boxShadow: "0 10px 32px rgba(99,102,241,0.5)" } : {}}
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={isPending}
                className={cn("flex-[2] py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2.5 transition-all",
                  isPending ? "bg-indigo-400 cursor-wait text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_6px_24px_rgba(99,102,241,0.42)]"
                )}>
                {isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : <><Save className="w-4 h-4" /> Save Changes</>
                }
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showSuccess && <SuccessToast onDone={() => navigate(`/admin/courses/${id}`)} />}
      </AnimatePresence>
    </>
  );
}
