import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: "/", // ✅ Ensure correct path resolution
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: "../static",     // ✅ Build directly into Flask's static folder
    emptyOutDir: true,       // ✅ Clear old builds
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
