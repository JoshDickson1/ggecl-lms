import { SignupFormValues } from "@/components/auth/pages/Signup";
import axiosInstance from "../client";
import { LoginFormValues } from "@/components/auth/pages/Login";

const PREFIX = "/student";

export const signupStudent = async (data: SignupFormValues) => {
  const response = await axiosInstance.post(`${PREFIX}/register`, {
    ...data,
    fullName: data.fullname,
  });
  return response.data;
};

export const loginStudent = async (data: LoginFormValues) => {
  const response = await axiosInstance.post(`${PREFIX}/login`, data);
  return response.data;
};
