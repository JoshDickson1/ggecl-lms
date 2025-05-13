import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import { SignupFormValues } from "../pages/InstructorSignup";
import { FormHead } from "@/components/ui/FormHead";
import AuthDivider from "@/components/ui/AuthDivider";
import GoogleSigninBtn from "@/components/ui/GoogleSigninBtn";
import { CustomLink } from "@/components/ui/CustomLink";
import { JSX } from "react";

interface SignupDetailsFormProps {
  onSubmit: (data: SignupFormValues) => void;
}

function SignupDetailsForm({ onSubmit }: SignupDetailsFormProps): JSX.Element {
  const form = useFormContext<SignupFormValues>();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="relative flex w-full flex-col gap-3 md:p-5"
      >
        <FormHead title="Tell us about yourself">
          Let us know more about you
        </FormHead>

        <FormField
          control={form.control}
          name="fullname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Full Name Here"
                  {...field}
                  className="border border-blue-300/30 py-6 shadow-sm outline-none md:py-5 dark:border-blue-300/20 dark:bg-gray-900"
                />
              </FormControl>
              <FormDescription>
                This should appear exactly as in your documents
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value as string}
              >
                <FormControl>
                  <SelectTrigger className="border border-blue-300/30 py-6 shadow-sm outline-none md:py-5 dark:border-blue-300/20 dark:bg-gray-900">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="dark:border-blue-300/30 dark:bg-gray-900">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of birth</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value || ""}
                  className="border border-blue-300/30 shadow-sm outline-none dark:border-blue-300/20 dark:bg-gray-900"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="my-3">
          Signup
        </Button>

        <AuthDivider />

        <GoogleSigninBtn>Continue with Google</GoogleSigninBtn>
        <p className="text-center text-sm">
          By creating an account, you agree to GGECL's{" "}
          <CustomLink to="https://ggecl.com/terms.html">
            Terms of Service
          </CustomLink>
          ,{" "}
          <CustomLink to="https://ggecl.com/terms.html">
            Privacy Policy
          </CustomLink>
        </p>
      </form>
    </Form>
  );
}

export default SignupDetailsForm;
