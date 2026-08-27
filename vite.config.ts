import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tanstackStart(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    middlewareMode: false,
    port: 5173,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Lowercase required: Vite's esbuild-target→lightningcss conversion uses
    // a case-sensitive regex (/es(6|\d{4})/) — "ES2022" silently fails to
    // match and falls through to lightningcss as a literal, unrecognized
    // browser-target string, which then throws "Unsupported target".
    target: "es2022",
  },
});
