import ListContainer from "@/components/ui/ListContainer";
import CourseBox from "./CourseBox";
import { useCourses } from "@/hooks/useCourses";

function Courses() {
  const { courses, loading } = useCourses({});

  return (
    <ListContainer
      isLoading={loading}
      header="Top courses"
      path="/courses"
      render={courses.map((course) => (
        <CourseBox key={course._id.toString()} course={course} />
      ))}
    />
  );
}

export default Courses;
