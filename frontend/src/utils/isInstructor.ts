import { Instructor, TUser } from "@/types/userTypes";

export function isInstructor(user: TUser | undefined): user is Instructor {
  console.log("Checking user role:", user?.role);
  return user !== null && user?.role === "instructor";
}
