import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { EllipsisVertical } from "lucide-react";
import { TABLE_ACTIONS, TableActionName } from "../utils/tableActions";
import { Assignment } from "@/utils/trpc";
import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useAssignments } from "../hooks/useAssignments";
import { FaSearch } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type TStudentAssignmentStatusWithAll = Assignment["status"] | "all";

const STATUS_OPTIONS: TStudentAssignmentStatusWithAll[] = [
  "all",
  "pending",
  "submitted",
  "graded",
];

type AssignmentTableProps = {
  onHandleTableAction: (
    actionName: TableActionName,
    assignment: Assignment,
  ) => void;
};

function AssignmentTable({ onHandleTableAction }: AssignmentTableProps) {
  const [statusFilter, setStatusFilter] =
    useState<TStudentAssignmentStatusWithAll>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const { debouncedValue } = useDebounce(searchTerm);

  const { assignments, meta, loading } = useAssignments({
    page: currentPage,
    limit: rowsPerPage,
    search: debouncedValue,
    status: statusFilter !== "all" ? statusFilter : undefined,
    dueDate: dateFilter,
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
  return (
    <main>
      <div className="mb-4 flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <div className="flex flex-col gap-3">
          <div className="mb-5 space-y-0.5">
            <h1 className="text-3xl font-bold md:text-4xl">Your Assignments</h1>
            <p className="text-gray-600 dark:text-gray-300">
              View, search, and manage your assignments.
            </p>
          </div>

          <div className="relative">
            <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 md:w-64"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 md:flex-nowrap">
          <Select
            value={statusFilter}
            onValueChange={(v) =>
              setStatusFilter(v as TStudentAssignmentStatusWithAll)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem className="capitalize" key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={dateFilter?.toDateString()}
            onChange={(e) => setDateFilter(new Date(e.target.value))}
          />
        </div>
      </div>

      <Table>
        <TableHeader className="rounded-lg border bg-gray-50 dark:bg-gray-800">
          <TableRow>
            {["S/N", "Title", "Course", "Due Date", "Status", "Actions"].map(
              (h) => (
                <TableHead
                  key={h}
                  className="font-semibold text-gray-800 dark:text-gray-100"
                >
                  {h}
                </TableHead>
              ),
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell className="text-center italic" colSpan={6}>
                Loading...
              </TableCell>
            </TableRow>
          ) : assignments.length > 0 ? (
            assignments.map((assignment, i) => (
              <TableRow key={assignment._id.toString()}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{assignment.title}</TableCell>
                <TableCell>{assignment.course.title}</TableCell>
                <TableCell>
                  {format(new Date(assignment.dueDate), "dd-MM-yyyy")}
                </TableCell>
                <TableCell>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      assignment.status === "graded"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : assignment.status === "submitted"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" // Progress
                    }`}
                  >
                    {assignment.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        aria-label={`Actions for ${assignment.title}`}
                      >
                        <EllipsisVertical size={18} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      side="left"
                      align="start"
                      className="w-auto rounded-md border p-1 shadow-md dark:border-gray-700 dark:bg-gray-800"
                    >
                      {TABLE_ACTIONS.map((action) => (
                        <Button
                          onClick={() =>
                            onHandleTableAction(
                              action.name,
                              assignment as unknown as Assignment,
                            )
                          }
                          key={action.name}
                          variant="ghost"
                          className={cn(
                            "flex w-full items-center justify-start gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700",
                            {
                              hidden:
                                assignment.status === "graded" &&
                                action.name === "Upload",
                              "cursor-not-allowed opacity-50":
                                assignment.status === "submitted" &&
                                action.name === "Upload",
                            },
                          )}
                          aria-label={`${action.name} ${assignment.title}`}
                        >
                          <action.icon size={16} />
                          <span>{action.name}</span>
                        </Button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-10 text-center text-gray-500 italic dark:text-gray-400"
              >
                No assignments found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={6}>Total: {assignments.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {/* Pagination */}
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
    </main>
  );
}

export default AssignmentTable;
