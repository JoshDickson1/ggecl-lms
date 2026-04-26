// SafeImage.tsx - Component that handles placeholder/broken images gracefully
import { useState } from "react";
import { isValidImageUrl } from "@/lib/utils";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | null | undefined;
  fallback?: React.ReactNode;
  alt: string;
}

/**
 * Image component that filters out placeholder URLs and handles errors gracefully
 * @param src - Image URL (can be null/undefined/placeholder)
 * @param fallback - React node to show if image is invalid or fails to load
 * @param alt - Alt text for the image
 * @param ...props - Other img attributes (className, etc.)
 */
export function SafeImage({ src, fallback, alt, ...props }: SafeImageProps) {
  const [error, setError] = useState(false);
  
  // Show fallback if URL is invalid or image failed to load
  if (!isValidImageUrl(src) || error) {
    return <>{fallback}</>;
  }
  
  return (
    <img
      src={src!}
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  );
}
