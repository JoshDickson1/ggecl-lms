import { APIConfig } from "@/lib/api.config";

// ==================== ENUMS ====================

export enum UserRole {
  ADMIN      = "ADMIN",
  INSTRUCTOR = "INSTRUCTOR",
  STUDENT    = "STUDENT",
}

// ==================== TYPES ====================

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  /** Optional profile image URL */
  image?: string;
}

interface InstructorProfilePayload {
  bio?: string;
  description?: string;
  specialization?: string;
  website?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  areasOfExpertise?: string[];
  teachingCategories?: string[];
  tags?: string[];
}

interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  image?: string;
  role?: UserRole;
  bio?: string;
  phone?: string;
  location?: string;
  instructorProfile?: InstructorProfilePayload;
}

export interface UserQuery {
  search?: string;
  role?: UserRole;
  cursor?: string;
  limit?: number;
  sortBy?: "createdAt" | "name" | "email";
  sortOrder?: "asc" | "desc";
}

// ==================== SERVICE ====================

export default class UserService {
  // ─── PUBLIC (no auth required) ───────────────────────────────────────────────

  /**
   * List users publicly (e.g. instructors on the landing page).
   * No authentication required.
   * @param query - Optional filters and pagination
   */
  static async findAllPublic(query?: UserQuery): Promise<unknown> {
    const response = await APIConfig.fetch(
      `/users/public${this.toQueryString(query)}`
    );
    return response.json();
  }

  /**
   * Get a single user's public profile.
   * No authentication required.
   * @param id - User ID
   */
  static async findOnePublic(id: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/users/public/${id}`);
    return response.json();
  }

  // ─── AUTHENTICATED ────────────────────────────────────────────────────────────

  /**
   * Get the currently authenticated user's own profile.
   * Works for all roles.
   */
  static async getMe(): Promise<unknown> {
    const response = await APIConfig.fetch("/users/mine");
    return response.json();
  }

  /**
   * Get all users with full detail.
   * ADMIN only.
   * @param query - Optional filters and pagination
   */
  static async findAll(query?: UserQuery): Promise<unknown> {
    const response = await APIConfig.fetch(
      `/users${this.toQueryString(query)}`
    );
    return response.json();
  }

  /**
   * Get a single user by ID with full detail.
   * ADMIN can fetch any user. Users can fetch their own profile.
   * @param id - User ID
   */
  static async findOne(id: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/users/${id}`);
    return response.json();
  }

  /**
   * Create a new user.
   * Typically used by ADMIN to manually create accounts.
   * @param payload - User data
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
   * Update a user by ID.
   * ADMIN can update any user. Users can only update themselves.
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
   * ADMIN can delete any user. Users can delete their own account.
   * @param id - User ID
   */
  static async remove(id: string): Promise<unknown> {
    const response = await APIConfig.fetch(`/users/${id}`, {
      method: "DELETE",
    });
    return response.json();
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  private static toQueryString(query?: UserQuery): string {
    if (!query) return "";
    const params = new URLSearchParams();

    if (query.search)                 params.append("search",    query.search);
    if (query.role)                   params.append("role",      query.role);
    if (query.cursor)                 params.append("cursor",    query.cursor);
    if (query.sortBy)                 params.append("sortBy",    query.sortBy);
    if (query.sortOrder)              params.append("sortOrder", query.sortOrder);
    if (query.limit !== undefined)    params.append("limit",     String(query.limit));

    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }
}