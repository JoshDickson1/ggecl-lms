// src/dashboards/admin-dashboard/pages/AdminCreateCourse.tsx
// Route: /admin/courses/create

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Shield, BookOpen, GraduationCap, DollarSign,
  FileText, X, Loader2, CheckCircle2, Plus, Info,
  ImageIcon, Video, Tag, Users, Search, Check,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CoursesService, {
  CourseLevel, CourseStatus, CertificationType,
  type CreateCoursePayload,
} from "@/services/course.service";
import UserService, { UserRole } from "@/services/user.service";
import EnrollmentService from "@/services/enrollment.service";
import StorageService from "@/services/storage.service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InstructorUser {
  id: string;
  name: string;
  image: string | null;
  email: string;
  instructorProfile?: { 
    id?: string; // Instructor profile ID (different from user ID)
    bio?: string;
    description?: string;
    tags?: string[];
    areasOfExpertise?: string[];
    teachingCategories?: string[];
    specialization?: string | null;
    website?: string | null;
    github?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
    youtube?: string | null;
  };
}

interface StudentUser {
  id: string;
  name: string;
  image: string | null;
  email: string;
  studentProfile?: { id: string };
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

function TextInput({ value, onChange, placeholder, type = "text", error }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; error?: boolean;
}) {
  const [f, setF] = useState(false);
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
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

function SectionCard({ icon: Icon, title, description, children, delay = 0, accent = "blue" }: {
  icon: React.ElementType; title: string; description?: string;
  children: React.ReactNode; delay?: number; accent?: "blue" | "violet";
}) {
  const grad = accent === "violet"
    ? "from-violet-500 to-violet-700 shadow-[0_3px_10px_rgba(139,92,246,0.35)]"
    : "from-blue-500 to-blue-700 shadow-[0_3px_10px_rgba(59,130,246,0.35)]";
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38, delay }}
      className="rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="flex items-start gap-3 px-6 py-5 border-b border-gray-100 dark:border-white/[0.06]">
        <div className={cn("w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 mt-0.5", grad)}>
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
          <button onClick={() => onChange("")}
            className="absolute top-2 right-2 w-7 h-7 rounded-xl bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
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

// ─── Student Picker ───────────────────────────────────────────────────────────

