import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev: `npm run dev` proxies /api -> backend on :8080.
// Build: `npm run build` writes the site into ../backend/public (served by the backend).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { "/api": { target: "http://localhost:8080", changeOrigin: true } } },
  build: { outDir: "../backend/public", emptyOutDir: true },
});
