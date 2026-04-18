// ─────────────────────────────────────────────────────────────────────────────
// src/dashboards/admin-dashboard/pages/AdminSearch.tsx
// ─────────────────────────────────────────────────────────────────────────────
import { BookOpen, Users, Layers, GraduationCap, Shield } from "lucide-react";
import SearchBase from "@/data/SearchBase";
import {
  authSearchCourses,
  authSearchCategories,
  authSearchInstructors,
  authSearchStudents,
} from "@/data/searchApi";
 
// Admins are excluded from all result sets per the API spec,
// so getAdminResults is intentionally omitted.
export default function AdminSearch() {
  return (
    <SearchBase
      role="admin"
      accentColor="from-rose-600 to-pink-700"
      placeholder="Search users, courses, categories…"
      getCourseResults={authSearchCourses}
      getCategoryResults={authSearchCategories}
      getInstructorResults={authSearchInstructors}
      getStudentResults={authSearchStudents}
      browseLinks={[
        { icon: <GraduationCap className="w-5 h-5" />, label: "Students",    desc: "Manage all students",    path: "/admin/students"    },
        { icon: <Users         className="w-5 h-5" />, label: "Instructors", desc: "Manage all instructors", path: "/admin/instructors" },
        { icon: <Shield        className="w-5 h-5" />, label: "Admins",      desc: "Manage admin accounts",  path: "/admin/admins"      },
        { icon: <BookOpen      className="w-5 h-5" />, label: "Courses",     desc: "Browse all courses",     path: "/admin/courses"     },
        { icon: <Layers        className="w-5 h-5" />, label: "Categories",  desc: "Course categories",      path: "/admin/categories"  },
      ]}
    />
  );
}
 