function StudentPicker({ selected, onChange }: {
  selected: StudentUser[];
  onChange: (students: StudentUser[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen]     = useState(false);
  const [showAll, setShowAll] = useState(false);
  const debounceRef         = useRef<ReturnType<typeof setTimeout>>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(v), 350);
  }, []);

  // Load all students when showAll is true, or search results when searching
  const { data: results = [], isFetching } = useQuery<StudentUser[]>({
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

  const toggle = (student: StudentUser) => {
    if (selected.some(s => s.id === student.id)) {
      onChange(selected.filter(s => s.id !== student.id));
    } else {
      onChange([...selected, student]);
    }
  };

  const remove = (id: string) => onChange(selected.filter(s => s.id !== id));

  const toggleAll = () => {
    if (selected.length === results.length && results.length > 0) {
      onChange([]);
    } else {
      const newSelection = results.filter(student => !selected.some(s => s.id === student.id));
      onChange([...selected, ...newSelection]);
    }
  };

  const isAllSelected = results.length > 0 && selected.length === results.length;
  // const isPartiallySelected = selected.length > 0 && selected.length < results.length;

  return (
    <div className="space-y-4">
      {/* Search and controls */}
      <div className="flex gap-2">
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
            placeholder="Search students by name or email…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-gray-50/80 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-white placeholder:text-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15 transition-all"
          />
          {isFetching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500 animate-spin" />
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

      {/* Dropdown results */}
      <AnimatePresence>
        {open && (showAll || debouncedSearch.length >= 2) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl bg-white dark:bg-[#141c2b] border border-gray-100 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-20 overflow-hidden"
          >
            {/* Header with select all */}
            {results.length > 0 && (
              <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {results.length} student{results.length !== 1 ? "s" : ""} found
                </span>
                <button
                  onClick={toggleAll}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                    bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/40
                    hover:bg-violet-100 dark:hover:bg-violet-950/50"
                >
                  {isAllSelected ? (
                    <><X className="w-3 h-3" /> Deselect All</>
                  ) : (
                    <><CheckCircle2 className="w-3 h-3" /> Select All</>
                  )}
                </button>
              </div>
            )}
            
            {/* Student list with checkboxes */}
            <div className="max-h-64 overflow-y-auto">
              {results.length > 0 ? (
                results.map(student => {
                  const isSelected = selected.some(s => s.id === student.id);
                  return (
                    <div key={student.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
                      <button
                        onClick={() => toggle(student)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          isSelected
                            ? "bg-violet-600 border-violet-600"
                            : "border-gray-300 dark:border-gray-600 hover:border-violet-400"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </button>
                      
                      {student.image ? (
                        <img src={student.image} alt={student.name} className="w-8 h-8 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-black">
                            {student.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{student.name}</p>
                        <p className="text-xs text-gray-400 truncate">{student.email}</p>
                      </div>
                      
                      {isSelected && (
                        <div className="px-2 py-1 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                          <span className="text-xs font-bold">Selected</span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-gray-400">
                    {showAll ? "No students available" : `No students found for "${debouncedSearch}"`}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected students summary */}
      {selected.length > 0 && (
        <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-violet-700 dark:text-violet-300">
              {selected.length} student{selected.length !== 1 ? "s" : ""} selected
            </span>
            <button
              onClick={() => onChange([])}
              className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-200 transition-colors"
            >
              Clear all
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selected.slice(0, 10).map(student => (
              <motion.span key={student.id} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl bg-white dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/40 text-violet-700 dark:text-violet-300">
                {student.image ? (
                  <img src={student.image} alt={student.name} className="w-4 h-4 rounded-lg object-cover" />
                ) : (
                  <div className="w-4 h-4 rounded-lg bg-violet-500 flex items-center justify-center">
                    <span className="text-white text-[8px] font-black">{student.name[0]}</span>
                  </div>
                )}
                <span className="text-xs font-bold max-w-[100px] truncate">{student.name}</span>
                <button onClick={() => remove(student.id)} className="text-violet-400 hover:text-violet-700 dark:hover:text-violet-200 transition-colors">
                  <X className="w-2.5 h-2.5" />
                </button>
              </motion.span>
            ))}
            {selected.length > 10 && (
              <span className="text-xs text-violet-600 dark:text-violet-400 font-bold px-2 py-1">
                +{selected.length - 10} more
              </span>
            )}
          </div>
        </div>
      )}

      {!showAll && search.length === 0 && selected.length === 0 && (
        <div className="text-center py-6">
          <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400 mb-2">No students selected</p>
          <p className="text-xs text-gray-400">Search for students or click "Show All" to browse</p>
        </div>
      )}
    </div>
  );
}

function SuccessOverlay({ onDone, enrollCount }: { onDone: () => void; enrollCount: number }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, delay: 0.1 }}
        className="rounded-[28px] p-12 text-center bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_24px_80px_rgba(0,0,0,0.2)] max-w-sm w-full mx-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, delay: 0.25 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-[0_8px_32px_rgba(16,185,129,0.4)]">
          <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={1.5} />
        </motion.div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Course Created!</h2>
        <p className="text-sm text-gray-400 mb-2">The course has been created and assigned to the instructor.</p>
        {enrollCount > 0 && (
          <p className="text-sm text-violet-600 dark:text-violet-400 font-semibold mb-4">
            {enrollCount} student{enrollCount !== 1 ? "s" : ""} enrolled.
          </p>
        )}
        <button onClick={onDone}
          className="w-full py-3 rounded-2xl text-sm font-black bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_16px_rgba(59,130,246,0.4)] transition-colors mt-2">
          Go to Courses
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type Errors = Record<string, string>;

export default function AdminCreateCourse() {
  const navigate = useNavigate();
  const qc       = useQueryClient();

  const [title,             setTitle]            = useState("");
  const [description,       setDescription]       = useState("");
  const [videoUrl,          setVideoUrl]          = useState("");
  const [img,               setImg]               = useState("");
  const [price,             setPrice]             = useState("0");
  const [level,             setLevel]             = useState<CourseLevel>(CourseLevel.BEGINNER);
  const [status,            setStatus]            = useState<CourseStatus>(CourseStatus.DRAFT);
  const [certification,     setCert]              = useState<CertificationType>(CertificationType.NORMAL);
  const [badge,             setBadge]             = useState("");
  const [tags,              setTags]              = useState<string[]>([]);
  const [tagInput,          setTagInput]          = useState("");
  const [syllabus,          setSyllabus]          = useState<string[]>(["", ""]);
  const [includes,          setIncludes]          = useState<string[]>(["", ""]);
  const [instructorId,      setInstructorId]      = useState("");
  const [selectedStudents,  setSelectedStudents]  = useState<StudentUser[]>([]);
  const [errors,            setErrors]            = useState<Errors>({});
  const [success,           setSuccess]           = useState(false);
  const [enrolledCount,     setEnrolledCount]     = useState(0);

  const { data: instructors = [], isLoading: instructorsLoading } = useQuery<InstructorUser[]>({
    queryKey: ["instructors-list"],
    queryFn: async () => {
      const res = await UserService.findAll({ role: UserRole.INSTRUCTOR, limit: 100 }) as { data?: InstructorUser[] } | InstructorUser[];
      const instructorsList = Array.isArray(res) ? res : ((res as { data?: InstructorUser[] }).data ?? []);
      
      // Log to help debug if instructorProfile.id is missing
      if (instructorsList.length > 0) {
        console.log('Sample instructor data:', instructorsList[0]);
        console.log('Has instructorProfile.id?', !!instructorsList[0]?.instructorProfile?.id);
      }
      
      return instructorsList;
    },
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });

  const { mutate: saveCreate, isPending } = useMutation({
    mutationFn: (payload: CreateCoursePayload) => CoursesService.create(payload),
    onSuccess: async (data: unknown) => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      qc.invalidateQueries({ queryKey: ["courses"] });

      const courseId = (data as { id?: string })?.id;

      if (courseId && selectedStudents.length > 0) {
        try {
          // The bulk enroll endpoint requires studentProfile IDs, not user IDs
          const studentIds = selectedStudents
            .map(s => s.studentProfile?.id)
            .filter((id): id is string => !!id);

          const skipped = selectedStudents.length - studentIds.length;

          if (studentIds.length > 0) {
            const result = await EnrollmentService.adminBulkEnroll(courseId, studentIds) as {
              enrolled?: number; failed?: number;
            };
            setEnrolledCount(result?.enrolled ?? studentIds.length);
          }

          if (skipped > 0) {
            setErrors(p => ({
              ...p,
              enrollment: `${skipped} student${skipped !== 1 ? "s" : ""} skipped — no student profile found.`,
            }));
          }
        } catch (enrollErr) {
          setErrors(p => ({
            ...p,
            enrollment: `Course created, but enrollment failed: ${enrollErr instanceof Error ? enrollErr.message : "Unknown error"}`,
          }));
        }
      }

      setSuccess(true);
    },
    onError: (err: unknown) => {
      let message = "Failed to create course. Please try again.";
      if (err instanceof Error) {
        if (err.message.includes("400")) {
          if (err.message.includes("videoUrl")) {
            message = "Invalid video URL. Please enter a valid HTTP/HTTPS URL or leave it empty.";
          } else if (err.message.includes("Instructor profile")) {
            message = "The selected instructor does not have a complete profile. Please ask them to complete their instructor profile first.";
          } else {
            message = "Invalid course data. Please check all required fields.";
          }
        }
        else if (err.message.includes("403")) message = "You don't have permission to create courses.";
        else if (err.message.includes("401")) message = "Please log in to create courses.";
        else if (err.message.includes("Instructor profile not found")) {
          message = "The selected instructor does not have a complete profile. Please ask them to complete their instructor profile first.";
        }
        else message = err.message;
      }
      setErrors(p => ({ ...p, submit: message }));
    },
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
    if (instructors.length === 0)               e.instructor  = "No instructors available. Please contact support.";

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

    if (videoUrl.trim()) {
      try { 
        const url = new URL(videoUrl.trim());
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          e.videoUrl = "Please enter a valid HTTP or HTTPS URL for the intro video (e.g., https://example.com/video.mp4)";
        }
      } catch {
        e.videoUrl = "Please enter a valid URL for the intro video (e.g., https://example.com/video.mp4)";
      }
    }

    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleCreate = () => {
    if (!validate()) return;

    const payload: CreateCoursePayload = {
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
      ...(videoUrl.trim() && (() => {
        try { 
          const url = new URL(videoUrl.trim());
          // Ensure it's a valid URL with protocol
          if (url.protocol === 'http:' || url.protocol === 'https:') {
            return { videoUrl: videoUrl.trim() };
          }
          return {};
        } catch { 
          return {}; 
        }
      })()),
      ...(img   && { img }),
      ...(badge && { badge }),
    };

    saveCreate(payload);
  };

  const selectedInstructor = instructors.find(i => {
    const instructorProfileId = i.instructorProfile?.id || i.id;
    return instructorProfileId === instructorId;
  });

  return (
    <>
      <div className="max-w-[900px] mx-auto space-y-6 pb-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/admin/courses" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-[0_6px_20px_rgba(59,130,246,0.4)] flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                  Create <span className="text-blue-600 dark:text-blue-400">Course</span>
                </h1>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" /> Admin
                </span>
              </div>
              <p className="text-sm text-gray-400">Create a course and assign it to an instructor. The instructor will upload the curriculum.</p>
            </div>
          </div>
        </motion.div>

        {/* 1. Instructor */}
        <SectionCard icon={GraduationCap} title="Assign Instructor" description="Who will teach this course?" delay={0.05}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Instructor" required error={errors.instructor}>
              {instructorsLoading ? (
                <div className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50/80 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-gray-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading instructors...
                </div>
              ) : instructors.length === 0 ? (
                <div className="w-full px-4 py-2.5 rounded-xl text-sm bg-red-50/80 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
                  No instructors available. Please contact support.
                </div>
              ) : (
                <select value={instructorId} onChange={e => setInstructorId(e.target.value)}
                  className={cn("w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50/80 dark:bg-white/[0.04] border text-gray-800 dark:text-white outline-none cursor-pointer",
                    errors.instructor ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-white/[0.08]")}>
                  <option value="">Select instructor...</option>
                  {instructors.map(i => {
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
              )}
            </Field>

            {selectedInstructor && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06]">
                {selectedInstructor.image ? (
                  <img src={selectedInstructor.image} alt={selectedInstructor.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
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
        <SectionCard icon={FileText} title="Course Details" delay={0.08}>
          <div className="space-y-5">
            <Field label="Course Title" required error={errors.title}>
              <TextInput value={title} onChange={setTitle} placeholder="e.g. The Complete React & TypeScript Bootcamp" error={!!errors.title} />
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
                      badge === b ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 dark:border-white/[0.08] text-gray-500 hover:border-blue-300 hover:text-blue-600"
                    )}>{b || "No badge"}</button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 flex-wrap mb-2">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                    <Tag className="w-2.5 h-2.5" />{t}
                    <button onClick={() => setTags(p => p.filter(x => x !== t))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <TextInput value={tagInput} onChange={setTagInput} placeholder="Add a tag…" />
                <button onClick={addTag}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all flex-shrink-0">
                  Add
                </button>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* 3. Thumbnail & Intro Video */}
        <SectionCard icon={ImageIcon} title="Thumbnail & Intro Video" description="Optional — can be added later on the edit page" delay={0.11}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label>Course Thumbnail</Label>
              <ImageUpload value={img} onChange={setImg} />
            </div>
            <div>
              <Label>Intro / Preview Video URL</Label>
              <div className="relative">
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input 
                  value={videoUrl} 
                  onChange={e => setVideoUrl(e.target.value)} 
                  placeholder="https://example.com/video.mp4"
                  className={cn("w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-gray-50/80 dark:bg-white/[0.04] border text-gray-800 dark:text-white placeholder:text-gray-400 outline-none transition-all",
                    errors.videoUrl ? "border-red-300 dark:border-red-700 focus:border-red-400 focus:ring-2 focus:ring-red-500/15" : "border-gray-200 dark:border-white/[0.08] focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15"
                  )} 
                />
              </div>
              {errors.videoUrl && (
                <p className="text-xs text-red-500 mt-1">{errors.videoUrl}</p>
              )}
              <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                <Info className="w-3 h-3" /> Short teaser shown on the course landing page. Leave empty if none.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* 4. Pricing */}
        <SectionCard icon={DollarSign} title="Pricing & Status" delay={0.14}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Price (USD)" required error={errors.price}>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">$</span>
                <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00"
                  className={cn("w-full pl-8 pr-4 py-2.5 rounded-xl text-sm bg-gray-50/80 dark:bg-white/[0.04] border text-gray-800 dark:text-white outline-none transition-all focus:ring-2 focus:ring-blue-500/15",
                    errors.price ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-white/[0.08] focus:border-blue-400"
                  )} />
              </div>
            </Field>
            <div>
              <Label>Publication Status</Label>
              <div className="flex gap-2">
                {([CourseStatus.DRAFT, CourseStatus.PUBLISHED] as const).map(s => (
                  <button key={s} onClick={() => setStatus(s)}
                    className={cn("flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all",
                      status === s ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 dark:border-white/[0.08] text-gray-500 hover:border-blue-300"
                    )}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* 5. Enroll Students */}
        <SectionCard icon={Users} title="Enroll Students" description="Optional — search and pre-enroll students into this course" delay={0.17} accent="violet">
          <StudentPicker selected={selectedStudents} onChange={setSelectedStudents} />
        </SectionCard>

        {/* 6. Syllabus */}
        <SectionCard icon={BookOpen} title="What Students Will Learn" description="Outcomes shown on the course landing page" delay={0.2}>
          <StringListEditor items={syllabus} onChange={setSyllabus} placeholder="e.g. Build production-ready React applications" />
        </SectionCard>

        {/* 7. Requirements */}
        <SectionCard icon={CheckCircle2} title="Requirements & Prerequisites" delay={0.23}>
          <StringListEditor items={includes} onChange={setIncludes} placeholder="e.g. Basic JavaScript knowledge" />
        </SectionCard>

        {/* Save bar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
          className="rounded-[22px] bg-white dark:bg-[#0f1623] border border-gray-100 dark:border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500" />
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: "Title",       value: title || "—" },
                { label: "Instructor",  value: selectedInstructor?.name.split(" ")[0] || "—" },
                { label: "Level",       value: level.charAt(0) + level.slice(1).toLowerCase() },
                { label: "Price",       value: price ? `$${parseFloat(price || "0").toFixed(2)}` : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-2xl p-3 bg-gray-50/80 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                  <p className="text-xs font-black text-gray-900 dark:text-white truncate">{value}</p>
                </div>
              ))}
            </div>

            {selectedStudents.length > 0 && (
              <div className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800/30">
                <Users className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                <p className="text-xs font-semibold text-violet-700 dark:text-violet-400">
                  {selectedStudents.length} student{selectedStudents.length !== 1 ? "s" : ""} will be enrolled after creation
                </p>
              </div>
            )}

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

            {errors.enrollment && (
              <div className="mb-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
                <p className="text-xs font-bold text-amber-600 mb-1.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Enrollment Notice:
                </p>
                <p className="text-xs text-amber-500">{errors.enrollment}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Link to="/admin/courses"
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-center border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all">
                Cancel
              </Link>
              <motion.button
                whileHover={!isPending ? { scale: 1.02, boxShadow: "0 10px 32px rgba(59,130,246,0.5)" } : {}}
                whileTap={{ scale: 0.97 }}
                onClick={handleCreate}
                disabled={isPending}
                className={cn("flex-[2] py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2.5 transition-all",
                  isPending ? "bg-blue-400 cursor-wait text-white" : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_6px_24px_rgba(59,130,246,0.42)]"
                )}>
                {isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
                  : <><Shield className="w-4 h-4" />{status === CourseStatus.PUBLISHED ? "Create & Publish" : "Create as Draft"}</>
                }
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {success && <SuccessOverlay enrollCount={enrolledCount} onDone={() => navigate("/admin/courses")} />}
      </AnimatePresence>
    </>
  );
}
