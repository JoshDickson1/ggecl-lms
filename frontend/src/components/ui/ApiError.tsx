import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/** Inline banner — use inside a page that partially fails */
export function ApiError({ message = "Failed to load data.", onRetry, className = "" }: Props) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 ${className}`}>
      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
      <p className="text-sm text-red-700 dark:text-red-400 flex-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex-shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      )}
    </div>
  );
}

/** Full-page error — use when the whole page cannot render without the data */
export function ApiErrorPage({
  message = "Something went wrong. Please try again.",
  onRetry,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <div>
        <p className="text-base font-bold text-gray-700 dark:text-gray-300">{message}</p>
        <p className="text-sm text-gray-400 mt-1">Check your connection and try again.</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      )}
    </div>
  );
}
