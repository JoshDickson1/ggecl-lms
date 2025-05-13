import { Student, TUser } from "@/types/userTypes";

export function isStudent(user: TUser | undefined): user is Student {
  console.log("Checking user role:", user?.role);
  return user !== null && user?.role === "student";
}
