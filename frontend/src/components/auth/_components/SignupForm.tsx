import { JSX, useState } from "react";
import { FieldValues, useFormContext } from "react-hook-form";
import { FaCheck, FaCheckCircle } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { FormHead } from "@/components/ui/FormHead";
import { CustomLink } from "@/components/ui/CustomLink";
import GoogleSigninBtn from "@/components/ui/GoogleSigninBtn";
import AuthDivider from "@/components/ui/AuthDivider";

export default function SignupForm({
  onNext,
}: {
  onNext: (data: FieldValues) => void;
}): JSX.Element {
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const form = useFormContext();
  const errors = form.formState.errors;

  // Check password requirements
  function handleCheckPassword(password: string) {
    return [
      { message: "One lowercase letter", isChecked: /[a-z]/.test(password) },
      { message: "One uppercase letter", isChecked: /[A-Z]/.test(password) },
      { message: "One number", isChecked: /[0-9]/.test(password) },
      {
        message: "One special character",
        isChecked: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      },
      { message: "6 or more characters", isChecked: password.length >= 6 },
    ];
  }

  const password: string = form.watch("password") || "";
  const email: string = form.watch("email") || "";
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <>
      <form className="relative flex w-full flex-col gap-4 space-y-4 md:mt-5 md:p-5">
        <FormHead title="Create an account">
          Start your student journey with us Today!
        </FormHead>

        <div className="space-y-4">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel className="text-md font-semibold">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                      className={cn(
                        "w-full rounded-sm border border-blue-300/30 bg-transparent py-6 pl-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-300/30 md:py-5",
                        { "border-red-500": errors.email },
                      )}
                    />
                    <aside className="absolute top-1/2 right-2 -translate-y-1/2 transform">
                      {errors.email && !isEmailValid ? (
                        <FaXmark className="text-red-500" size={22} />
                      ) : (
                        email &&
                        isEmailValid && (
                          <FaCheckCircle className="text-green-500" size={22} />
                        )
                      )}
                    </aside>
                  </div>
                </FormControl>
                <FormMessage>
                  {errors.email && (errors.email.message as string)}
                </FormMessage>
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel className="text-md font-semibold">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={isPasswordHidden ? "password" : "text"}
                      placeholder="Enter your password"
                      className={cn(
                        "w-full rounded-sm border border-blue-300/30 bg-transparent py-6 pl-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-300/30 md:py-5",
                        { "border-red-500": errors.password },
                      )}
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-2 flex -translate-y-1/2 transform items-center gap-1"
                      onClick={() => setIsPasswordHidden((prev) => !prev)}
                    >
                      {isPasswordHidden ? (
                        <IoEye className="h-5 w-5" />
                      ) : (
                        <IoEyeOff className="h-5 w-5" />
                      )}
                      <span className="text-sm">
                        {isPasswordHidden ? "Show" : "Hide"}
                      </span>
                    </button>
                  </div>
                </FormControl>
                <FormMessage>
                  {errors.password && (errors.password.message as string)}
                </FormMessage>
              </FormItem>
            )}
          />

          {/* Password Requirements */}
          {password && (
            <PasswordChecks password={password} checks={handleCheckPassword} />
          )}
        </div>

        <Button
          type="button"
          onClick={onNext}
          disabled={form.formState.isSubmitting}
          className="border border-blue-300/30 bg-gray-900 font-semibold hover:bg-gray-800 disabled:border-0 disabled:bg-gray-400 dark:text-white dark:disabled:bg-gray-700"
        >
          {form.formState.isSubmitting ? "Processing..." : "Proceed"}
        </Button>

        <AuthDivider />

        <GoogleSigninBtn>Continue with Google</GoogleSigninBtn>

        <div className="space-y-3 text-center">
          <p className="text-sm">
            Already have an account? <CustomLink to="/login">login</CustomLink>
          </p>
          <p className="text-xs">
            By creating an account, you agree to GGECL's{" "}
            <CustomLink to="https://ggecl.com/terms.html">
              Terms of Service
            </CustomLink>
          </p>
        </div>
      </form>
    </>
  );
}

interface PasswordType {
  message: string;
  isChecked: boolean;
}

interface PasswordChecksType {
  password: string;
  checks: (password: string) => PasswordType[];
}

function PasswordChecks({ password, checks }: PasswordChecksType): JSX.Element {
  return (
    <div className="mt-4 space-y-2">
      {checks(password).map(({ message, isChecked }) => (
        <div
          key={message}
          className={cn(
            "flex items-center gap-3",
            isChecked ? "text-green-500" : "text-red-500",
          )}
        >
          {isChecked ? <FaCheck /> : <FaXmark />}
          <span>{message}</span>
        </div>
      ))}
    </div>
  );
}
