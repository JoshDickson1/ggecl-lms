import { Student } from "@/types/userTypes";
import { createContext, useContext } from "react";

export const StudentContext = createContext<{ student: Student } | undefined>(
  undefined,
);

export function useStudent() {
  const context = useContext(StudentContext);

  if (!context) {
    throw new Error("useStudent must be used within a StudentContextProvider");
  }
  return context;
}
