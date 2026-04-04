// src/dashboards/instructor-dashboard/pages/InstructorSearch.tsx
import { BookOpen, Layers, GraduationCap } from "lucide-react";
import SearchBase from "@/data/SearchBase.tsx";
import { searchCourses, searchCategories, searchInstructors, searchStudents } from "@/data/searchUtils";

export default function InstructorSearch() {
  return (
    <SearchBase
      role="instructor"
      accentColor="from-violet-600 to-purple-700"
      placeholder="Search courses, students, instructors…"
      getCourseResults={searchCourses}
      getCategoryResults={searchCategories}
      getInstructorResults={searchInstructors}
      getStudentResults={searchStudents}
      browseLinks={[
        { icon: <BookOpen       className="w-5 h-5" />, label: "My Courses",   desc: "Manage your courses",       path: "/instructor/courses"      },
        { icon: <GraduationCap  className="w-5 h-5" />, label: "Students",     desc: "View enrolled students",    path: "/instructor/students"          },
        { icon: <Layers         className="w-5 h-5" />, label: "Categories",   desc: "Browse all categories",       path: "/instructor/categories"                 },
      ]}
    />
  );
}