import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./hooks/useCart.tsx";
import { DashboardAuthProvider } from "./hooks/useDashboardUser.tsx";
import "./index.css";
import App from "./App";
 
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <CartProvider>
        <DashboardAuthProvider>
          <App />
        </DashboardAuthProvider>
      </CartProvider>
    </ThemeProvider>
  </StrictMode>
);
