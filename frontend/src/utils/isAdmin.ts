import { Admin, TUser } from "@/types/userTypes";

export function isAdmin(user: TUser | undefined): user is Admin {
  console.log("Checking user role:", user?.role);
  return user !== null && user?.role === "admin";
}
