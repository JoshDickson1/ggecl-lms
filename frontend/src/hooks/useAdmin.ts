import { Admin } from "@/types/userTypes";
import { createContext, useContext } from "react";

export const AdminContext = createContext<{ admin: Admin } | undefined>(
  undefined,
);

export function useAdmin() {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error("useAdmin must be used within an AdminContextProvider");
  }
  return context;
}
