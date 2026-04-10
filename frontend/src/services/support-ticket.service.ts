import { APIConfig } from "@/lib/api.config";

// ==================== ENUMS ====================

export enum TicketCategory {
  TECHNICAL   = "TECHNICAL",
  BILLING     = "BILLING",
  COURSE      = "COURSE",
  ACCOUNT     = "ACCOUNT",
  OTHER       = "OTHER",
}

export enum TicketPriority {
  LOW    = "LOW",
  MEDIUM = "MEDIUM",
  HIGH   = "HIGH",
}

export enum TicketStatus {
  OPEN        = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED    = "RESOLVED",
}

// ==================== TYPES ====================

// ─── SHARED ──────────────────────────────────────────────────────────────────

export interface TicketUser {
  id: string;
  name: string;
  role: string;
  image: string | null;
}

export interface TicketUserSummary {
  id: string;
  name: string;
  role: string;
}

// ─── NOTE ────────────────────────────────────────────────────────────────────

export interface TicketNote {
  id: string;
  content: string;
  author: TicketUser;
  createdAt: Date;
}

// ─── TICKET ──────────────────────────────────────────────────────────────────

export interface SupportTicketSummary {
  id: string;
  ticketNumber: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
  user?: TicketUserSummary; // included in admin list views
}

export interface SupportTicketDetail extends SupportTicketSummary {
  description: string;
  attachment: string | null;
  resolvedAt: Date | null;
  notes: TicketNote[];
  user: TicketUser;
}

// ─── PAGINATED ───────────────────────────────────────────────────────────────

export interface PaginatedTicketsMeta {
  total: number;
  page: number;
  limit: number;
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
}

export interface PaginatedTickets {
  data: SupportTicketSummary[];
  meta: PaginatedTicketsMeta;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
}

// ─── PAYLOADS ─────────────────────────────────────────────────────────────────

export interface CreateTicketPayload {
  subject: string;
  category: TicketCategory;
  description: string;
  priority?: TicketPriority;
  attachment?: string;
}

export interface GetTicketsQuery {
  status?: TicketStatus;
  category?: TicketCategory;
  priority?: TicketPriority;
  page?: number;
  limit?: number;
}

// ==================== SERVICE ====================

export default class SupportTicketService {
  // ─── ANY AUTHENTICATED USER ───────────────────────────────────────────────

  /**
   * Create a new support ticket.
   * A unique ticket number (e.g. TKT-007) is auto-generated.
   * @param payload - Subject, category, description, and optional priority/attachment
   */
  static async create(payload: CreateTicketPayload): Promise<SupportTicketDetail> {
    const response = await APIConfig.fetch("/support-tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  /**
   * Get the current user's own tickets, paginated.
   * @param query - Optional filters: status, category, priority, page, limit
   */
  static async findMine(query?: GetTicketsQuery): Promise<PaginatedTickets> {
    const response = await APIConfig.fetch(
      `/support-tickets/mine${this.toQueryString(query)}`
    );
    return response.json();
  }

  /**
   * Get a single ticket by ID.
   * Only the ticket owner or an admin can access this.
   * @param id - Ticket ID
   */
  static async findOne(id: string): Promise<SupportTicketDetail> {
    const response = await APIConfig.fetch(`/support-tickets/${id}`);
    return response.json();
  }

  // ─── ADMIN ONLY ───────────────────────────────────────────────────────────

  /**
   * List all tickets across all users (ADMIN only), paginated.
   * @param query - Optional filters: status, category, priority, page, limit
   */
  static async findAll(query?: GetTicketsQuery): Promise<PaginatedTickets> {
    const response = await APIConfig.fetch(
      `/support-tickets${this.toQueryString(query)}`
    );
    return response.json();
  }

  /**
   * Get ticket counts broken down by status (ADMIN only).
   */
  static async getStats(): Promise<TicketStats> {
    const response = await APIConfig.fetch("/support-tickets/admin/stats");
    return response.json();
  }

  /**
   * Update a ticket's status (ADMIN only).
   * Setting RESOLVED automatically records the resolved timestamp.
   * @param id - Ticket ID
   * @param status - New status
   */
  static async updateStatus(
    id: string,
    status: TicketStatus
  ): Promise<SupportTicketDetail> {
    const response = await APIConfig.fetch(`/support-tickets/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return response.json();
  }

  /**
   * Add an internal note to a ticket (ADMIN only).
   * Notes are visible only to admins.
   * @param id - Ticket ID
   * @param content - Note content
   */
  static async addNote(id: string, content: string): Promise<TicketNote> {
    const response = await APIConfig.fetch(`/support-tickets/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    return response.json();
  }

  /**
   * Permanently delete a ticket and all its notes (ADMIN only).
   * @param id - Ticket ID
   */
  static async deleteOne(id: string): Promise<void> {
    await APIConfig.fetch(`/support-tickets/${id}`, { method: "DELETE" });
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────

  private static toQueryString(query?: GetTicketsQuery): string {
    if (!query) return "";
    const params = new URLSearchParams();
    if (query.status)            params.append("status",   query.status);
    if (query.category)          params.append("category", query.category);
    if (query.priority)          params.append("priority", query.priority);
    if (query.page !== undefined) params.append("page",    String(query.page));
    if (query.limit !== undefined) params.append("limit",  String(query.limit));
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }
}