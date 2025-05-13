import { Instructor } from "@/types/userTypes";
import { createContext, useContext } from "react";

export const InstructorContext = createContext<{ instructor: Instructor } | undefined>(
  undefined,
);

export function useInstructor() {
  const context = useContext(InstructorContext);

  if (!context) {
    throw new Error("useInstructor must be used within an InstructorContextProvider");
  }
  return context;
}
