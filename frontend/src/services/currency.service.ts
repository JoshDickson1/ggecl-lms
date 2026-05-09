import { APIConfig } from "@/lib/api.config";
import { useQuery } from "@tanstack/react-query";

// ==================== TYPES ====================

export interface ExchangeRate {
  id: string;
  usdToNgn: number;
  updatedAt: string;
  updatedBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ConversionResult {
  usd: number;
  ngn: number;
  rate: number;
  rateUpdatedAt: string;
}

// ==================== SERVICE ====================

export default class CurrencyService {
  /**
   * Get current USD → NGN exchange rate
   * Publicly accessible endpoint
   */
  static async getExchangeRate(): Promise<ExchangeRate> {
    const response = await APIConfig.fetch("/currency/rate");
    return response.json();
  }

  /**
   * Convert a USD amount to NGN using current platform rate
   * @param usdAmount - The USD amount to convert
   */
  static async convertToNGN(usdAmount: number): Promise<ConversionResult> {
    const response = await APIConfig.fetch(`/currency/convert?usdAmount=${usdAmount}`);
    return response.json();
  }

  /**
   * Batch convert multiple USD amounts to NGN
   * More efficient than multiple individual calls
   * @param usdAmounts - Array of USD amounts to convert
   */
  static async batchConvert(usdAmounts: number[]): Promise<ConversionResult[]> {
    const rate = await this.getExchangeRate();
    return usdAmounts.map(usd => ({
      usd,
      ngn: Math.round(usd * rate.usdToNgn),
      rate: rate.usdToNgn,
      rateUpdatedAt: rate.updatedAt,
    }));
  }
}

// ==================== HOOKS ====================

/**
 * Hook to get current exchange rate
 * Caches for 5 minutes to reduce API calls
 */
export function useExchangeRate() {
  return useQuery({
    queryKey: ["exchange-rate"],
    queryFn: () => CurrencyService.getExchangeRate(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    retry: 2,
  });
}

/**
 * Hook to convert USD to NGN
 * @param usdAmount - The USD amount to convert
 * @param enabled - Whether to enable the query (default: true)
 */
export function useConvertToNGN(usdAmount: number | null, enabled = true) {
  return useQuery({
    queryKey: ["convert-to-ngn", usdAmount],
    queryFn: () => CurrencyService.convertToNGN(usdAmount!),
    enabled: enabled && usdAmount !== null && usdAmount > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to get conversion rate and convert amounts client-side
 * More efficient for converting multiple amounts
 */
export function useCurrencyConverter() {
  const { data: rateData, isLoading, error } = useExchangeRate();

  const convert = (usdAmount: number): number | null => {
    if (!rateData) return null;
    return Math.round(usdAmount * rateData.usdToNgn);
  };

  const formatUSD = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const formatNGN = (amount: number): string => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return {
    rate: rateData?.usdToNgn,
    rateUpdatedAt: rateData?.updatedAt,
    convert,
    formatUSD,
    formatNGN,
    isLoading,
    error,
  };
}
