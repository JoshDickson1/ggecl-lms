import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { Link } from "react-router";
import { useStudentCourses } from "../hooks/useStudentCourses";

const PAGE_SIZES = [5, 10, 20];

const StudentCourses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZES[0]);

  const { debouncedValue } = useDebounce(searchTerm);

  const { courses, meta, loading } = useStudentCourses({
    page: currentPage,
    limit: rowsPerPage,
    search: debouncedValue,
  });

  // Reset to first page when debounced search changes or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedValue, rowsPerPage]);

  const totalPages = meta?.totalPages ?? 1;
  const totalItems = meta?.total ?? 0;

  const changePage = useCallback(
    (dir: "prev" | "next") => {
      setCurrentPage((p) =>
        dir === "prev" ? Math.max(1, p - 1) : Math.min(totalPages, p + 1),
      );
    },
    [totalPages],
  );

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold">Your Courses</h1>
          <p className="text-muted-foreground mt-1">
            View courses you&apos;ve enrolled in and track your progress
          </p>
        </div>
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:gap-4 md:space-y-0">
          <div className="relative w-full">
            <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-36">
            <Select
              value={rowsPerPage.toString()}
              onValueChange={(val) => setRowsPerPage(Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Rows per page" />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {loading ? (
        <p className="text-muted-foreground text-center">Loading courses...</p>
      ) : courses.length === 0 ? (
        <p className="text-muted-foreground text-center">No courses found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <Card
              key={course._id.toString()}
              className="group bg-card cursor-pointer gap-3 overflow-hidden rounded-2xl py-0 transition-shadow hover:shadow-lg"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={course.img}
                  alt={course.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <CardHeader className="px-2">
                <CardTitle className="text-lg font-semibold">
                  {course.title}
                </CardTitle>
                <CardDescription className="mt-1 text-sm">
                  Instructor: {course.instructor.fullName}
                </CardDescription>
              </CardHeader>
              <CardFooter className="px-2 py-4">
                <Link
                  to={`/student/dashboard/courses/${course._id.toString()}`}
                >
                  <Button className="ml-auto max-w-xl">View</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && !loading && (
        <div className="mt-6 flex items-center justify-center space-x-2">
          <Button
            disabled={currentPage === 1}
            onClick={() => changePage("prev")}
          >
            First
          </Button>
          <Button
            disabled={currentPage === 1}
            onClick={() => changePage("prev")}
          >
            Previous
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "outline" : "ghost"}
              onClick={() => handlePageClick(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            disabled={currentPage === totalPages}
            onClick={() => changePage("next")}
          >
            Next
          </Button>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            Last
          </Button>
        </div>
      )}

      {meta && !loading && (
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Showing page {currentPage} of {totalPages} — {totalItems} courses
          total
        </p>
      )}
    </div>
  );
};

export default StudentCourses;
