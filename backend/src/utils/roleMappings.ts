import { Model } from "mongoose";
import instructorModel, { IInstructor } from "../models/instructorModel.js";
import studentModel, { IStudent } from "../models/studentModel.js";
import adminModel, { IAdmin } from "../models/adminModel.js";

export type UserRole = "student" | "instructor" | "admin";
export type UserModel = IStudent | IInstructor | IAdmin;

export type RoleConfig<T extends string, K> = {
  [P in T]: Model<Extract<K, { role: P }>>;
};

export const roleMappings: RoleConfig<UserRole, UserModel> = {
  student: studentModel,
  instructor: instructorModel,
  admin: adminModel,
};

export const combinedUserModel = (role: UserRole) =>
  roleMappings[role] as Model<IAdmin | IInstructor | IStudent>;
