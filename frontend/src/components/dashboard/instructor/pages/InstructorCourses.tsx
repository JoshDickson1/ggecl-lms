import { useCallback, useEffect, useState } from "react";
import { MoreVertical, ClipboardList, Video } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useCourses } from "@/hooks/useCourses";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInstructor } from "@/hooks/useInstructor";

const CourseManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { debouncedValue } = useDebounce(searchTerm);

  const { instructor } = useInstructor();

  const { loading, meta, courses } = useCourses({
    page: currentPage,
    limit: rowsPerPage,
    search: debouncedValue,
    instructor: instructor._id.toString() || undefined,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = meta?.totalPages ?? 1;

  const changePage = useCallback(
    (dir: "prev" | "next") => {
      setCurrentPage((p) =>
        dir === "prev" ? Math.max(1, p - 1) : Math.min(totalPages, p + 1),
      );
    },
    [totalPages],
  );

  const handleVideoCall = (courseId: string) => {
    console.log(`Video call for course ID: ${courseId}`);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-5 space-y-0.5">
        <h1 className="text-3xl font-bold md:text-4xl">Your Courses</h1>
        <p className="text-muted-foreground text-sm">
          Manage courses assigned to you
        </p>
      </div>
      <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border px-4 py-2 focus:ring-2 focus:ring-gray-500 focus:outline-none md:w-64"
          />
        </div>
      </div>

      <Table className="rounded-lg">
        <TableHeader className="rounded-t-xl bg-gray-100 font-semibold dark:bg-gray-700">
          <TableRow>
            <TableHead>Course Name</TableHead>
            <TableHead>Instructor</TableHead>
            <TableHead>Students</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell className="text-center italic" colSpan={6}>
                Loading...
              </TableCell>
            </TableRow>
          ) : courses.length > 0 ? (
            courses.map((course) => (
              <TableRow key={course._id.toString()}>
                <TableCell>{course.title}</TableCell>
                <TableCell>{course.instructor.fullName}</TableCell>
                <TableCell>{course?.students?.length ?? 0}</TableCell>
                <TableCell>{`$${course.price}` || "FREE"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link to={"/instructor/dashboard/check-assignments"}>
                        <DropdownMenuItem>
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Give Assignment
                        </DropdownMenuItem>
                      </Link>

                      <DropdownMenuItem
                        onClick={() => handleVideoCall(course._id.toString())}
                      >
                        <Video className="mr-2 h-4 w-4" />
                        Schedule a video call
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell className="text-center italic" colSpan={7}>
                No Courses were found or has been assigned to you...
              </TableCell>
            </TableRow>
          )}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={7}>Total: {courses.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => changePage("prev")}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => changePage("next")}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
        <div>
          Page {currentPage} of {totalPages}
        </div>
        <Select
          value={rowsPerPage.toString()}
          onValueChange={(v) => setRowsPerPage(Number(v))}
        >
          <SelectTrigger>
            <SelectValue defaultValue={5} />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20].map((n) => (
              <SelectItem key={n} value={n.toString()}>
                {n} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CourseManagement;
