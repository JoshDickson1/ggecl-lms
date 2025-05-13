import { useCallback, useEffect, useState } from "react";
import { MoreVertical, Edit, Trash, Plus, UserPlus } from "lucide-react";
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
import EnrollStudentModal from "../components/EnrollStudentModal";
import { useDebounce } from "@/hooks/useDebounce";
import { useCourses } from "@/hooks/useCourses";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CourseManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { debouncedValue } = useDebounce(searchTerm);

  const { loading, meta, courses } = useCourses({
    page: currentPage,
    limit: rowsPerPage,
    search: debouncedValue,
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

  const handleDeleteCourse = (courseId: string) => {
    console.log(`Course with ID ${courseId} deleted`);
  };

  const handleModelOpenChange = (state: boolean) => {
    setIsModalOpen(state);
  };

  const handleEnrollStudents = (courseId: string) => {
    setSelectedCourse(courseId);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
        <h1 className="text-2xl font-bold">Course Management</h1>
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border px-4 py-2 focus:ring-2 focus:ring-gray-500 focus:outline-none md:w-64"
          />
          <Link to="/admin/dashboard/add-course">
            <Button>
              <Plus className="h-4 w-4" />
              Add Course
            </Button>
          </Link>
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
                      <DropdownMenuItem asChild>
                        <Link
                          to={"/admin/dashboard/edit-course/" + course._id.toString()}
                          className="flex flex-row items-center px-2"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="ml-2">Edit</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleDeleteCourse(course._id.toString())
                        }
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleEnrollStudents(course._id.toString())
                        }
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Enroll Students
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell className="text-center italic" colSpan={7}>
                No Courses were found...
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

      <EnrollStudentModal
        selectedCourse={selectedCourse}
        onModalOpen={handleModelOpenChange}
        isModalOpen={isModalOpen}
      />
    </div>
  );
};

export default CourseManagement;
