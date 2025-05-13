import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { FaArrowRight } from "react-icons/fa";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";

import { ErrorResType } from "@/types/errorResponseType.ts";
import { formatZodErrors } from "@/lib/formatZodErrors.ts";
import { AxiosError } from "axios";

import { useCustomNavigate } from "@/hooks/useCustomNavigate.ts";
import { useAuth } from "@/hooks/useAuth.ts";
import AuthContainer from "../_components/AuthContainer.tsx";
import { FormHead } from "@/components/ui/FormHead.tsx";
import { Link } from "react-router";
import { AdminLoginResponseSchema } from "@/schemas/adminResponse.ts";
import { loginAdmin } from "@/api/services/admins.ts";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type loginFormType = z.infer<typeof loginSchema>;

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);

  const { navigate } = useCustomNavigate();
  const { handleLogin } = useAuth();

  const form = useForm<loginFormType>({
    resolver: zodResolver(loginSchema),
  });

  const { isPending, mutate } = useMutation({
    mutationFn: loginAdmin,
    onSuccess: (data) => {
      try {
        const validatedData = AdminLoginResponseSchema.parse(data.data);
        handleLogin(validatedData.accessToken);
        toast.success("Login successful! Welcome back");
        navigate("/admin/dashboard", { replace: true });
      } catch (parseError) {
        console.error("Data validation failed:", parseError);
        toast.error("Unexpected response from server. Please try again.");
      }
    },
    onError: (error: AxiosError) => {
      const errorResponseData = error?.response?.data as ErrorResType<string>;
      if (errorResponseData?.message?.toLowerCase()?.includes("validation")) {
        toast.error(formatZodErrors(errorResponseData));
        return;
      }
      toast.error(
        errorResponseData?.message ||
          "An error occurred, please try again later",
      );
      console.error("Login error:", error.response?.data || error);
    },
  });

  function onSubmit(data: loginFormType) {
    mutate(data);
  }

  return (
    <AuthContainer isPending={isPending}>
      <div className="relative flex w-full flex-col gap-4 md:mt-5 md:p-5">
        <div className="w-full space-y-5">
          <FormHead title="Admin Login">
            Login to start managing instructors and students
          </FormHead>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="text-base-content/40 absolute top-1/2 left-3 -translate-y-1/2" />
                        <Input
                          placeholder="joshdickon@gmail.com"
                          {...field}
                          className="border border-blue-300/30 py-6 pl-12 shadow-sm outline-none focus:ring-2 focus:ring-blue-300/30 md:py-5"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="text-base-content/40 absolute top-1/2 left-3 -translate-y-1/2" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="border border-blue-300/30 py-6 pl-12 shadow-sm outline-none focus:ring-2 focus:ring-blue-300/30 md:py-5"
                        />
                        <button
                          type="button"
                          className="absolute top-1/2 right-3 -translate-y-1/2"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? (
                            <EyeOff className="text-base-content/40 h-5 w-5" />
                          ) : (
                            <Eye className="text-base-content/40 h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-3 flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" className="accent-[#184471]" />
                  <span className="text-sm">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full border border-blue-300/30 bg-gray-900 font-semibold hover:bg-gray-800 disabled:border-0 disabled:bg-gray-400 dark:text-white dark:disabled:bg-gray-700"
              >
                <span>Login</span>
                <FaArrowRight />
              </Button>
            </form>
          </Form>

        </div>
      </div>
    </AuthContainer>
  );
};

export default AdminLogin;
