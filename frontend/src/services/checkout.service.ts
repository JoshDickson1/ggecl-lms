import { APIConfig } from "@/lib/api.config";
import { getCurrency, type CurrencyCode } from "@/lib/currency.utils";
import { useMutation, useQuery } from "@tanstack/react-query";

// ==================== TYPES ====================

export interface CheckoutRequest {
  currency?: CurrencyCode;
  promoCode?: string;
}

export interface CheckoutResponse {
  orderId: string;
  paymentUrl: string;
  amount: number;
  currency: CurrencyCode;
}

export interface PromoValidationRequest {
  code: string;
  currency?: CurrencyCode;
}

export interface PromoValidationResponse {
  valid: boolean;
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  message?: string;
}

export interface OrderStatus {
  orderId: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  amount: number;
  currency: CurrencyCode;
  createdAt: string;
  updatedAt: string;
  courses?: Array<{
    id: string;
    title: string;
  }>;
}

// ==================== SERVICE ====================

export default class CheckoutService {
  /**
   * Initiate checkout from cart
   * Automatically detects currency based on user location
   * @param promoCode - Optional promo code to apply
   */
  static async initiateCheckout(promoCode?: string): Promise<CheckoutResponse> {
    const currency = await getCurrency();
    
    const response = await APIConfig.fetch("/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        currency,
        promoCode 
      } as CheckoutRequest),
    });
    
    return response.json();
  }

  /**
   * Validate a promo code
   * @param code - The promo code to validate
   */
  static async validatePromoCode(code: string): Promise<PromoValidationResponse> {
    const currency = await getCurrency();
    
    const response = await APIConfig.fetch("/checkout/validate-promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        code,
        currency 
      } as PromoValidationRequest),
    });
    
    return response.json();
  }

  /**
   * Get order status by ID
   * @param orderId - The order ID to check
   */
  static async getOrderStatus(orderId: string): Promise<OrderStatus> {
    const response = await APIConfig.fetch(`/checkout/orders/${orderId}`);
    return response.json();
  }
}

// ==================== HOOKS ====================

/**
 * Hook to initiate checkout with automatic currency detection
 */
export function useCheckout() {
  const mutation = useMutation({
    mutationFn: (promoCode?: string) => CheckoutService.initiateCheckout(promoCode),
    onSuccess: (data) => {
      // Redirect to payment URL
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    },
    onError: (error) => {
      console.error('Checkout failed:', error);
    },
  });

  return {
    initiateCheckout: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}

/**
 * Hook to validate promo codes
 */
export function usePromoValidation() {
  const mutation = useMutation({
    mutationFn: (code: string) => CheckoutService.validatePromoCode(code),
  });

  return {
    validatePromo: mutation.mutate,
    validatePromoAsync: mutation.mutateAsync,
    isValidating: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}

/**
 * Hook to get order status
 * @param orderId - The order ID to track
 * @param enabled - Whether to enable the query (default: true)
 */
export function useOrderStatus(orderId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["order-status", orderId],
    queryFn: () => CheckoutService.getOrderStatus(orderId!),
    enabled: enabled && !!orderId,
    refetchInterval: (query) => {
      // Poll every 3 seconds if order is still pending
      return query.state.data?.status === 'PENDING' ? 3000 : false;
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}
