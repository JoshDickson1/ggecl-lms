import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

   // Disable type checking during build for faster builds
   build: {
    // Set to false to skip type checking completely during build
    // Vite will still bundle but won't fail on TS errors
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress specific warnings if needed
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
        warn(warning)
      },
    },
  },
  // Optional: configure esbuild to be more lenient
  esbuild: {
    logOverride: { 
      'this-is-undefined-in-esm': 'silent' 
    },
  },
});
