<<<<<<< HEAD
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useInstructor } from "@/hooks/useInstructor";
import { useStudents } from "@/hooks/useStudents";
import React, { useState, useEffect, useCallback } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Studentlist: React.FC = () => {
  const { instructor } = useInstructor();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { debouncedValue } = useDebounce(searchTerm);

  const { students, meta, loading } = useStudents({
    page: currentPage,
    limit: rowsPerPage,
    search: debouncedValue,
    instructor: instructor._id.toString(),
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
    <div className="p-6 text-gray-800 md:p-8 dark:text-gray-200">
      <div className="mb-5 space-y-0.5">
        <h1 className="text-3xl font-bold md:text-4xl">Your Students</h1>
        <p className="text-muted-foreground text-sm">
          Manage students enrolled in your courses
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          {/* Search Field */}
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Input
              type="text"
              placeholder="Search by full name"
              className="w-full rounded-md border border-gray-300 px-4 py-2 md:w-1/3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                    <input type="checkbox" />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Student Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-900">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center italic">
                      Loading...
                    </td>
                  </tr>
                ) : students.length > 0 ? (
                  students.map((student) => (
                    <tr
                      key={student.email}
                      className="transition hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-3">
                        <input type="checkbox" />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                        {student.fullName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                        {student.email}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">
                        <button
                          disabled
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-10 text-center text-gray-500 italic"
                    >
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Show rows:
              <select
                className="ml-2 rounded-md border px-2 py-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <button
                onClick={() => changePage("prev")}
                className={`rounded border px-2 py-1 dark:border-gray-600 ${
                  currentPage === 1 ? "cursor-not-allowed opacity-50" : ""
                }`}
                disabled={currentPage === 1}
              >
                <FaChevronLeft />
              </button>
              <span>
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={() => changePage("next")}
                className={`rounded border px-2 py-1 dark:border-gray-600 ${
                  currentPage === totalPages || totalPages === 0
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studentlist;
=======
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useInstructor } from "@/hooks/useInstructor";
import { useStudents } from "@/hooks/useStudents";
import React, { useState, useEffect, useCallback } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Studentlist: React.FC = () => {
  const { instructor } = useInstructor();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { debouncedValue } = useDebounce(searchTerm);

  const { students, meta, loading } = useStudents({
    page: currentPage,
    limit: rowsPerPage,
    search: debouncedValue,
    instructor: instructor._id.toString(),
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
    <div className="p-6 text-gray-800 md:p-8 dark:text-gray-200">
      <div className="mb-5 space-y-0.5">
        <h1 className="text-3xl font-bold md:text-4xl">Your Students</h1>
        <p className="text-muted-foreground text-sm">
          Manage students enrolled in your courses
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          {/* Search Field */}
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Input
              type="text"
              placeholder="Search by full name"
              className="w-full rounded-md border border-gray-300 px-4 py-2 md:w-1/3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                    <input type="checkbox" />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Student Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-900">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center italic">
                      Loading...
                    </td>
                  </tr>
                ) : students.length > 0 ? (
                  students.map((student) => (
                    <tr
                      key={student.email}
                      className="transition hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-3">
                        <input type="checkbox" />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                        {student.fullName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                        {student.email}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">
                        <button
                          disabled
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-10 text-center text-gray-500 italic"
                    >
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Show rows:
              <select
                className="ml-2 rounded-md border px-2 py-1 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <button
                onClick={() => changePage("prev")}
                className={`rounded border px-2 py-1 dark:border-gray-600 ${
                  currentPage === 1 ? "cursor-not-allowed opacity-50" : ""
                }`}
                disabled={currentPage === 1}
              >
                <FaChevronLeft />
              </button>
              <span>
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={() => changePage("next")}
                className={`rounded border px-2 py-1 dark:border-gray-600 ${
                  currentPage === totalPages || totalPages === 0
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studentlist;
>>>>>>> a4957a46c4262faa31a5c0da3d6672bb1ac4e991
 