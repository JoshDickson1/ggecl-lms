import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} onReset={() => this.setState({ error: null })} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({ error, onReset }: { error: Error; onReset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#080e19] px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-red-100 dark:bg-red-950/30 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Something went wrong</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            An unexpected error occurred. You can try refreshing or go back to the home page.
          </p>
        </div>

        {import.meta.env.DEV && (
          <div className="text-left rounded-2xl bg-gray-900 dark:bg-black/40 border border-gray-200 dark:border-white/[0.07] p-4 overflow-auto max-h-40">
            <p className="text-[11px] font-mono text-red-400 whitespace-pre-wrap break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
              bg-blue-600 hover:bg-blue-500 text-white transition-colors
              shadow-[0_4px_14px_rgba(59,130,246,0.35)]"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <a
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
              border border-gray-200 dark:border-white/[0.08]
              text-gray-600 dark:text-gray-400
              hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all"
          >
            <Home className="w-4 h-4" /> Home
          </a>
        </div>
      </div>
    </div>
  );
}
