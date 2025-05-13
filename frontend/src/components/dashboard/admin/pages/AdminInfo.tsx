import { useEffect, useState, useCallback } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAdmins } from "../hooks/useAdmins";
import { useEnrollAdmin } from "../hooks/useEnrollAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/useDebounce";

// ---------------- Validation Schema ----------------
const AdminRegistrationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  picture: z.string().url("Invalid URL format").optional().or(z.literal("")), // allow empty
});

type AdminFormValues = z.infer<typeof AdminRegistrationSchema>;

// ---------------- AdminForm Component ----------------
const AdminForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminFormValues>({
    resolver: zodResolver(AdminRegistrationSchema),
  });

  const { enrollAdmin, isEnrolling } = useEnrollAdmin();

  const onSubmit = async (data: AdminFormValues) => {
    enrollAdmin(data, {
      onSuccess: () => {
        setTimeout(() => {
          reset();
        }, 2000);
      },
    });
  };

  return (
    <div className="w-full rounded-lg border p-6 shadow-md md:max-w-xl dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
        Add New Admin
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <div>
          <Label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name
          </Label>
          <Input
            type="text"
            {...register("fullName")}
            className="w-full rounded-md border px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-500">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <Label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email Address
          </Label>
          <Input
            type="email"
            {...register("email")}
            className="w-full rounded-md border px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isEnrolling} className="w-fit px-5">
          {isEnrolling ? "Adding..." : "Add Admin"}
        </Button>
      </form>
    </div>
  );
};

const AdminList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { debouncedValue } = useDebounce(searchTerm);

  const { admins, meta, loading } = useAdmins({
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

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
        Admins
      </h2>

      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between">
        <Input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-xs rounded-md border px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Rows per page:
          </span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(+e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-md border px-2 py-1 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {[5, 10, 25].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg shadow-md dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {["Name", "Email", "Actions"].map((a) => (
                <th
                  key={a}
                  className="px-4 py-3 text-left text-sm font-semibold dark:text-gray-300"
                >
                  {a}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : admins.length !== 0 ? (
              admins.map((admin) => (
                <tr
                  key={admin.email}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-3 text-sm dark:text-gray-200">
                    {admin.fullName}
                  </td>
                  <td className="px-4 py-3 text-sm dark:text-gray-200">
                    {admin.email}
                  </td>
                  <td className="py-3 text-center text-sm dark:text-gray-400">
                    <button className="text-red-600 hover:text-red-800">
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
                  No admins found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => changePage("prev")}
            disabled={currentPage === 1}
            className="rounded p-2 disabled:opacity-50"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={() => changePage("next")}
            disabled={currentPage === totalPages}
            className="rounded p-2 disabled:opacity-50"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminInfo: React.FC = () => (
  <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
    <div className="mb-5 space-y-0.5">
      <h1 className="text-3xl font-bold md:text-4xl">Admin Management</h1>
      <p className="text-muted-foreground text-sm">veiw your fellow admins</p>
    </div>
    <AdminForm />
    <AdminList />
  </div>
);

export default AdminInfo;
