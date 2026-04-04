// ─────────────────────────────────────────────────────────────────────────────
// src/dashboards/student-dashboard/pages/StudentSearch.tsx
// ─────────────────────────────────────────────────────────────────────────────
import { BookOpen, Users, Layers } from "lucide-react";
import SearchBase from "@/data/SearchBase";
import { searchCourses, searchCategories, searchInstructors } from "@/data/searchUtils";

export default function StudentSearch() {
  return (
    <SearchBase
      role="student"
      accentColor="from-blue-600 to-indigo-700"
      placeholder="Search courses, instructors, categories…"
      getCourseResults={searchCourses}
      getCategoryResults={searchCategories}
      getInstructorResults={searchInstructors}
      browseLinks={[
        { icon: <BookOpen className="w-5 h-5" />, label: "Browse Courses",    desc: "All available courses",     path: "/student/explore"      },
        { icon: <Users   className="w-5 h-5" />, label: "Instructors",        desc: "Meet your teachers",        path: "/student/instructors"  },
        { icon: <Layers  className="w-5 h-5" />, label: "Categories",         desc: "Explore by subject",        path: "/student/courses"              },
      ]}
    />
  );
}