import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { FaArrowRight } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LoginPopup from "@/components/ui/LoginPopup";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatZodErrors } from "@/lib/formatZodErrors";
import { AxiosError } from "axios";
import { useCustomNavigate } from "@/hooks/useCustomNavigate";
import { ErrorResType } from "@/types/errorResponseType";
import AuthContainer from "../_components/AuthContainer";
import { LoginResponseSchema } from "@/schemas/studentResponse";
import { loginStudent } from "@/api/services/students";
import { useAuth } from "@/hooks/useAuth";
import { FormHead } from "@/components/ui/FormHead";
import { Link } from "react-router";
import AuthDivider from "@/components/ui/AuthDivider";
import GoogleSigninBtn from "@/components/ui/GoogleSigninBtn";

// Define a schema for our login form data.
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { navigate } = useCustomNavigate();
  const { handleLogin } = useAuth();

  const { mutate, isPending } = useMutation({
    mutationFn: loginStudent,
    onSuccess: (data) => {
      try {
        const validatedData = LoginResponseSchema.parse(data.data);
        handleLogin(validatedData.accessToken);
        toast.success("Login successful! Welcome back");
        navigate("/student/dashboard", { replace: true });
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
      console.error("Login error:", error.response || error);
    },
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    mutate(data);
  };

  return (
    <AuthContainer isPending={isPending}>
      <div className="relative flex w-full flex-col gap-4 md:mt-5 md:p-5">
        <div className="w-full space-y-5">
          <FormHead title="Student Login">
            Login to your student account to start learning
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

          <AuthDivider />

          {/* Google Login */}
          <div className="w-full">
            <GoogleSigninBtn>Continue with Google</GoogleSigninBtn>
          </div>

          {/* Signup Link
          <div className="space-y-3 text-center">
            <p className="text-sm">
              Don't have an account?{" "}
              <CustomLink to="/signup">register</CustomLink>
            </p>

            <p className="text-center text-xs">
              By creating an account, you agree to GGECL's{" "}
              <CustomLink to="https://ggecl.com/terms.html">
                Terms of Service
              </CustomLink>
            </p>
          </div> */}
        </div>
      </div>

      <LoginPopup />
    </AuthContainer>
  );
};

export default Login;
