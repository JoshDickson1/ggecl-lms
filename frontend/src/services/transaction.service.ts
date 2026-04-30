import { APIConfig } from "@/lib/api.config";

// ==================== TYPES ====================

export type OrderStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELLED";
export type Gateway = "PAYSTACK" | "STRIPE";

export interface TransactionStudent {
  id: string;
  name: string;
  email: string;
}

export interface TransactionPayment {
  id: string;
  gateway: Gateway;
  gatewayRef: string;
  status: string;
  paidAt: string | null;
}

export interface TransactionItem {
  id: string;
  courseId: string;
  courseTitle: string;
  priceAtPurchase: number;
}

export interface Transaction {
  orderId: string;
  status: OrderStatus;
  currency: string;
  gateway: Gateway;
  subtotal: number;
  discountAmount: number;
  total: number;
  promoCodeSnapshot: string | null;
  student: TransactionStudent;
  payment: TransactionPayment | null;
  items: TransactionItem[];
  createdAt: string;
}

export interface TransactionListResponse {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionAnalytics {
  totalRevenue: number;
  totalCompletedOrders: number;
  averageOrderValue: number;
  totalEnrollments: number;
  averageCostPerEnrollment: number;
  pendingOrders: number;
  failedOrders: number;
  revenueByGateway: { gateway: string; revenue: number; count: number }[];
}

export interface TransactionListQuery {
  search?: string;
  status?: OrderStatus;
  gateway?: Gateway;
  sortBy?: "createdAt" | "total" | "status";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
  minAmount?: number;
  maxAmount?: number;
}

// ==================== SERVICE ====================

export default class TransactionService {
  static async getAnalytics(): Promise<TransactionAnalytics> {
    const res = await APIConfig.fetch("/transactions/analytics");
    return res.json();
  }

  static async findAll(query?: TransactionListQuery): Promise<TransactionListResponse> {
    const res = await APIConfig.fetch(`/transactions${toQS(query)}`);
    return res.json();
  }

  static async findOne(orderId: string): Promise<Transaction> {
    const res = await APIConfig.fetch(`/transactions/${orderId}`);
    return res.json();
  }
}

function toQS(q?: TransactionListQuery): string {
  if (!q) return "";
  const p = new URLSearchParams();
  if (q.search)                   p.set("search",    q.search);
  if (q.status)                   p.set("status",    q.status);
  if (q.gateway)                  p.set("gateway",   q.gateway);
  if (q.sortBy)                   p.set("sortBy",    q.sortBy);
  if (q.order)                    p.set("order",     q.order);
  if (q.page   !== undefined)     p.set("page",      String(q.page));
  if (q.limit  !== undefined)     p.set("limit",     String(q.limit));
  if (q.minAmount !== undefined)  p.set("minAmount", String(q.minAmount));
  if (q.maxAmount !== undefined)  p.set("maxAmount", String(q.maxAmount));
  const s = p.toString();
  return s ? `?${s}` : "";
}
