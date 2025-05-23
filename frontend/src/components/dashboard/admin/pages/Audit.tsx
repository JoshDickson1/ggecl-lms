import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const users = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@admin.com",
    role: "Admin",
    status: "Active",
    createdAt: "2025-05-10",
  },
  {
    id: 2,
    name: "Brian Smith",
    email: "brian@instructor.com",
    role: "Instructor",
    status: "Active",
    createdAt: "2025-05-12",
  },
  {
    id: 3,
    name: "Clara Doe",
    email: "clara@student.com",
    role: "Student",
    status: "Inactive",
    createdAt: "2025-05-14",
  },
  {
    id: 4,
    name: "Daniel Umeh",
    email: "daniel@student.com",
    role: "Student",
    status: "Active",
    createdAt: "2025-05-17",
  },
  {
    id: 5,
    name: "Emily Adams",
    email: "emily@instructor.com",
    role: "Instructor",
    status: "Inactive",
    createdAt: "2025-05-18",
  },
  {
    id: 6,
    name: "Franklin George",
    email: "franklin@admin.com",
    role: "Admin",
    status: "Active",
    createdAt: "2025-05-18",
  },
];

const roleColor = (role: string) => {
  switch (role) {
    case "Admin":
      return "bg-red-100 text-red-600";
    case "Instructor":
      return "bg-blue-100 text-blue-600";
    case "Student":
      return "bg-green-100 text-green-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const statusColor = (status: string) => {
  return status === "Active"
    ? "bg-emerald-100 text-emerald-600"
    : "bg-yellow-100 text-yellow-600";
};

const PAGE_SIZE = 4;

const Audit = () => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(users.length / PAGE_SIZE);

  const paginatedUsers = users.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="p-2 md:p-4 space-y-8">
      <h1 className="text-3xl font-bold">Audit Trail</h1>

      <div className="md:rounded-xl md:border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 py-4 text-base">Name</TableHead>
              <TableHead className="px-6 py-4 text-base">Email</TableHead>
              <TableHead className="px-6 py-4 text-base">Role</TableHead>
              <TableHead className="px-6 py-4 text-base">Status</TableHead>
              <TableHead className="px-6 py-4 text-base">Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="px-6 py-4 text-sm font-medium">
                  {user.name}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm">{user.email}</TableCell>
                <TableCell className="px-6 py-4">
                  <Badge className={cn("text-xs", roleColor(user.role))}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Badge className={cn("text-xs", statusColor(user.status))}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm">
                  {user.createdAt}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end items-center gap-4 pt-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages}
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Audit;
