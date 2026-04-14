import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { CartProvider } from "./hooks/useCart.tsx";
import { DashboardAuthProvider } from "./hooks/useDashboardUser.tsx";
import "./index.css";
import App from "./App.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CartProvider>
          <DashboardAuthProvider>
            <App />
          </DashboardAuthProvider>
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);