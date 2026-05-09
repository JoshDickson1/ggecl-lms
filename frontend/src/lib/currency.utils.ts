/**
 * Currency detection utility
 * Detects user's country and returns appropriate currency code
 */

export type CurrencyCode = 'NGN' | 'USD';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
  },
};

/**
 * Detect user's currency based on their location
 * Uses multiple detection methods in order of reliability:
 * 1. Timezone detection
 * 2. Browser language
 * 3. Geolocation API (if available)
 * 4. Defaults to USD
 */
export async function detectCurrency(): Promise<CurrencyCode> {
  // Method 1: Check timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (timezone.includes('Lagos') || timezone.includes('Africa')) {
    return 'NGN';
  }

  // Method 2: Check browser language
  const language = navigator.language || (navigator as any).userLanguage;
  if (language && language.toLowerCase().includes('ng')) {
    return 'NGN';
  }

  // Method 3: Try to get country from locale
  try {
    const locale = new Intl.Locale(language);
    if ((locale as any).region === 'NG') {
      return 'NGN';
    }
  } catch {
    // Locale API not supported or failed
  }

  // Default to USD for international users
  return 'USD';
}

/**
 * Get currency information by code
 */
export function getCurrencyInfo(code: CurrencyCode): CurrencyInfo {
  return CURRENCIES[code];
}

/**
 * Format amount with currency symbol
 */
export function formatCurrency(amount: number, currencyCode: CurrencyCode): string {
  const currency = CURRENCIES[currencyCode];
  
  // Format with appropriate decimal places
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${currency.symbol}${formatted}`;
}

/**
 * Convert USD to NGN using a provided rate
 * Note: For real-time conversion, use CurrencyService.convertToNGN() instead
 * This is a utility function for client-side conversion when you already have the rate
 * 
 * @param amount - Amount to convert
 * @param from - Source currency
 * @param to - Target currency
 * @param rate - Optional exchange rate (USD to NGN). If not provided, uses fallback rate
 */
export function convertCurrency(
  amount: number, 
  from: CurrencyCode, 
  to: CurrencyCode,
  rate?: number
): number {
  if (from === to) return amount;
  
  // Fallback rate if not provided (should use CurrencyService for real rates)
  const USD_TO_NGN_RATE = rate || 1500;
  
  if (from === 'USD' && to === 'NGN') {
    return Math.round(amount * USD_TO_NGN_RATE);
  }
  
  if (from === 'NGN' && to === 'USD') {
    return amount / USD_TO_NGN_RATE;
  }
  
  return amount;
}

/**
 * Store detected currency in localStorage for consistency
 */
export function saveCurrencyPreference(currency: CurrencyCode): void {
  try {
    localStorage.setItem('preferred_currency', currency);
  } catch {
    // localStorage not available
  }
}

/**
 * Get stored currency preference
 */
export function getCurrencyPreference(): CurrencyCode | null {
  try {
    const stored = localStorage.getItem('preferred_currency');
    if (stored === 'NGN' || stored === 'USD') {
      return stored;
    }
  } catch {
    // localStorage not available
  }
  return null;
}

/**
 * Get currency with preference check and auto-detection
 */
export async function getCurrency(): Promise<CurrencyCode> {
  // First check if user has a saved preference
  const preference = getCurrencyPreference();
  if (preference) {
    return preference;
  }

  // Otherwise detect and save
  const detected = await detectCurrency();
  saveCurrencyPreference(detected);
  return detected;
}
