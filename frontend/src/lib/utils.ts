import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Check if an image URL is valid (not a placeholder or broken)
 * @param url - Image URL to validate
 * @returns true if URL is valid and usable
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  // Filter out placeholder URLs from backend
  if (url.includes('example.com')) return false;
  if (url.includes('placeholder')) return false;
  return true;
}

/**
 * Get a safe image URL or return null if invalid
 * @param url - Image URL to validate
 * @returns Valid URL or null
 */
export function getSafeImageUrl(url: string | null | undefined): string | null {
  return isValidImageUrl(url) ? url! : null;
}
