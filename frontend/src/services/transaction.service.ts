import { APIConfig } from "@/lib/api.config";

// ==================== ENUMS ====================

export enum TransactionType {
  ENROLLMENT = "ENROLLMENT",
}

export enum TransactionStatus {
  COMPLETED  = "COMPLETED",
  PENDING    = "PENDING",
  FAILED     = "FAILED",
  PROCESSING = "PROCESSING",
  CANCELLED  = "CANCELLED",
}

export enum PaymentMethod {
  CARD       = "CARD",
  PAYSTACK   = "PAYSTACK",
  STRIPE     = "STRIPE",
  BANK       = "BANK",
  WALLET     = "WALLET",
}

// ==================== TYPES ====================

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  paymentMethod?: PaymentMethod;
  paystackReference?: string;
  stripeReference?: string;
  description?: string;
  metadata?: Record<string, any>;
  
  // Participant information
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  
  // Course information (for enrollments)
  courseId?: string;
  course?: {
    id: string;
    title: string;
    img?: string | null;
  };
  
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface TransactionQuery {
  type?: TransactionType;
  status?: TransactionStatus;
  userId?: string;
  courseId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  cursor?: string;
  limit?: number;
  sortBy?: "createdAt" | "amount" | "completedAt";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedTransactions {
  items: Transaction[];
  nextCursor: string | null;
  total?: number;
}

// ==================== SERVICE ====================

export default class TransactionService {
  
  /**
   * Get all transactions (ADMIN only).
   * Returns paginated list with filters.
   * @param query - Optional filters and pagination
   */
  static async findAll(query?: TransactionQuery): Promise<PaginatedTransactions> {
    try {
      const response = await APIConfig.fetch(
        `/dashboard/admin/transactions${this.toQueryString(query)}`
      );
      return response.json();
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('Transaction endpoint not found. The backend may not have implemented this endpoint yet.');
        } else if (error.message.includes('403')) {
          throw new Error('Access denied. Admin privileges required to view transactions.');
        } else if (error.message.includes('401')) {
          throw new Error('Please log in to view transactions.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Get a single transaction by ID (ADMIN only).
   * @param id - Transaction ID
   */
  static async findOne(id: string): Promise<Transaction> {
    try {
      const response = await APIConfig.fetch(`/dashboard/admin/transactions/${id}`);
      return response.json();
    } catch (error) {
      console.error(`Failed to fetch transaction ${id}:`, error);
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error(`Transaction not found: ${id}`);
        } else if (error.message.includes('403')) {
          throw new Error('Access denied. Admin privileges required.');
        } else if (error.message.includes('401')) {
          throw new Error('Please log in to view transaction details.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Get transaction statistics (ADMIN only).
   * Returns summary of revenue.
   */
  static async getStatistics(): Promise<{
    totalRevenue: number;
    completedTransactions: number;
    failedTransactions: number;
  }> {
    try {
      const response = await APIConfig.fetch('/dashboard/admin/transactions/statistics');
      return response.json();
    } catch (error) {
      console.error('Failed to fetch transaction statistics:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('Statistics endpoint not found. The backend may not have implemented this endpoint yet.');
        } else if (error.message.includes('403')) {
          throw new Error('Access denied. Admin privileges required.');
        } else if (error.message.includes('401')) {
          throw new Error('Please log in to view statistics.');
        }
      }
      
      throw error;
    }
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  private static toQueryString(query?: TransactionQuery): string {
    if (!query) return "";
    const params = new URLSearchParams();

    if (query.type)         params.append("type",       query.type);
    if (query.status)       params.append("status",     query.status);
    if (query.userId)       params.append("userId",     query.userId);
    if (query.courseId)     params.append("courseId",   query.courseId);
    if (query.search)       params.append("search",     query.search);
    if (query.startDate)    params.append("startDate",  query.startDate);
    if (query.endDate)      params.append("endDate",    query.endDate);
    if (query.minAmount !== undefined) params.append("minAmount", String(query.minAmount));
    if (query.maxAmount !== undefined) params.append("maxAmount", String(query.maxAmount));
    if (query.cursor)       params.append("cursor",     query.cursor);
    if (query.sortBy)       params.append("sortBy",     query.sortBy);
    if (query.sortOrder)    params.append("sortOrder",  query.sortOrder);
    if (query.limit !== undefined) params.append("limit", String(query.limit));

    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }
}
