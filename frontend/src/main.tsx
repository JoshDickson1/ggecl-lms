import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { CartProvider } from "./hooks/useCart.tsx";
import { DashboardAuthProvider } from "./hooks/useDashboardUser.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import "@livekit/components-styles";
import "./index.css";
import App from "./App.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,   // 5 min — data is fresh, no refetch on revisit
      gcTime:    1000 * 60 * 15,  // 15 min — keep inactive cache alive across page navigations
      refetchOnWindowFocus: false, // don't refetch just because user alt-tabbed back
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <CartProvider>
            <DashboardAuthProvider>
              <App />
            </DashboardAuthProvider>
          </CartProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);