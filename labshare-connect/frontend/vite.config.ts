import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: "/", // ✅ Correct base
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: path.resolve(__dirname, "../static"), // ✅ Safe absolute path
    emptyOutDir: true,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));