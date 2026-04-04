// src/dashboards/admin-dashboard/pages/AdminSearch.tsx
import { BookOpen, Users, Layers, GraduationCap, Shield } from "lucide-react";
import SearchBase from "@/data/SearchBase";
import { searchCourses, searchCategories, searchInstructors, searchStudents, searchAdmins } from "@/data/searchUtils";

export default function AdminSearch() {
  return (
    <SearchBase
      role="admin"
      accentColor="from-rose-600 to-pink-700"
      placeholder="Search users, courses, categories…"
      getCourseResults={searchCourses}
      getCategoryResults={searchCategories}
      getInstructorResults={searchInstructors}
      getStudentResults={searchStudents}
      getAdminResults={searchAdmins}
      browseLinks={[
        { icon: <GraduationCap className="w-5 h-5" />, label: "Students",     desc: "Manage all students",       path: "/admin/students"     },
        { icon: <Users         className="w-5 h-5" />, label: "Instructors",  desc: "Manage all instructors",    path: "/admin/instructors"  },
        { icon: <Shield        className="w-5 h-5" />, label: "Admins",       desc: "Manage admin accounts",     path: "/admin/admins"       },
        { icon: <BookOpen      className="w-5 h-5" />, label: "Courses",      desc: "Browse all courses",        path: "/admin/courses"      },
        { icon: <Layers        className="w-5 h-5" />, label: "Categories",   desc: "Course categories",         path: "/admin/categories"            },
      ]}
    />
  );
}