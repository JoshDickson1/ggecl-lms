import { APIConfig } from "@/lib/api.config";

// ==================== ENUMS ====================

export enum Role {
  ADMIN      = "ADMIN",
  INSTRUCTOR = "INSTRUCTOR",
  STUDENT    = "STUDENT",
}

export enum Gender {
  MALE   = "MALE",
  FEMALE = "FEMALE",
  OTHER  = "OTHER",
}

export enum UserStatus {
  ACTIVE   = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANNED   = "BANNED",
}

// ==================== TYPES ====================

export interface CreateUserPayload {
  email: string;
  name: string;
  role: Role;
  password?: string;
  gender?: Gender;
  location?: string;
  // Student fields
  matricNumber?: string;
  // Instructor fields
  department?: string;
}

export interface UpdateUserPayload {
  name?: string;
  role?: Role;
  gender?: Gender;
  status?: UserStatus; // Admin-only
  location?: string;
  // Student fields
  matricNumber?: string;
  learningGoals?: string[];
  // Instructor fields
  department?: string;
  bio?: string;
  description?: string;
  tags?: string[];
  website?: string;
  areasOfExpertise?: string[];
  professionalExperience?: string;
  teachingCategories?: string[];
  specialization?: string;
}

// ==================== SERVICE ====================

export default class UserService {
  /**
   * Create a new user (ADMIN only).
   * @param payload - User data including role-specific fields
   */
  static async create(payload: CreateUserPayload): Promise<unknown> {
    const response = await APIConfig.fetch("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * Get all users, optionally filtered by role.
   * @param role - Optional role filter
   */
  static async findAll(role?: Role): Promise<unknown[]> {
    const qs = role ? `?role=${role}` : "";
    const response = await APIConfig.fetch(`/users${qs}`);
    return response.json();
  }

  /**
   * Get a single user by ID.
   * @param id - User ID
   */
  static async findOne(id: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/users/${id}`);
    return response.json();
  }

  /**
   * Update a user by ID.
   * Users can only update their own account; ADMINs can update any.
   * @param id - User ID
   * @param payload - Fields to update
   */
  static async update(id: string, payload: UpdateUserPayload): Promise<unknown> {
    const response = await APIConfig.fetch(`/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * Delete a user by ID.
   * Users can only delete their own account; ADMINs can delete any.
   * @param id - User ID
   */
  static async remove(id: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/users/${id}`, { method: "DELETE" });
    return response.json();
  }
}