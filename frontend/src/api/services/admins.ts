import axiosInstance from "../client";
import { LoginFormValues } from "@/components/auth/pages/Login";

const PREFIX = "/admin";

export const loginAdmin = async (data: LoginFormValues) => {
  const response = await axiosInstance.post(`${PREFIX}/login`, data);
  return response.data;
};
