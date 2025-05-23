import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FaSearch } from "react-icons/fa";

function InstructorAssignment() {
  return (
    <div>
      <div className="mb-4 flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <div className="flex flex-col gap-3">
          <h1 className="text-xl font-semibold md:text-2xl">
            Assignments From Instructors
          </h1>

          <div className="relative">
            <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-10 md:w-64"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 md:flex-nowrap">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {["All", "pending", "graded", "submitted"].map((s) => (
                <SelectItem className="capitalize" key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" />
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            {["Title", "Course", "Due Date", "Status", "Action"].map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Assignment Title</TableCell>
            <TableCell>Course Name</TableCell>
            <TableCell>20-05-2025</TableCell>
            <TableCell className="capitalize">graded</TableCell>
            <TableCell>
              <Button size="sm" variant="ghost" disabled>
                Graded
              </Button>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Another Assignment</TableCell>
            <TableCell>React Basics</TableCell>
            <TableCell>22-05-2025</TableCell>
            <TableCell className="capitalize">pending</TableCell>
            <TableCell>-</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6}>Total: 2</TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            Previous
          </Button>
          <Button size="sm" variant="outline">
            Next
          </Button>
        </div>
        <div>
          Page 1 of 3
        </div>
        <Select defaultValue="5">
          <SelectTrigger>
            <SelectValue />
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
}

export default InstructorAssignment;
